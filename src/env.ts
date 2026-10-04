import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	TURSO_AUTH_TOKEN: { static: true },
	TURSO_CONNECTION_URL: { static: true },
});
