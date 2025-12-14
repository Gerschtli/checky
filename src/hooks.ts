import type { Transport } from '@sveltejs/kit';
import '@valibot/i18n/de';
import * as v from 'valibot';

import { LocalDate } from '$lib/dates';

v.setGlobalConfig({ lang: 'de' });

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
