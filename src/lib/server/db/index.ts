import { drizzle } from 'drizzle-orm/libsql';

import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from '$env/static/private';

import * as schema from './schema';

export const db = drizzle({
	connection: {
		url: TURSO_CONNECTION_URL,
		authToken: TURSO_AUTH_TOKEN,
	},
	schema,
	casing: 'snake_case',
});
