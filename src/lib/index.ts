import { ok, err, Result } from 'neverthrow';

/**
 * This will not convert to lowercase.\
 * Constrains to ASCII Letters, Digits, Hyphen, and Underscore.
 * @param title String
 * @returns String
 */
export function slugify(title: string): string {
	// Normalize the string using NFKD form and remove diacritics
	title = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

	title = title.replace(/\&/g, 'and');

	// Replace non-alphanumeric characters with hyphens
	title = title.replace(/[^A-Za-z0-9]+/g, '-');

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
