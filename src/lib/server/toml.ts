import toml from 'smol-toml';
import { GitHubService, type GitHubFile } from './github';
import { hashString, encodeStringToBase64 } from './encoding';
import type { ModLoaders, ModLoadersType } from '$lib/mod-loaders';

export interface ModpackIndex {
	'hash-format': string;
	files:
		| Array<{
				file: string;
				hash: string;
				metafile: boolean;
		  }>
		| undefined;
}

export interface PackToml {
	name: string;
	creator: string;
	versions: {
		minecraft: string;
	} & {
		[loader in ModLoadersType]: string;
	};
	index: {
		file: string;
		'hash-format': string;
		hash: string;
	};
	[key: string]: any;
}

export class TomlManager {
	constructor(private github: GitHubService) {}

	async getPackToml(): Promise<{ content: PackToml; raw: string; sha: string }> {
		const { content: raw, sha } = await this.github.getFile('pack.toml');
		const content = toml.parse(raw) as PackToml;
		return { content, raw, sha };
	}

	async getIndexToml(): Promise<{ content: ModpackIndex; raw: string; sha: string }> {
		try {
			const { content: raw, sha } = await this.github.getFile('index.toml');
			const content = toml.parse(raw) as unknown as ModpackIndex;
			return { content, raw, sha };
		} catch (error) {
			// Create default index if it doesn't exist
			const defaultIndex: ModpackIndex = {
				'hash-format': 'sha256',
				files: [],
			};
			const raw = toml.stringify(defaultIndex);
			return { content: defaultIndex, raw, sha: '' };
		}
	}

	async addModsBatch(
		mods: {
			slug: string;
			content: string;
		}[],
		commitMessage: string,
	): Promise<void> {
		// Get current state
		const { content: index } = await this.getIndexToml();
		const { content: pack } = await this.getPackToml();

		// Prepare all files for the commit
		const filesToCommit: GitHubFile[] = [];

		// Add/update mod files and update index
		for (const mod of mods) {
			const modFilePath = `mods/${mod.slug}.toml`;
			const modHash = hashString(mod.content);

			// Check if files is on index
			if (index.files === undefined) index.files = [];

			// Remove existing entry if it exists
			index.files = index.files.filter((f) => f.file !== modFilePath);

			// Add new entry
			index.files.push({
				file: modFilePath,
				hash: modHash,
				metafile: true,
			});

			// Add mod file to commit
			filesToCommit.push({
				path: modFilePath,
				content: mod.content,
			});
		}

		// Update pack.toml with new index hash
		const indexContent = toml.stringify(index);
		const indexHash = encodeStringToBase64(hashString(indexContent));
		pack.index.hash = indexHash;

		// Add index.toml to commit
		filesToCommit.push({
			path: 'index.toml',
			content: indexContent,
		});

		// Add pack.toml to commit
		filesToCommit.push({
			path: 'pack.toml',
			content: toml.stringify(pack),
		});

		// Create single commit with all changes
		await this.github.createCommit({
			message: commitMessage,
			files: filesToCommit,
		});
	}

	async removeModsBatch(modSlugs: string[], commitMessage: string): Promise<void> {
		// Get current state
		const { content: index } = await this.getIndexToml();
		const { content: pack } = await this.getPackToml();

		// Remove mod file entries from index
		for (const modSlug of modSlugs) {
			const modFilePath = `mods/${modSlug}.toml`;
			if (index.files === undefined) index.files = [];
			index.files = index.files.filter((f) => f.file !== modFilePath);
		}

		// Update pack.toml with new index hash
		const indexContent = toml.stringify(index);
		const indexHash = encodeStringToBase64(hashString(indexContent));
		pack.index.hash = indexHash;

		// Prepare files for commit
		const filesToCommit: GitHubFile[] = [
			{
				path: 'index.toml',
				content: indexContent,
			},
			{
				path: 'pack.toml',
				content: toml.stringify(pack),
			},
		];

		// Note: GitHub GraphQL API doesn't support file deletion in createCommitOnBranch
		// The mod files will remain in the repository but won't be referenced in the index
		// You could implement file deletion using the REST API if needed

		// Create single commit with all changes
		await this.github.createCommit({
			message: commitMessage,
			files: filesToCommit,
		});
	}

	// Check if a mod already exists in the index
	async modExists(modSlug: string): Promise<boolean> {
		try {
			const { content: index } = await this.getIndexToml();
			const modFilePath = `mods/${modSlug}.toml`;
			if (index.files === undefined) index.files = [];
			return index.files.some((f) => f.file === modFilePath);
		} catch {
			return false;
		}
	}

	// Get all existing mods from index
	async getExistingMods(): Promise<string[]> {
		try {
			const { content: index } = await this.getIndexToml();
			if (index.files === undefined) index.files = [];
			return index.files
				.filter((f) => f.file.startsWith('mods/') && f.file.endsWith('.toml'))
				.map((f) => f.file.replace('mods/', '').replace('.toml', ''));
		} catch {
			return [];
		}
	}
}

export function createInitialModpackFiles(
	name: string,
	creator: string,
	mcVersion: string,
	loader: string,
	loaderversion: string,
): { packToml: string; indexToml: string } {
	const indexToml = `hash-format = "sha256"`;

	const packToml = `name = "${name}"
creator = "${creator}"

[index]
file = "index.toml"
hash-format = "sha256"
hash = "${hashString(indexToml)}"

[versions]
minecraft = "${mcVersion}"
${loader} = "${loaderversion}"`;

	return {
		packToml,
		indexToml,
	};
}
