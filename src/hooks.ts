import type { Transport } from '@sveltejs/kit';

import { LocalDate } from '$lib/dates';

export const transport: Transport = {
	LocalDate: {
		encode(value) {
			return value instanceof LocalDate && [value.toString()];
		},
		decode([iso]) {
			return LocalDate.of(iso);
		},
	},
};
