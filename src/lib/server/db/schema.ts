import { sql } from 'drizzle-orm';
import { customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { LocalDate } from '$lib/dates';

const customDate = customType<{ data: LocalDate }>({
	dataType() {
		return 'text';
	},
	fromDriver(value: unknown): LocalDate {
		if (typeof value !== 'string') throw new Error('invalid date in db: ' + value);

		return LocalDate.of(value);
	},
	toDriver(value: LocalDate): string {
		return value.toString();
	},
});

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
	nextDueDate: customDate().notNull(),
	intervalDays: integer().notNull(),
	repeatMode: text({ enum: ['fromDueDate', 'fromCompletionDate'] }).notNull(),
	archived: integer({ mode: 'boolean' }).notNull(),
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`), //.$onUpdate(() => sql`(unixepoch())`),
	archivedAt: integer({ mode: 'timestamp' }),
});

export const taskCompleted = sqliteTable('task_completed', {
	id: integer().primaryKey({ autoIncrement: true }),
	taskId: integer()
		.notNull()
		.references(() => task.id),
	completionDate: customDate().notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
