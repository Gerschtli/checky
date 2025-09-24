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
	nextDueDate: integer({ mode: 'timestamp' }).notNull(),
	intervalDays: integer().notNull(),
	repeatMode: text({ enum: ['fromDueDate', 'fromCompletionDate'] }).notNull(),
});

export const task_done = sqliteTable('task_done', {
	id: integer().primaryKey({ autoIncrement: true }),
	taskId: integer()
		.notNull()
		.references(() => task.id),
	completionDate: integer({ mode: 'timestamp' }).notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
