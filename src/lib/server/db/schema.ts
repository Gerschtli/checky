import { sql } from 'drizzle-orm';
import { customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { LocalDate } from '../../dates';

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

export const users = sqliteTable('users', {
	id: text().primaryKey(),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
});

export const sessions = sqliteTable('sessions', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => users.id),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
});

export const tasks = sqliteTable('tasks', {
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

export const tasksCompleted = sqliteTable('tasks_completed', {
	id: integer().primaryKey({ autoIncrement: true }),
	taskId: integer()
		.notNull()
		.references(() => tasks.id),
	completionDate: customDate().notNull(),
});

export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;
