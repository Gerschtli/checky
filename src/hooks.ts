import type { Transport } from '@sveltejs/kit';
import z from 'zod';

import { LocalDate } from '$lib/dates';

export function init() {
	z.config(z.locales.de());
}

export const transport: Transport = {
	LocalDate: {
		encode(value) {
			return value instanceof LocalDate && [value.toIsoString()];
		},
		decode([iso]) {
			return LocalDate.fromIsoString(iso);
		},
	},
};
