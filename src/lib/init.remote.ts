import { command } from '$app/server';

import * as table from '$lib/server/db/schema';

import { getUser } from './auth.remote';
import { LocalDate } from './dates';
import { db } from './server/db';
import { getAllTasks } from './task.remote';

export const initData = command(async () => {
	const user = await getUser();

	const tasks = [
		{
			title: 'Informationen für Tag notieren',
			nextDueDate: LocalDate.of('2025-09-27'),
			intervalDays: 1,
			repeatMode: 'fromDueDate' as const,
			completions: [
				{
					dueDate: LocalDate.of('2025-09-22'),
					completionDate: LocalDate.of('2025-09-22'),
				},
				{
					dueDate: LocalDate.of('2025-09-23'),
					completionDate: LocalDate.of('2025-09-23'),
				},
				{
					dueDate: LocalDate.of('2025-09-24'),
					completionDate: LocalDate.of('2025-09-24'),
				},
				{
					dueDate: LocalDate.of('2025-09-25'),
					completionDate: LocalDate.of('2025-09-25'),
				},
				{
					dueDate: LocalDate.of('2025-09-26'),
					completionDate: LocalDate.of('2025-09-26'),
				},
			],
		},
		{
			title: 'Putzen',
			nextDueDate: LocalDate.of('2025-10-02'),
			intervalDays: 7,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: LocalDate.of('2025-09-24'),
					completionDate: LocalDate.of('2025-09-25'),
				},
				{
					dueDate: LocalDate.of('2025-09-17'),
					completionDate: LocalDate.of('2025-09-17'),
				},
			],
		},
		{
			title: 'Uhr aufladen',
			nextDueDate: LocalDate.of('2025-10-01'),
			intervalDays: 12,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: LocalDate.of('2025-10-01').addDays(-12),
					completionDate: LocalDate.of('2025-10-01').addDays(-12),
				},
				{
					dueDate: LocalDate.of('2025-10-01').addDays(-28),
					completionDate: LocalDate.of('2025-10-01').addDays(-24),
				},
			],
		},
	];

	for (const task of tasks) {
		const result = await db.insert(table.tasks).values({
			userId: user.id,
			title: task.title,
			nextDueDate: task.nextDueDate,
			intervalDays: task.intervalDays,
			repeatMode: task.repeatMode,
			archived: false,
		});

		for (const completion of task.completions) {
			await db.insert(table.tasksCompleted).values({
				userId: user.id,
				taskId: result.lastInsertRowid as number,
				dueDate: completion.dueDate,
				completionDate: completion.completionDate,
			});
		}
	}

	await getAllTasks().refresh();
});
