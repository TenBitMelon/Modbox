import { db, table } from '$lib/server/db';
import { error, fail, redirect, type ActionFailure, type Actions } from '@sveltejs/kit';
import { fromPromise } from 'neverthrow';
import { Octokit, RequestError } from 'octokit';
import type { PageServerLoad } from '../$types';
import { slugify } from '$lib';
import { encodeBase64 } from '@oslojs/encoding';
import { GitHubService } from '$lib/server/github';
import { createInitialModpackFiles } from '$lib/server/toml';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/sign-in');
	}
};

export const actions: Actions = {
	createModpack: async ({
		cookies,
		locals,
		request,
	}): Promise<
		ActionFailure<{
			message: string;
			field: string | null;
		}>
	> => {
		const { user } = locals;
		if (!user)
			return fail(400, { message: 'You must be logged in to create a modpack', field: null });

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const version = formData.get('version')?.toString();
		const loader = formData.get('loader')?.toString();
		const loaderVersion = formData.get('loaderVersion')?.toString();

		if (!name)
			return fail(400, { message: 'You must provide a name for the modpack', field: 'name' });
		if (!version)
			return fail(400, { message: 'You must provide a version for the modpack', field: 'version' });
		if (!loader)
			return fail(400, { message: 'You must provide a loader for the modpack', field: 'loader' });
		if (!loaderVersion)
			return fail(400, {
				message: 'You must provide a loader version for the modpack',
				field: 'loaderVersion',
			});

		const slug = slugify(name);

		const github = new Octokit({
			auth: user.githubToken,
		});

		// Create GitHub repository
		const githubResp = await fromPromise(
			github.rest.repos.createForAuthenticatedUser({
				name: slug,
				description: `A ${loader} modpack for Minecraft ${version} generated by ModBox`,
				auto_init: true,
			}),
			(e) => e as RequestError,
		);

		if (githubResp.isErr()) {
			const err = githubResp.error;

			return fail(400, {
				message: `Error creating GitHub repository: ${err.status}, ${err.message}`,
				field: null,
			});
		}

		const githubUrl = githubResp.value.data.html_url;

		const githubService = new GitHubService(user.githubToken, githubUrl);

		const { packToml, indexToml } = createInitialModpackFiles(
			name,
			user.username,
			version,
			loader,
			loaderVersion,
		);

		await githubService.createCommit({
			message: 'Initialize modpack with pack.toml and index.toml',
			files: [
				{
					path: 'pack.toml',
					content: packToml,
				},
				{
					path: 'index.toml',
					content: indexToml,
				},
			],
		});

		const result = await fromPromise(
			db
				.insert(table.modpack)
				.values({
					slug: slug.toLowerCase(),
					creatorId: user.id,
					name: name,
					description: `${name}. A Minecraft ${loader} modpack for version ${version}.`,
					isPublic: true,
					loaderId: loader,
					mcVersion: version,
					githubUrl: githubUrl,
				})
				.returning({
					insertedId: table.modpack.id,
				}),
			(e) => e,
		);

		if (result.isErr()) {
			return fail(400, {
				message: `Error creating modpack in database: ${result.error}`,
				field: null,
			});
		}
		const modpackId = result.value[0].insertedId;
		redirect(300, `/modpack/${modpackId}`);
	},
};
