import { error, redirect } from '@sveltejs/kit';

import { resolve } from '$app/paths';
import { form, getRequestEvent, query } from '$app/server';

import * as auth from './server/auth';

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
