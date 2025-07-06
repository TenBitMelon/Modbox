import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: locals.user ?? null };
};
