import { encodeBase32LowerCase } from '@oslojs/encoding';
import { error, invalid, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import z from 'zod';

import { resolve } from '$app/paths';
import { form, getRequestEvent, query } from '$app/server';

import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const logout = form(async () => {
	const event = getRequestEvent();

	if (!event.locals.session) {
		error(401);
	}

	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	await getUser().refresh();
	await getUserOptional().refresh();

	redirect(302, resolve('/login'));
});

export const getUser = query(async () => {
	const { locals } = getRequestEvent();

	if (!locals.user) redirect(302, resolve('/login'));

	return locals.user;
});

export const getUserOptional = query(async () => {
	const { locals } = getRequestEvent();

	return locals.user;
});

export const login = form(
	z.object({
		username: z.string().min(3),
		_password: z.string().min(6),
	}),
	async ({ username, _password: password }) => {
		const results = await db
			.select()
			.from(table.users)
			.where(eq(table.users.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			invalid('Incorrect username or password');
		}

		const validPassword = verify(existingUser.passwordHash, password);
		if (!validPassword) {
			invalid('Incorrect username or password');
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(getRequestEvent(), sessionToken, session.expiresAt);

		await getUser().refresh();
		await getUserOptional().refresh();

		redirect(302, resolve('/'));
	},
);

export const register = form(
	z.object({
		username: z.string().min(3),
		_password: z.string().min(6),
	}),
	async ({ username, _password: password }) => {
		const userId = generateUserId();
		const passwordHash = hash(password);

		try {
			await db.insert(table.users).values({ id: userId, username, passwordHash });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(getRequestEvent(), sessionToken, session.expiresAt);
		} catch {
			error(500, { message: 'An error has occurred' });
		}

		await getUser().refresh();
		await getUserOptional().refresh();

		redirect(302, resolve('/'));
	},
);

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// TODO: use argon2
/*

import { hash, verify } from '@node-rs/argon2';

verify(existingUser.passwordHash, password, {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
});
await hash(password, {
	// recommended minimum parameters
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
});

*/

function verify(passwordHash: string, password: string) {
	return password === passwordHash;
}

function hash(password: string) {
	return password;
}
