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
	taskTags: many(taskTags),
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

export const tags = sqliteTable(
	'tags',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		...auditColumns,
	},
	(table) => [uniqueIndex('tags_idx_user_id_name').on(table.userId, table.name)],
);

export const tagsRelations = relations(tags, ({ many }) => ({
	taskTags: many(taskTags),
}));

export const taskTags = sqliteTable(
	'task_tags',
	{
		id: integer().primaryKey({ autoIncrement: true }),
		taskId: integer()
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		tagId: integer()
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' }),
		...auditColumns,
	},
	(table) => [uniqueIndex('task_tags_idx_task_id_tag_id').on(table.taskId, table.tagId)],
);

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
	task: one(tasks, {
		fields: [taskTags.taskId],
		references: [tasks.id],
	}),
	tag: one(tags, {
		fields: [taskTags.tagId],
		references: [tags.id],
	}),
}));

export type SessionInsert = typeof sessions.$inferInsert;
