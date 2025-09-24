import z from 'zod';

import { form, query } from '$app/server';

import { db } from './server/db';
import { task } from './server/db/schema';

const isoDateToDate = z.codec(z.iso.date(), z.date(), {
	decode: (isoString) => new Date(isoString),
	encode: (date) => date.toISOString(),
});

export const createTask = form(
	z.object({
		title: z.string().trim().min(1),
		nextDueDate: isoDateToDate,
		intervalDays: z.coerce.number<string>().int().min(1),
		repeatMode: z.enum(['fromDueDate', 'fromCompletionDate']),
	}),
	async (data) => {
		console.log(data);
		await db.insert(task).values({
			title: data.title,
			nextDueDate: data.nextDueDate,
			intervalDays: data.intervalDays,
			repeatMode: data.repeatMode,
		});

		await getAllTasks().refresh();
	},
);

export const getAllTasks = query(async () => {
	return await db.select().from(task);
});
