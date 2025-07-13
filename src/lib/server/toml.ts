import toml from 'smol-toml';
import { GitHubService } from './github';
import { hashString, encodeStringToBase64 } from './encoding';
import type { ModLoaders, ModLoadersType } from '$lib/mod-loaders';

export interface ModpackIndex {
	'hash-format': string;
	files: Array<{
		file: string;
		hash: string;
		metafile: boolean;
	}>;
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
		const { content: raw, sha } = await this.github.getFile('index.toml');
		const content = toml.parse(raw) as unknown as ModpackIndex;
		return { content, raw, sha };
	}

	async addModToIndex(modSlug: string, modContent: string): Promise<void> {
		const { content: index, sha: indexSha } = await this.getIndexToml();
		const { content: pack, sha: packSha } = await this.getPackToml();

		// Add mod file entry to index
		const modHash = hashString(modContent);
		const modFilePath = `mods/${modSlug}.toml`;

		// Check if mod already exists in index
		if (index.files.find((f) => f.file === modFilePath)) return;

		// Remove existing entry if it exists
		index.files = index.files.filter((f) => f.file !== modFilePath);

		// Add new entry
		index.files.push({
			file: modFilePath,
			hash: modHash,
			metafile: true
		});

		// Update pack.toml with new index hash
		const indexContent = toml.stringify(index);
		const indexHash = hashString(indexContent);
		pack.index.hash = indexHash;

		// Save all files
		await this.github.createOrUpdateFile(
			'index.toml',
			indexContent,
			`Add ${modSlug} to index`,
			indexSha
		);

		await this.github.createOrUpdateFile(
			'pack.toml',
			toml.stringify(pack),
			`Update pack index for ${modSlug}`,
			packSha
		);

		await this.github.createOrUpdateFile(modFilePath, modContent, `Add ${modSlug} mod file`);
	}

	async removeModFromIndex(modSlug: string): Promise<void> {
		const { content: index, sha: indexSha } = await this.getIndexToml();
		const { content: pack, sha: packSha } = await this.getPackToml();

		const modFilePath = `mods/${modSlug}.toml`;

		// Remove mod file entry from index
		index.files = index.files.filter((f) => f.file !== modFilePath);

		// Update pack.toml with new index hash
		const indexContent = toml.stringify(index);
		const indexHash = hashString(indexContent);
		pack.index.hash = indexHash;

		// Save updated files
		await this.github.createOrUpdateFile(
			'index.toml',
			indexContent,
			`Remove ${modSlug} from index`,
			indexSha
		);

		await this.github.createOrUpdateFile(
			'pack.toml',
			toml.stringify(pack),
			`Update pack index after removing ${modSlug}`,
			packSha
		);

		// TODO: Delete mod file (GitHub API doesn't support file deletion in createOrUpdateFileContents)
	}
}
