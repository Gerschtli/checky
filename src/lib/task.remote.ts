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
		nextDueDate: z.iso.date().transform((d) => LocalDate.fromIsoString(d)),
		intervalCount: z.coerce.number<string>().int().min(1),
		intervalType: z.enum(['days', 'months']),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		const user = await getUser();

		await db.insert(table.tasks).values({
			userId: user.id,
			title: data.title,
			nextDueDate: data.nextDueDate,
			intervalCount: data.intervalCount,
			intervalType: data.intervalType,
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
		nextDueDate: z.iso.date().transform((d) => LocalDate.fromIsoString(d)),
		intervalCount: z.coerce.number<string>().int().min(1),
		intervalType: z.enum(['days', 'months']),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		const user = await getUser();

		const result = await db
			.update(table.tasks)
			.set({
				title: data.title,
				nextDueDate: data.nextDueDate,
				intervalCount: data.intervalCount,
				intervalType: data.intervalType,
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
		intervalCount: number;
		intervalType: 'days' | 'months';
		repeatMode: 'fromDueDate' | 'fromCompletionDate';
	},
	completionDate: LocalDate,
) {
	const date = task.repeatMode === 'fromCompletionDate' ? completionDate : task.nextDueDate;

	switch (task.intervalType) {
		case 'days': {
			return date.addDays(task.intervalCount);
		}
		case 'months': {
			return date.addMonths(task.intervalCount);
		}
	}
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

function makeMultiCriteriaSort<T>(...criteria: ((a: T, b: T) => number)[]) {
	return (a: T, b: T) => {
		for (let i = 0; i < criteria.length; i++) {
			const curCriteriaComparatorValue = criteria[i](a, b);
			if (curCriteriaComparatorValue !== 0) {
				return curCriteriaComparatorValue;
			}
		}
		return 0;
	};
}

type TaskItem = {
	id: number;
	title: string;
	nextDueDate: LocalDate;
	intervalCount: number;
	intervalType: 'days' | 'months';
	completed: boolean;
};

export const getAllTasksForDate = query(
	z.object({
		now: instanceOfLocalDate(),
	}),
	async (data) => {
		const user = await getUser();

		const tasks = await db.query.tasks.findMany({
			where: and(eq(table.tasks.archived, false), eq(table.tasks.userId, user.id)),
			with: {
				tasksCompleted: {
					where: eq(table.tasksCompleted.completionDate, data.now),
				},
			},
		});

		return tasks
			.toSorted(
				makeMultiCriteriaSort(
					(a, b) => {
						const aIsForToday =
							!a.nextDueDate.isAfter(data.now) || a.tasksCompleted.length > 0;
						const bIsForToday =
							!b.nextDueDate.isAfter(data.now) || b.tasksCompleted.length > 0;
						if (!aIsForToday && !bIsForToday) {
							if (a.nextDueDate.equals(b.nextDueDate)) return 0;
							if (a.nextDueDate.isAfter(b.nextDueDate)) return 1;
							return -1;
						}
						if (aIsForToday && !bIsForToday) return -1;
						if (!aIsForToday && bIsForToday) return 1;

						return 0;
					},
					(a, b) => a.intervalType.localeCompare(b.intervalType),
					(a, b) => a.intervalCount - b.intervalCount,
					(a, b) => a.title.localeCompare(b.title),
				),
			)
			.map((t) => ({
				id: t.id,
				title: t.title,
				nextDueDate: t.nextDueDate,
				intervalCount: t.intervalCount,
				intervalType: t.intervalType,
				completed: t.tasksCompleted.length > 0 && t.nextDueDate.isAfter(data.now),
			}))
			.reduce(
				(agg, current) => {
					if (!current.nextDueDate.isAfter(data.now) || current.completed) {
						agg.now.push(current);
					} else if (current.nextDueDate.equals(data.now.addDays(1))) {
						agg.tomorrow.push(current);
					} else if (current.nextDueDate.isWithinSameWeek(data.now)) {
						agg.thisWeek.push(current);
					} else if (current.nextDueDate.isBefore(data.now.addDays(8))) {
						agg.next7Days.push(current);
					} else {
						agg.later.push(current);
					}

					return agg;
				},
				{
					now: [] as TaskItem[],
					tomorrow: [] as TaskItem[],
					thisWeek: [] as TaskItem[],
					next7Days: [] as TaskItem[],
					later: [] as TaskItem[],
				},
			);
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
