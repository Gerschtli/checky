import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import z from 'zod';

import { form, query } from '$app/server';

import * as table from '$lib/server/db/schema';

import { LocalDate } from './dates';
import { db } from './server/db';

export const createTask = form(
	z.object({
		title: z.string().trim().min(1),
		nextDueDate: z.iso.date().transform((d) => LocalDate.of(d)),
		intervalDays: z.coerce.number<string>().int().min(1),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		await db.insert(table.tasks).values({
			title: data.title,
			nextDueDate: data.nextDueDate,
			intervalDays: data.intervalDays,
			repeatMode: data.repeatMode,
			archived: false,
		});

		await getAllTasks().refresh();

		redirect(303, '/');
	},
);

export const editTask = form(
	z.object({
		id: z.coerce.number<string>().int(),
		title: z.string().trim().min(1),
		nextDueDate: z.iso.date().transform((d) => LocalDate.of(d)),
		intervalDays: z.coerce.number<string>().int().min(1),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		await db
			.update(table.tasks)
			.set({
				title: data.title,
				nextDueDate: data.nextDueDate,
				intervalDays: data.intervalDays,
				repeatMode: data.repeatMode,
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();

		redirect(303, '/');
	},
);

export const completeTask = form(
	z.object({
		id: z.coerce.number<string>().int(),
		completionDate: z.iso.date().transform((d) => LocalDate.of(d)),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.archived) error(400);

		await db.insert(table.tasksCompleted).values({
			taskId: task.id,
			completionDate: data.completionDate,
		});

		await db
			.update(table.tasks)
			.set({
				nextDueDate: (task.repeatMode === 'fromCompletionDate'
					? data.completionDate
					: task.nextDueDate
				).addDays(task.intervalDays),
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const archiveTask = form(
	z.object({
		id: z.coerce.number<string>().int(),
	}),
	async (data) => {
		await db
			.update(table.tasks)
			.set({
				archived: true,
				archivedAt: new Date(),
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const pauseTask = form(
	z.object({
		id: z.coerce.number<string>().int(),
		countDays: z.coerce.number<string>().int(),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		await db
			.update(table.tasks)
			.set({
				nextDueDate: task.nextDueDate.addDays(data.countDays),
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const getTaskById = query(z.int(), async (id) => {
	const result = await db.select().from(table.tasks).where(eq(table.tasks.id, id));

	if (result.length === 0) error(404);

	return result[0];
});

export const getAllTasks = query(async () => {
	const tasks = await db
		.select()
		.from(table.tasks)
		.where(eq(table.tasks.archived, false))
		.orderBy(table.tasks.nextDueDate);

	return tasks.map((t) => ({ ...t, completed: false }));
});
