import { db, table } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { modrinth } from '$lib/server/modrinth';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const modpackId = params.id;
	const modpack = (await db.select().from(table.modpack).where(eq(table.modpack.id, modpackId))).at(
		0
	);

	if (!modpack) error(404);

	const query = url.searchParams.get('query') ?? '';

	const mods = await modrinth.search(query);

	return { modpack, mods };
};

export const actions = {
	addMod: async ({ cookies, locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to add a mod' });
		}

		const formData = await request.formData();
		const mod = formData.get('mod')?.toString();

		if (!mod) {
			return fail(400, { message: 'You must provide a mod name' });
		}

		const modpackId = params.id;

		await db
			.update(table.modpack)
			.set({
				mods: sql`array_append(${table.modpack.mods}, ${mod})` // TODO: This is bad right? I think so because its a raw SQL expression
			})
			.where(eq(table.modpack.id, modpackId));

		return { success: true };
	},
	removeMod: async ({ cookies, locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to remove a mod' });
		}

		const formData = await request.formData();
		const mod = formData.get('mod')?.toString();

		if (!mod) {
			return fail(400, { message: 'You must provide a mod name' });
		}

		const modpackId = params.id;

		await db
			.update(table.modpack)
			.set({
				mods: sql`array_remove(${table.modpack.mods}, ${mod})` // TODO: This is bad right? I think so because its a raw SQL expression
			})
			.where(eq(table.modpack.id, modpackId));

		return { success: true };
	}
};
