import { Octokit } from 'octokit';
import { fromPromise } from 'neverthrow';
import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { parseGitHubUrl } from '$lib';

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
				ref,
			}),
			(e) => e,
		);

		if (result.isErr()) {
			throw new Error(`Error fetching ${path}: ${result.error}`);
		}

		const { data, status } = result.value;

		if (status !== 200 || Array.isArray(data) || data.type !== 'file') {
			throw new Error(`Invalid file response for ${path}`);
		}

		const content = new TextDecoder().decode(decodeBase64(data.content.replaceAll('\n', '')));

		return { content, sha: data.sha };
	}

	async createCommit(commit: GitHubCommit): Promise<void> {
		const branch = commit.branch || 'main';

		// Get the current HEAD commit
		const refResult = await fromPromise(
			this.octokit.rest.git.getRef({
				owner: this.owner,
				repo: this.repo,
				ref: `heads/${branch}`,
			}),
			(e) => e,
		);

		if (refResult.isErr()) {
			throw new Error('Failed to get branch reference');
		}

		const expectedHeadOid = refResult.value.data.object.sha;

		// Prepare file changes
		const fileChanges = commit.files.map((file) => ({
			path: file.path,
			contents: encodeBase64(new TextEncoder().encode(file.content)),
		}));

		// Create the commit using GraphQL
		const mutation = `
      mutation($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) {
          commit {
            url
            oid
          }
        }
      }
    `;

		const variables = {
			input: {
				branch: {
					repositoryNameWithOwner: `${this.owner}/${this.repo}`,
					branchName: branch,
				},
				message: {
					headline: commit.message,
				},
				fileChanges: {
					additions: fileChanges,
				},
				expectedHeadOid,
			},
		};

		const result = await fromPromise(this.octokit.graphql(mutation, variables), (e) => e);

		if (result.isErr()) {
			throw new Error(`Failed to create commit: ${result.error}`);
		}
	}
}
