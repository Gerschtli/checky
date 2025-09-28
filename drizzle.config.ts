import { defineConfig } from 'drizzle-kit';

if (!process.env.TURSO_CONNECTION_URL) throw new Error('TURSO_CONNECTION_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN! === '' ? undefined : process.env.TURSO_AUTH_TOKEN!,
	},
	verbose: true,
	strict: true,
	casing: 'snake_case',
});
