import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text().primaryKey(),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
});

export const session = sqliteTable('session', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => user.id),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
});

export const task = sqliteTable('task', {
	id: integer().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	nextDueDate: text().notNull(),
	intervalDays: integer().notNull(),
	repeatMode: text({ enum: ['fromDueDate', 'fromCompletionDate'] }).notNull(),
	archived: integer({ mode: 'boolean' }).notNull(),
	created_at: integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updated_at: integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`), //.$onUpdate(() => sql`(unixepoch())`),
	archived_at: integer({ mode: 'timestamp' }),
});

export const taskCompleted = sqliteTable('task_completed', {
	id: integer().primaryKey({ autoIncrement: true }),
	taskId: integer()
		.notNull()
		.references(() => task.id),
	completionDate: text().notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
