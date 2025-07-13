import { Octokit, RequestError } from 'octokit';
import { fromPromise } from 'neverthrow';
import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { parseGitHubUrl } from '$lib';
import { error } from '@sveltejs/kit';

export interface GitHubFile {
	path: string;
	content: string;
	sha?: string;
}

export interface GitHubCommit {
	message: string;
	files: GitHubFile[];
	branch?: string;
}

export class GitHubService {
	private octokit: Octokit;
	private owner: string;
	private repo: string;

	constructor(token: string, githubUrl: string) {
		this.octokit = new Octokit({ auth: token });

		const urlResult = parseGitHubUrl(githubUrl);
		if (urlResult.isErr()) {
			throw new Error('Invalid GitHub URL');
		}

		const { owner, repo } = urlResult.value;
		this.owner = owner;
		this.repo = repo;
	}

	async getFile(path: string, ref = 'heads/main'): Promise<{ content: string; sha: string }> {
		const result = await fromPromise(
			this.octokit.rest.repos.getContent({
				owner: this.owner,
				repo: this.repo,
				path,
				ref
			}),
			(e) => e as RequestError
		);

		if (result.isErr()) {
			throw new Error(`Error fetching ${path}: ${result.error.message}`);
		}

		const { data, status } = result.value;

		if (status !== 200 || Array.isArray(data) || data.type !== 'file') {
			throw new Error(`Invalid file response for ${path}`);
		}

		const content = new TextDecoder().decode(decodeBase64(data.content.replaceAll('\n', '')));

		return { content, sha: data.sha };
	}

	async createOrUpdateFile(
		path: string,
		content: string,
		message: string,
		sha?: string,
		branch = 'main'
	): Promise<void> {
		const result = await fromPromise(
			this.octokit.rest.repos.createOrUpdateFileContents({
				owner: this.owner,
				repo: this.repo,
				path,
				message,
				branch,
				sha,
				committer: {
					name: 'ModBox',
					email: 'modbox@modbox.com'
				},
				content: encodeBase64(new TextEncoder().encode(content))
			}),
			(e) => e as RequestError
		);

		if (result.isErr()) {
			throw new Error(`Error updating ${path}: ${result.error.message}`);
		}
	}

	// Future implementation for batch commits
	async createCommit(commit: GitHubCommit): Promise<void> {
		// TODO: Implement batch commit functionality
		// For now, fall back to individual file updates
		for (const file of commit.files) {
			await this.createOrUpdateFile(
				file.path,
				file.content,
				commit.message,
				file.sha,
				commit.branch
			);
		}
	}
}
