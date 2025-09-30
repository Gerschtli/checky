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
			nextDueDate: LocalDate.fromIsoString('2025-09-27'),
			intervalCount: 1,
			intervalType: 'days' as const,
			repeatMode: 'fromDueDate' as const,
			completions: [
				{
					dueDate: LocalDate.fromIsoString('2025-09-22'),
					completionDate: LocalDate.fromIsoString('2025-09-22'),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-09-23'),
					completionDate: LocalDate.fromIsoString('2025-09-23'),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-09-24'),
					completionDate: LocalDate.fromIsoString('2025-09-24'),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-09-25'),
					completionDate: LocalDate.fromIsoString('2025-09-25'),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-09-26'),
					completionDate: LocalDate.fromIsoString('2025-09-26'),
				},
			],
		},
		{
			title: 'Putzen',
			nextDueDate: LocalDate.fromIsoString('2025-10-02'),
			intervalCount: 7,
			intervalType: 'days' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: LocalDate.fromIsoString('2025-09-24'),
					completionDate: LocalDate.fromIsoString('2025-09-25'),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-09-17'),
					completionDate: LocalDate.fromIsoString('2025-09-17'),
				},
			],
		},
		{
			title: 'Uhr aufladen',
			nextDueDate: LocalDate.fromIsoString('2025-10-01'),
			intervalCount: 12,
			intervalType: 'days' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: LocalDate.fromIsoString('2025-10-01').addDays(-12),
					completionDate: LocalDate.fromIsoString('2025-10-01').addDays(-12),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-10-01').addDays(-28),
					completionDate: LocalDate.fromIsoString('2025-10-01').addDays(-24),
				},
			],
		},
		{
			title: 'Monatsabschluss',
			nextDueDate: LocalDate.fromIsoString('2025-10-15'),
			intervalCount: 1,
			intervalType: 'months' as const,
			repeatMode: 'fromCompletionDate' as const,
			completions: [
				{
					dueDate: LocalDate.fromIsoString('2025-10-15').addMonths(-1),
					completionDate: LocalDate.fromIsoString('2025-10-15').addMonths(-1),
				},
				{
					dueDate: LocalDate.fromIsoString('2025-10-15').addMonths(-2),
					completionDate: LocalDate.fromIsoString('2025-10-15').addMonths(-2),
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
