import { db, table } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm/errors';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { modrinth } from '$lib/server/modrinth';
import { fromPromise } from 'neverthrow';
import { GitHubService } from '$lib/server/github';
import { TomlManager } from '$lib/server/toml';
import { ModrinthService } from '$lib/server/modrinth';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const modpackId = params.id;

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

	try {
		const github = new GitHubService(creator.githubToken, modpack.githubUrl);
		const { content: packToml } = await github.getFile('pack.toml');

		const query = url.searchParams.get('query') ?? '';
		const searchResults = await modrinth.search(query);

		return {
			modpack,
			searchResults,
			packToml: Buffer.from(packToml).toString('base64')
		};
	} catch (err) {
		error(500, { message: 'Error fetching modpack data' });
	}
};

export const actions = {
	addMod: async ({ locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to add a mod' });
		}

		const formData = await request.formData();
		const modSlug = formData.get('modSlug')?.toString();

		if (!modSlug) {
			return fail(400, { message: 'You must provide a mod slug' });
		}

		try {
			const modpackId = params.id;
			const modpackRes = await fromPromise(
				db.select().from(table.modpack).where(eq(table.modpack.id, modpackId)),
				() => null
			);

			if (modpackRes.isErr()) {
				return fail(400, { message: 'Error fetching modpack' });
			}

			const modpack = modpackRes.value[0];
			const github = new GitHubService(user.githubToken, modpack.githubUrl);
			const tomlManager = new TomlManager(github);
			const modrinthService = new ModrinthService();

			// Get existing mods to avoid duplicates
			const existingMods = new Set(await tomlManager.getExistingMods());

			// Check if mod already exists
			if (existingMods.has(modSlug)) {
				return fail(400, { message: `${modSlug} is already in this modpack` });
			}

			// Get mod and its compatible version
			const { project, version } = await modrinthService.getProjectWithVersion(
				modSlug,
				modpack.loaderId,
				modpack.mcVersion
			);

			// Resolve all dependencies (including transitive ones)
			const allMods = await modrinthService.resolveAllModDependencies(
				project,
				version,
				modpack.loaderId,
				modpack.mcVersion,
				existingMods
			);

			// Create mod file entries for all mods
			const modFileEntries = allMods.map((mod) => ({
				slug: mod.project.slug,
				content: modrinthService.createModTomlContent(mod.project, mod.version)
			}));

			// Create commit message
			const newModNames = allMods.map((mod) => mod.project.title);
			const commitMessage =
				newModNames.length === 1
					? `Add ${newModNames[0]}`
					: `Add ${newModNames[0]} and ${newModNames.length - 1} dependencies`;

			// Add all mods in a single commit
			await tomlManager.addModsBatch(modFileEntries, commitMessage);

			const successMessage =
				newModNames.length === 1
					? `Successfully added ${newModNames[0]}`
					: `Successfully added ${newModNames[0]} and ${newModNames.length - 1} dependencies (${newModNames.slice(1).join(', ')})`;

			return { success: successMessage };
		} catch (err) {
			console.error('Error adding mod:', err);
			return fail(500, { message: err instanceof Error ? err.message : 'Unknown error' });
		}
	},

	removeMod: async ({ locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to remove a mod' });
		}

		const formData = await request.formData();
		const modSlug = formData.get('modSlug')?.toString();

		if (!modSlug) {
			return fail(400, { message: 'You must provide a mod slug' });
		}

		try {
			const modpackId = params.id;
			const modpackRes = await fromPromise(
				db.select().from(table.modpack).where(eq(table.modpack.id, modpackId)),
				() => null
			);

			if (modpackRes.isErr()) {
				return fail(400, { message: 'Error fetching modpack' });
			}

			const modpack = modpackRes.value[0];
			const github = new GitHubService(user.githubToken, modpack.githubUrl);
			const tomlManager = new TomlManager(github);

			// Check if mod exists
			if (!(await tomlManager.modExists(modSlug))) {
				return fail(400, { message: `${modSlug} is not in this modpack` });
			}

			// Remove mod in a single commit
			await tomlManager.removeModsBatch([modSlug], `Remove ${modSlug}`);

			return { success: `Successfully removed ${modSlug}` };
		} catch (err) {
			console.error('Error removing mod:', err);
			return fail(500, { message: err instanceof Error ? err.message : 'Unknown error' });
		}
	},
	deleteModpack: async ({ locals, params }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to delete a modpack' });
		}

		const modpackId = params.id;
		await db.delete(table.modpack).where(eq(table.modpack.id, modpackId));

		return { success: 'Modpack deleted successfully' };
	}
};
