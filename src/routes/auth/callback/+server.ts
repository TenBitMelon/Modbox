import { github } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import * as auth from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { encodeBase32LowerCase } from '@oslojs/encoding';
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
		const userId = generateUserId();
		await db.insert(table.user).values({
			id: userId,
			username: githubUsername,
			githubId: githubUserId,
			githubToken: accessToken
		});

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

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
