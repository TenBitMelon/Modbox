import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.session) {
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
	}

	return redirect(302, '/auth/sign-in');
};
