import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/auth/sign-in');
	}
	return { user: locals.user };
};
