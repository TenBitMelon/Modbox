import { sha256 } from '@oslojs/crypto/sha2';
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
	return `name = "${name}"
creator = "${creator}"

[versions]
minecraft = "${mcVersion}"
${loader} = "${loaderversion}"`;
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
