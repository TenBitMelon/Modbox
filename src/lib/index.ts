import { ok, err, Result } from 'neverthrow';
import type { Project, ProjectVersion, VersionFile } from 'typerinth';

export function slugify(title: string): string {
	// Normalize the string using NFKD form and remove diacritics
	title = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

	// Convert to lowercase
	title = title.toLowerCase();

	// Replace non-alphanumeric characters with hyphens
	title = title.replace(/[^a-z0-9]+/g, '-');

	// Trim leading/trailing hyphens
	title = title.replace(/^[-]+|[-]+$/g, '');

	return title;
}

export function parseGitHubUrl(url: string): Result<{ owner: string; repo: string }, null> {
	const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+)(?:\/)?$/);

	if (!match) {
		return err(null); // Not a valid GitHub repo URL
	}

	const [, owner, repo] = match;
	return ok({ owner, repo });
}

export function createPackToml(
	name: string,
	creator: string,
	mcVersion: string,
	loader: string,
	loaderversion: string
): string {
	return `
name = ${name}
creator = ${creator}

[versions]
minecraft = ${mcVersion}
${loader} = ${loaderversion}`;
}

// Ripped straight from Packwiz (https://github.com/packwiz/packwiz/blob/main/core/versionutil.go)

export interface MavenMetadata {
	metadata: {
		groupId: string[];
		artifactId: string[];
		versioning: {
			release?: string[];
			latest?: string[];
			versions: [{ version: string[] }];
			lastUpdated?: string[];
		};
	};
}

export type VersionListGetter = (mcVersion: string) => Promise<[string[], string]>;

export interface ModLoaderComponent {
	name: string;
	friendlyName: string;
	versionListGetter: VersionListGetter;
}

export const ModLoaders: Record<string, ModLoaderComponent> = {
	fabric: {
		name: 'fabric',
		friendlyName: 'Fabric loader',
		versionListGetter: fetchMavenVersionList(
			'https://maven.fabricmc.net/net/fabricmc/fabric-loader/maven-metadata.xml'
		)
	},
	// forge: {
	// 	name: 'forge',
	// 	friendlyName: 'Forge',
	// 	versionListGetter: fetchMavenVersionPrefixedListStrip(
	// 		'https://files.minecraftforge.net/maven/net/minecraftforge/forge/maven-metadata.xml',
	// 		'Forge'
	// 	)
	// },
	// liteloader: {
	// 	name: 'liteloader',
	// 	friendlyName: 'LiteLoader',
	// 	versionListGetter: fetchMavenVersionPrefixedList(
	// 		'https://repo.mumfrey.com/content/repositories/snapshots/com/mumfrey/liteloader/maven-metadata.xml',
	// 		'LiteLoader'
	// 	)
	// },
	quilt: {
		name: 'quilt',
		friendlyName: 'Quilt loader',
		versionListGetter: fetchMavenVersionList(
			'https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-loader/maven-metadata.xml'
		)
	},
	neoforge: {
		name: 'neoforge',
		friendlyName: 'NeoForge',
		versionListGetter: fetchNeoForge()
	}
};

console.log(ModLoaders);

async function fetchMavenXml(url: string): Promise<Document> {
	const response = await fetch(url, {
		headers: {
			Accept: 'application/xml'
		}
	});
	const text = await response.text();
	return new DOMParser().parseFromString(text, 'application/xml');
}

function fetchMavenVersionList(url: string) {
	return async (mcVersion: string): Promise<[string[], string]> => {
		const xml = await fetchMavenXml(url);
		const versions = Array.from(xml.querySelectorAll('version')).map((v) => v.textContent || '');
		const release = xml.querySelector('release')?.textContent || '';
		return [versions, release];
	};
}

function fetchMavenVersionFiltered(
	url: string,
	friendlyName: string,
	filter: (version: string, mcVersion: string) => boolean
) {
	return async (mcVersion: string): Promise<[string[], string]> => {
		const xml = await fetchMavenXml(url);
		const allVersions = Array.from(xml.querySelectorAll('version')).map((v) => v.textContent || '');
		const allowedVersions = allVersions.filter((v) => filter(v, mcVersion));
		if (allowedVersions.length === 0) {
			throw new Error(`no ${friendlyName} versions available for this Minecraft version`);
		}
		const release = xml.querySelector('release')?.textContent || '';
		const latest = xml.querySelector('latest')?.textContent || '';
		if (filter(release, mcVersion)) return [allowedVersions, release];
		if (filter(latest, mcVersion)) return [allowedVersions, latest];
		return [allowedVersions, allowedVersions[allowedVersions.length - 1]];
	};
}

function fetchMavenVersionPrefixedList(url: string, friendlyName: string) {
	return fetchMavenVersionFiltered(url, friendlyName, hasPrefixSplitDash);
}

function fetchMavenVersionPrefixedListStrip(url: string, friendlyName: string) {
	const noStrip = fetchMavenVersionPrefixedList(url, friendlyName);
	return async (mcVersion: string): Promise<[string[], string]> => {
		const [versions, latestVersion] = await noStrip(mcVersion);
		return [
			versions.map((v) => removeMcVersion(v, mcVersion)),
			removeMcVersion(latestVersion, mcVersion)
		];
	};
}

function removeMcVersion(str: string, mcVersion: string): string {
	return str
		.split('-')
		.filter((component) => component !== mcVersion)
		.join('-');
}

function hasPrefixSplitDash(str: string, prefix: string): boolean {
	const parts = str.split('-');
	return parts.length > 1 && parts[0] === prefix;
}

function fetchNeoForge() {
	const neoforgeOld = fetchMavenVersionPrefixedListStrip(
		'https://maven.neoforged.net/releases/net/neoforged/forge/maven-metadata.xml',
		'NeoForge'
	);
	const neoforgeNew = fetchMavenWithNeoForgeStyleVersions(
		'https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml',
		'NeoForge'
	);

	return async (mcVersion: string): Promise<[string[], string]> => {
		return mcVersion === '1.20.1' ? await neoforgeOld(mcVersion) : await neoforgeNew(mcVersion);
	};
}

function fetchMavenWithNeoForgeStyleVersions(url: string, friendlyName: string) {
	return fetchMavenVersionFiltered(url, friendlyName, (neoforgeVersion, mcVersion) => {
		const mcSplit = mcVersion.split('.');
		if (mcSplit.length < 2) return false;
		const mcMajor = mcSplit[1];
		const mcMinor = mcSplit.length > 2 ? mcSplit[2] : '0';
		return neoforgeVersion.startsWith(`${mcMajor}.${mcMinor}`);
	});
}

export function componentToFriendlyName(component: string): string {
	if (component === 'minecraft') return 'Minecraft';
	return ModLoaders[component]?.friendlyName || component;
}

export function highestSliceIndex(slice: string[], values: string[]): number {
	let highest = -1;
	for (const val of values) {
		const idx = slice.indexOf(val);
		if (idx > highest) highest = idx;
	}
	return highest;
}

interface ForgeRecommended {
	homepage: string;
	promos: Record<string, string>;
}

export async function getForgeRecommended(mcVersion: string): Promise<string> {
	try {
		const response = await fetch(
			'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json',
			{
				headers: {
					Accept: 'application/json'
				}
			}
		);
		const data: ForgeRecommended = await response.json();
		return data.promos[`${mcVersion}-recommended`] || data.promos[`${mcVersion}-latest`] || '';
	} catch (err) {
		console.error(err);
		return '';
	}
}

export function createModToml(mod: Project, modversion: ProjectVersion): string {
	return `
name = "${mod.title}"
filename = "${modversion.files[0].file_type}"
side = "both"

[download]
url = "${modversion.files[0].url}"
hash-format = "${Object.keys(modversion.files[0].hashes)[0]}"
hash = "${Object.values(modversion.files[0].hashes)[0]}"

[update]
[update.modrinth]
mod-id = "${mod.id}"
version = "${modversion.id}"
`;
}
