import { command } from '$app/server';

import * as table from '$lib/server/db/schema';

import { getUser } from './auth.remote';
import { LocalDate } from './dates';
import { db } from './server/db';
import { getAllTasks } from './task.remote';

export const initData = command(async () => {
	const user = await getUser();

	const now = LocalDate.now();

	const tasks = [
		{
			title: 'Informationen für Tag notieren',
			nextDueDate: now,
			intervalCount: 1,
			intervalType: 'days' as const,
			repeatMode: 'fromDueDate' as const,
			completions: [
				{
					dueDate: now.addDays(-5),
					completionDate: now.addDays(-5),
				},
				{
					dueDate: now.addDays(-4),
					completionDate: now.addDays(-4),
				},
				{
					dueDate: now.addDays(-3),
					completionDate: now.addDays(-3),
				},
				{
					dueDate: now.addDays(-2),
					completionDate: now.addDays(-2),
				},
				{
					dueDate: now.addDays(-1),
					completionDate: now.addDays(-1),
				},
			],
		},
		{
			title: 'Putzen',
			nextDueDate: now.addDays(5),
			intervalCount: 7,
			intervalType: 'days' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: now.addDays(-3),
					completionDate: now.addDays(-2),
				},
				{
					dueDate: now.addDays(-10),
					completionDate: now.addDays(-10),
				},
			],
		},
		{
			title: 'Uhr aufladen',
			nextDueDate: now.addDays(4),
			intervalCount: 12,
			intervalType: 'days' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: now.addDays(4).addDays(-12),
					completionDate: now.addDays(4).addDays(-12),
				},
				{
					dueDate: now.addDays(4).addDays(-28),
					completionDate: now.addDays(4).addDays(-24),
				},
			],
		},
		{
			title: 'Monatsabschluss',
			nextDueDate: now.addDays(8),
			intervalCount: 1,
			intervalType: 'months' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: now.addDays(8).addMonths(-1),
					completionDate: now.addDays(8).addMonths(-1),
				},
				{
					dueDate: now.addDays(8).addMonths(-2),
					completionDate: now.addDays(8).addMonths(-2),
				},
			],
		},
	];

	for (const task of tasks) {
		const result = await db.insert(table.tasks).values({
			userId: user.id,
			title: task.title,
			nextDueDate: task.nextDueDate,
			intervalCount: task.intervalCount,
			intervalType: task.intervalType,
			repeatMode: task.repeatMode,
			archived: false,
		});

		for (const completion of task.completions) {
			await db.insert(table.tasksCompleted).values({
				userId: user.id,
				taskId: Number(result.lastInsertRowid),
				dueDate: completion.dueDate,
				completionDate: completion.completionDate,
			});
		}
	}

	await getAllTasks().refresh();
});
