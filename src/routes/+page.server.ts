import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Octokit, RequestError } from 'octokit';
import { fromPromise } from 'neverthrow';
import { db, seed, table } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { slugify } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { modpacks: [] };
	}
	// Get all the modpacks for the current user
	const modpacks = await db.select().from(table.modpack);
	return { modpacks };
};

export const actions: Actions = {
	seedDB: async ({ cookies, locals }) => {
		seed();
	}
};
