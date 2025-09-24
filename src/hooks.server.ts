import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { resolve as resolveUrl } from '$app/paths';

import * as auth from '$lib/server/auth';

const handleAuthentication: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

const handleAuthorization: Handle = async ({ event, resolve }) => {
	if (event.route.id === '/login' && event.locals.session) {
		redirect(302, resolveUrl('/'));
	}

	if (event.route.id !== '/login' && !event.locals.session) {
		redirect(302, resolveUrl('/login'));
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAuthentication, handleAuthorization);
