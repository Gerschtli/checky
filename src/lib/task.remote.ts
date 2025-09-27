import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { command, form, query } from '$app/server';

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

export const completeTask = command(
	z.object({
		id: z.int(),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.archived) error(400);

		const completionDate = LocalDate.now();

		await db.insert(table.tasksCompleted).values({
			taskId: task.id,
			dueDate: task.nextDueDate,
			completionDate: completionDate,
		});

		await db
			.update(table.tasks)
			.set({
				nextDueDate: (task.repeatMode === 'fromCompletionDate'
					? completionDate
					: task.nextDueDate
				).addDays(task.intervalDays),
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const uncompleteTask = command(
	z.object({
		id: z.int(),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.archived) error(400);

		const taskCompleted = await db.query.tasksCompleted.findFirst({
			where: and(
				eq(table.tasksCompleted.taskId, task.id),
				eq(table.tasksCompleted.completionDate, LocalDate.now()),
			),
		});

		if (!taskCompleted) error(400);

		await db.delete(table.tasksCompleted).where(eq(table.tasksCompleted.id, taskCompleted.id));

		await db
			.update(table.tasks)
			.set({
				nextDueDate: taskCompleted.dueDate,
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
	const task = await db.query.tasks.findFirst({
		where: eq(table.tasks.id, id),
	});

	if (!task) error(404);

	return task;
});

export const getAllTasks = query(async () => {
	const tasks = await db.query.tasks.findMany({
		where: eq(table.tasks.archived, false),
		orderBy: table.tasks.nextDueDate,
		with: {
			tasksCompleted: {
				where: eq(table.tasksCompleted.completionDate, LocalDate.now()),
			},
		},
	});

	return tasks.map((t) => ({
		id: t.id,
		title: t.title,
		nextDueDate: t.nextDueDate,
		intervalDays: t.intervalDays,
		completed: t.tasksCompleted.length > 0,
	}));
});
