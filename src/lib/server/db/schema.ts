import { relations, sql } from 'drizzle-orm';
import { customType, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { LocalDate } from '../../dates';

const customDate = customType<{ data: LocalDate }>({
	dataType() {
		return 'text';
	},
	fromDriver(value: unknown): LocalDate {
		if (typeof value !== 'string') throw new Error('invalid date in db: ' + value);

		return LocalDate.fromIsoString(value);
	},
	toDriver(value: LocalDate): string {
		return value.toIsoString();
	},
});

const auditColumns = {
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer({ mode: 'timestamp' })
		.notNull()
		.$onUpdate(() => new Date()),
};

export const users = sqliteTable('users', {
	id: text().primaryKey(),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
	...auditColumns,
});

export const sessions = sqliteTable('sessions', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	...auditColumns,
});

export const tasks = sqliteTable('tasks', {
	id: integer().primaryKey({ autoIncrement: true }),
	userId: text()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text().notNull(),
	nextDueDate: customDate().notNull(),
	intervalCount: integer().notNull(),
	intervalType: text({ enum: ['days', 'months'] })
		.notNull()
		.default('days'),
	repeatMode: text({ enum: ['fromDueDate', 'fromCompletionDate'] }).notNull(),
	archived: integer({ mode: 'boolean' }).notNull(),
	archivedAt: integer({ mode: 'timestamp' }),
	...auditColumns,
});

export const tasksRelations = relations(tasks, ({ many }) => ({
	tasksCompleted: many(tasksCompleted),
}));

export const tasksCompleted = sqliteTable(
	'tasks_completed',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		taskId: integer()
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		dueDate: customDate().notNull(),
		completionDate: customDate().notNull(),
		...auditColumns,
	},
	(table) => [
		uniqueIndex('tasks_completed_idx_task_id_due_date_completion_date').on(
			table.taskId,
			table.dueDate,
			table.completionDate,
		),
	],
);

export const tasksCompletedRelations = relations(tasksCompleted, ({ one }) => ({
	task: one(tasks, {
		fields: [tasksCompleted.taskId],
		references: [tasks.id],
	}),
}));

export type SessionInsert = typeof sessions.$inferInsert;
