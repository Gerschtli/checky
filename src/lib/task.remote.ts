import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import z from 'zod';

import { command, form, query } from '$app/server';

import * as table from '$lib/server/db/schema';

import { getUser } from './auth.remote';
import { LocalDate } from './dates';
import { db } from './server/db';

function instanceOfLocalDate() {
	return z.custom<LocalDate>((data) => data instanceof LocalDate, {
		message: `Input not instance of LocalDate`,
	});
}

export const createTask = form(
	z.object({
		title: z.string().trim().min(1),
		nextDueDate: z.iso.date().transform((d) => LocalDate.of(d)),
		intervalDays: z.coerce.number<string>().int().min(1),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		const user = await getUser();

		await db.insert(table.tasks).values({
			userId: user.id,
			title: data.title,
			nextDueDate: data.nextDueDate,
			intervalDays: data.intervalDays,
			repeatMode: data.repeatMode,
			archived: false,
		});

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
		const user = await getUser();

		const result = await db
			.update(table.tasks)
			.set({
				title: data.title,
				nextDueDate: data.nextDueDate,
				intervalDays: data.intervalDays,
				repeatMode: data.repeatMode,
			})
			.where(and(eq(table.tasks.id, data.id), eq(table.tasks.userId, user.id)));

		if (result.rowsAffected === 0) error(400);

		await getTaskById(data.id).refresh();

		redirect(303, '/');
	},
);

export const completeTask = command(
	z.object({
		id: z.int(),
		completionDate: instanceOfLocalDate(),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.archived) error(400);

		const user = await getUser();
		const completionDate = data.completionDate;

		await db.insert(table.tasksCompleted).values({
			userId: user.id,
			taskId: task.id,
			dueDate: task.nextDueDate,
			completionDate: completionDate,
		});

		await db
			.update(table.tasks)
			.set({
				nextDueDate: calculateNextDueDate(task, completionDate),
			})
			.where(eq(table.tasks.id, data.id));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
		await getAllTasksForDate({ now: data.completionDate }).refresh();
	},
);

function calculateNextDueDate(
	task: {
		nextDueDate: LocalDate;
		intervalDays: number;
		repeatMode: 'fromDueDate' | 'fromCompletionDate';
	},
	completionDate: LocalDate,
) {
	if (task.repeatMode === 'fromCompletionDate') {
		return completionDate.addDays(task.intervalDays);
	}

	return task.nextDueDate.addDays(task.intervalDays);
}

export const uncompleteTask = command(
	z.object({
		id: z.int(),
		completionDate: instanceOfLocalDate(),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.archived) error(400);

		const user = await getUser();

		const taskCompleted = await db.query.tasksCompleted.findFirst({
			where: and(
				eq(table.tasksCompleted.userId, user.id),
				eq(table.tasksCompleted.taskId, task.id),
				eq(table.tasksCompleted.completionDate, data.completionDate),
			),
		});

		if (!taskCompleted) error(400);

		await db.delete(table.tasksCompleted).where(eq(table.tasksCompleted.id, taskCompleted.id));

		await db
			.update(table.tasks)
			.set({
				nextDueDate: taskCompleted.dueDate,
			})
			.where(and(eq(table.tasks.id, data.id), eq(table.tasks.userId, user.id)));

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
		await getAllTasksForDate({ now: data.completionDate }).refresh();
	},
);

export const archiveTask = form(
	z.object({
		id: z.coerce.number<string>().int(),
	}),
	async (data) => {
		const user = await getUser();

		await db
			.update(table.tasks)
			.set({
				archived: true,
				archivedAt: new Date(),
			})
			.where(and(eq(table.tasks.id, data.id), eq(table.tasks.userId, user.id)));

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
	const user = await getUser();

	const task = await db.query.tasks.findFirst({
		where: and(eq(table.tasks.id, id), eq(table.tasks.userId, user.id)),
	});

	if (!task) error(404);

	return task;
});

export const getAllTasks = query(async () => {
	return await getAllTasksForDate({ now: LocalDate.now() });
});

export const getAllTasksForDate = query(
	z.object({
		now: instanceOfLocalDate(),
	}),
	async (data) => {
		const user = await getUser();

		const tasks = await db.query.tasks.findMany({
			where: and(eq(table.tasks.archived, false), eq(table.tasks.userId, user.id)),
			orderBy: [table.tasks.nextDueDate, table.tasks.intervalDays, table.tasks.title],
			with: {
				tasksCompleted: {
					where: eq(table.tasksCompleted.completionDate, data.now),
				},
			},
		});

		return tasks.map((t) => ({
			id: t.id,
			title: t.title,
			nextDueDate: t.nextDueDate,
			intervalDays: t.intervalDays,
			completed: t.tasksCompleted.length > 0 && t.nextDueDate.isAfter(data.now),
		}));
	},
);

export const getTaskCompletions = query(z.int(), async (id) => {
	const user = await getUser();

	const completions = await db.query.tasksCompleted.findMany({
		where: and(eq(table.tasksCompleted.taskId, id), eq(table.tasksCompleted.userId, user.id)),
		orderBy: [desc(table.tasksCompleted.completionDate), desc(table.tasksCompleted.dueDate)],
	});

	return completions;
});
