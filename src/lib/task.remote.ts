import { error, redirect } from '@sveltejs/kit';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';

import { command, form, query } from '$app/server';

import * as table from '$lib/server/db/schema';

import { getUser } from './auth.remote';
import { LocalDate } from './dates';
import { db } from './server/db';

function instanceOfLocalDate() {
	return v.custom<LocalDate>(
		(data) => data instanceof LocalDate,
		`Input not instance of LocalDate`,
	);
}

export const createTask = form(
	v.object({
		title: v.pipe(v.string(), v.trim(), v.minLength(1)),
		nextDueDate: v.pipe(
			v.string(),
			v.isoDate(),
			v.transform((d) => LocalDate.fromIsoString(d)),
		),
		intervalCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
		intervalType: v.picklist(['days', 'months']),
		repeatMode: v.picklist(['fromDueDate', 'fromCompletionDate']),
		tags: v.optional(
			v.pipe(
				v.string(),
				v.transform((s) =>
					s
						? s
								.split(',')
								.map((t) => t.trim())
								.filter((t) => t.length > 0)
						: [],
				),
			),
		),
	}),
	async (data) => {
		const user = await getUser();

		const result = await db.insert(table.tasks).values({
			userId: user.id,
			title: data.title,
			nextDueDate: data.nextDueDate,
			intervalCount: data.intervalCount,
			intervalType: data.intervalType,
			repeatMode: data.repeatMode,
			archived: false,
		});

		const taskId = Number(result.lastInsertRowid);

		if (data.tags && data.tags.length > 0) {
			const uniqueTags = [...new Set(data.tags)];

			for (const tagName of uniqueTags) {
				let tag = await db.query.tags.findFirst({
					where: and(eq(table.tags.name, tagName), eq(table.tags.userId, user.id)),
				});

				if (!tag) {
					const tagResult = await db.insert(table.tags).values({
						userId: user.id,
						name: tagName,
					});
					tag = {
						id: Number(tagResult.lastInsertRowid),
						userId: user.id,
						name: tagName,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}

				await db.insert(table.taskTags).values({
					taskId,
					tagId: tag.id,
				});
			}
		}

		redirect(303, '/');
	},
);

export const editTask = form(
	v.object({
		id: v.pipe(v.string(), v.toNumber(), v.integer()),
		title: v.pipe(v.string(), v.trim(), v.minLength(1)),
		nextDueDate: v.pipe(
			v.string(),
			v.isoDate(),
			v.transform((d) => LocalDate.fromIsoString(d)),
		),
		intervalCount: v.pipe(v.number(), v.integer(), v.minValue(1)),
		intervalType: v.picklist(['days', 'months']),
		repeatMode: v.picklist(['fromDueDate', 'fromCompletionDate']),
		tags: v.optional(
			v.pipe(
				v.string(),
				v.transform((s) =>
					s
						? s
								.split(',')
								.map((t) => t.trim())
								.filter((t) => t.length > 0)
						: [],
				),
			),
		),
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

		// Update tags
		await db.delete(table.taskTags).where(eq(table.taskTags.taskId, data.id));

		if (data.tags && data.tags.length > 0) {
			const uniqueTags = [...new Set(data.tags)];

			for (const tagName of uniqueTags) {
				let tag = await db.query.tags.findFirst({
					where: and(eq(table.tags.name, tagName), eq(table.tags.userId, user.id)),
				});

				if (!tag) {
					const tagResult = await db.insert(table.tags).values({
						userId: user.id,
						name: tagName,
					});
					tag = {
						id: Number(tagResult.lastInsertRowid),
						userId: user.id,
						name: tagName,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}

				await db.insert(table.taskTags).values({
					taskId: data.id,
					tagId: tag.id,
				});
			}
		}

		// Clean up orphaned tags after task editing
		await cleanupOrphanedTags();

		await getTaskById(data.id).refresh();
		await getAllTasks().refresh();

		redirect(303, '/');
	},
);

export const completeTask = command(
	v.object({
		id: v.pipe(v.number(), v.integer()),
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

		// await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
		// await getAllTasksForDate({ now: data.completionDate }).refresh();
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
	v.object({
		id: v.pipe(v.number(), v.integer()),
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

		// await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
		// await getAllTasksForDate({ now: data.completionDate }).refresh();
	},
);

export const archiveTask = form(
	v.object({
		id: v.pipe(v.string(), v.toNumber(), v.integer()),
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

		// await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const pauseTask = form(
	v.object({
		id: v.pipe(v.string(), v.toNumber(), v.integer()),
		countDays: v.pipe(v.number(), v.integer(), v.minValue(1)),
	}),
	async (data) => {
		const task = await getTaskById(data.id);

		if (task.repeatMode === 'fromDueDate') {
			error(
				400,
				'Aufgaben mit Wiederholung ab Fälligkeitsdatum können nicht pausiert werden',
			);
		}

		await db
			.update(table.tasks)
			.set({
				nextDueDate: task.nextDueDate.addDays(data.countDays),
			})
			.where(eq(table.tasks.id, data.id));

		// await getTaskById(data.id).refresh();
		await getAllTasks().refresh();
	},
);

export const pauseTasksByTag = form(
	v.object({
		tagName: v.pipe(v.string(), v.trim(), v.minLength(1)),
		countDays: v.pipe(v.number(), v.integer(), v.minValue(1)),
	}),
	async (data) => {
		const user = await getUser();

		// Find the tag
		const tag = await db.query.tags.findFirst({
			where: and(eq(table.tags.name, data.tagName), eq(table.tags.userId, user.id)),
		});

		if (!tag) error(400, 'Tag nicht gefunden');

		// Find all tasks with this tag that can be paused
		const tasks = await db.query.tasks.findMany({
			where: and(
				eq(table.tasks.userId, user.id),
				eq(table.tasks.archived, false),
				eq(table.tasks.repeatMode, 'fromCompletionDate'),
			),
			with: {
				taskTags: {
					where: eq(table.taskTags.tagId, tag.id),
				},
			},
		});

		// Filter tasks that have the tag
		const tasksToPause = tasks.filter((task) => task.taskTags.length > 0);

		// Update each task
		for (const task of tasksToPause) {
			await db
				.update(table.tasks)
				.set({
					nextDueDate: task.nextDueDate.addDays(data.countDays),
				})
				.where(eq(table.tasks.id, task.id));
		}

		await getAllTasks().refresh();
	},
);

export const getTaskById = query(v.pipe(v.number(), v.integer()), async (id) => {
	const user = await getUser();

	const task = await db.query.tasks.findFirst({
		where: and(eq(table.tasks.id, id), eq(table.tasks.userId, user.id)),
		with: {
			taskTags: {
				with: {
					tag: true,
				},
			},
		},
	});

	if (!task) error(404);

	return {
		...task,
		tags: task.taskTags.map((tt) => tt.tag.name),
	};
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
	tags: string[];
};

export const getAllTasksForDate = query(
	v.object({
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
				taskTags: {
					with: {
						tag: true,
					},
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
				tags: t.taskTags.map((tt) => tt.tag.name),
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

export const getArchivedTasks = query(async () => {
	const user = await getUser();

	const tasks = await db.query.tasks.findMany({
		where: and(eq(table.tasks.archived, true), eq(table.tasks.userId, user.id)),
		with: {
			taskTags: {
				with: {
					tag: true,
				},
			},
		},
		orderBy: [desc(table.tasks.archivedAt)],
	});

	return tasks.map((t) => ({
		id: t.id,
		title: t.title,
		nextDueDate: t.nextDueDate,
		intervalCount: t.intervalCount,
		intervalType: t.intervalType,
		archivedAt: t.archivedAt,
		tags: t.taskTags.map((tt) => tt.tag.name),
	}));
});

export const reactivateTask = form(
	v.object({
		id: v.pipe(v.string(), v.toNumber(), v.integer()),
	}),
	async (data) => {
		const user = await getUser();

		await db
			.update(table.tasks)
			.set({
				archived: false,
				archivedAt: null,
			})
			.where(and(eq(table.tasks.id, data.id), eq(table.tasks.userId, user.id)));

		await getArchivedTasks().refresh();
		// await getAllTasks().refresh();
	},
);

export const deleteTask = form(
	v.object({
		id: v.pipe(v.string(), v.toNumber(), v.integer()),
	}),
	async (data) => {
		const user = await getUser();

		// Delete task completions first (due to foreign key constraints)
		await db.delete(table.tasksCompleted).where(eq(table.tasksCompleted.taskId, data.id));

		// Delete task-tag associations
		await db.delete(table.taskTags).where(eq(table.taskTags.taskId, data.id));

		// Delete the task
		const result = await db
			.delete(table.tasks)
			.where(and(eq(table.tasks.id, data.id), eq(table.tasks.userId, user.id)));

		if (result.rowsAffected === 0) {
			error(404, 'Aufgabe nicht gefunden');
		}

		// Clean up orphaned tags after task deletion
		await cleanupOrphanedTags();

		await getArchivedTasks().refresh();
		// await getAllTasks().refresh();
	},
);

export const cleanupOrphanedTags = command(async () => {
	const user = await getUser();

	// Find all tags for the user that are not associated with any tasks
	const orphanedTags = await db.query.tags.findMany({
		where: eq(table.tags.userId, user.id),
		with: {
			taskTags: true,
		},
	});

	// Filter to only tags with no task associations
	const tagsToDelete = orphanedTags
		.filter((tag) => tag.taskTags.length === 0)
		.map((tag) => tag.id);

	if (tagsToDelete.length > 0) {
		// Delete the orphaned tags
		await db.delete(table.tags).where(inArray(table.tags.id, tagsToDelete));
	}

	// Refresh tag queries
	await getAllTags().refresh();
});

export const getTaskCompletions = query(v.pipe(v.number(), v.integer()), async (id) => {
	const user = await getUser();

	const completions = await db.query.tasksCompleted.findMany({
		where: and(eq(table.tasksCompleted.taskId, id), eq(table.tasksCompleted.userId, user.id)),
		orderBy: [desc(table.tasksCompleted.completionDate), desc(table.tasksCompleted.dueDate)],
	});

	return completions;
});

export const getAllTags = query(async () => {
	const user = await getUser();

	const tags = await db.query.tags.findMany({
		where: eq(table.tags.userId, user.id),
		orderBy: asc(table.tags.name),
	});

	return tags;
});
