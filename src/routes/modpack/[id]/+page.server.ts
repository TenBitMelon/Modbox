import { db, table } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm/errors';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { modrinth } from '$lib/server/modrinth';
import { Octokit, RequestError } from 'octokit';
import { fromPromise } from 'neverthrow';
import { parseGitHubUrl } from '$lib';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const modpackId = params.id;
	// const modpack = (await db.select().from(table.modpack).where(eq(table.modpack.id, modpackId))).at(
	// 	0
	// );
	// if (!modpack) error(404);

	// const modpack = await db.query.modpack.findFirst({
	// 	where: eq(table.modpack.id, modpackId),
	// 	with: {
	// 		creatorId: true
	// 	}
	// });

	const res = await fromPromise(
		db
			.select({
				modpack: table.modpack,
				creator: table.user
			})
			.from(table.modpack)
			.where(eq(table.modpack.id, modpackId))
			.leftJoin(table.user, eq(table.modpack.creatorId, table.user.id))
			.limit(1),
		(e) => e as DrizzleError
	).map((result) => result.at(0));

	if (res.isErr()) error(500, { message: 'DB error' });
	if (!res.value) error(404, { message: 'Modpack not found' });
	if (!res.value.creator) error(404, { message: 'Modpack creator not found' });

	const { modpack, creator } = res.value;

	const github = new Octokit({
		auth: creator.githubToken
	});

	const githubUrl = modpack.githubUrl;
	const urlres = parseGitHubUrl(githubUrl);
	if (urlres.isErr()) error(500, { message: 'Invalid GitHub URL' });
	const { owner, repo } = urlres.value;

	const packToml = await fromPromise(
		github.rest.repos.getContent({
			owner: owner,
			repo: repo,
			path: 'pack.toml'
		}),
		(e) => e as RequestError
	);

	if (packToml.isErr()) error(500, { message: 'Error fetching pack.toml' });

	const query = url.searchParams.get('query') ?? '';
	const searchResults = await modrinth.search(query);

	if (packToml.value.status !== 200) {
		error(500, { message: 'Error fetching pack.toml' });
	}

	if (Array.isArray(packToml.value.data)) {
		error(500, { message: 'Error fetching pack.toml' });
	}

	if (packToml.value.data.type !== 'file') {
		error(500, { message: 'Error fetching pack.toml' });
	}

	const contents = packToml.value.data.content;

	return { modpack, searchResults, packToml: contents };
};

export const actions = {
	addMod: async ({ cookies, locals, params, request }) => {
		// const { user } = locals;
		// if (!user) {
		// 	return fail(400, { message: 'You must be logged in to add a mod' });
		// }

		// const formData = await request.formData();
		// const mod = formData.get('mod')?.toString();

		// if (!mod) {
		// 	return fail(400, { message: 'You must provide a mod name' });
		// }

		// const modpackId = params.id;

		// await db
		// 	.update(table.modpack)
		// 	.set({
		// 		mods: sql`array_append(${table.modpack.mods}, ${mod})` // TODO: This is bad right? I think so because its a raw SQL expression
		// 	})
		// 	.where(eq(table.modpack.id, modpackId));

		return { success: true };
	},
	removeMod: async ({ cookies, locals, params, request }) => {
		// const { user } = locals;
		// if (!user) {
		// 	return fail(400, { message: 'You must be logged in to remove a mod' });
		// }

		// const formData = await request.formData();
		// const mod = formData.get('mod')?.toString();

		// if (!mod) {
		// 	return fail(400, { message: 'You must provide a mod name' });
		// }

		// const modpackId = params.id;

		// await db
		// 	.update(table.modpack)
		// 	.set({
		// 		mods: sql`array_remove(${table.modpack.mods}, ${mod})` // TODO: This is bad right? I think so because its a raw SQL expression
		// 	})
		// 	.where(eq(table.modpack.id, modpackId));

		return { success: true };
	},
	deleteModpack: async ({ cookies, locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to delete a modpack' });
		}

		const formData = await request.formData();
		const modpackId = params.id;

		await db.delete(table.modpack).where(eq(table.modpack.id, modpackId));

		return { success: true };
	}
};
