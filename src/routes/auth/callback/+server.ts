import { github } from '$lib/server/auth';
import { db, table } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';

import type { RequestEvent } from '../$types';

export async function GET(event: RequestEvent): Promise<Response> {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github-state');

	if (code === null || state === null || storedState === null) {
		return error(400, { message: 'Invalid request' });
	}

	if (state !== storedState) {
		return error(400, { message: 'Invalid state' });
	}

	let tokens: OAuth2Tokens;

	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (_e: unknown) {
		return error(400, { message: 'Invalid code' });
	}

	const accessToken = tokens.accessToken();

	const githubUserResponse = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const githubUser = await githubUserResponse.json();
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	const results = await db.select().from(table.user).where(eq(table.user.githubId, githubUserId));
	const existingUser = results.at(0);
	if (existingUser) {
		await db
			.update(table.user)
			.set({ githubToken: accessToken })
			.where(eq(table.user.githubId, githubUserId));

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/');
	}

	// Create a new user
	try {
		const dbResult = await db
			.insert(table.user)
			.values({
				username: githubUsername,
				githubId: githubUserId,
				githubToken: accessToken
			})
			.returning({
				insertedId: table.user.id
			});

		const userId = dbResult[0].insertedId;

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} catch {
		return redirect(302, '/');
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
