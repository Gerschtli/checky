import { afterEach } from 'node:test';
import { describe, expect, it, vitest } from 'vitest';

import { LocalDate } from './dates';

describe('LocalDate', () => {
	afterEach(() => {
		vitest.useRealTimers();
	});

	it('parses iso string and returns it', () => {
		const localDate = LocalDate.of('2025-09-25');

		expect(localDate.format('iso')).toBe('2025-09-25');
	});

	it('returns iso of now for UTC', () => {
		vitest.useFakeTimers();
		vitest.setSystemTime('2025-09-25T00:00:00Z');

		const localDate = LocalDate.now();

		expect(localDate.format('iso')).toBe('2025-09-25');
	});

	it('returns new LocalDate with days added', () => {
		const localDate = LocalDate.of('2025-09-25');
		const localDateAdded = localDate.addDays(3);

		expect(localDate.format('iso')).toBe('2025-09-25');
		expect(localDateAdded.format('iso')).toBe('2025-09-28');
	});

	it('calculates days difference', () => {
		const localDate1 = LocalDate.of('2025-09-25');
		const localDate2 = LocalDate.of('2025-09-28');

		expect(localDate1.diffDays(localDate2)).toBe(-3);
		expect(localDate2.diffDays(localDate1)).toBe(3);
	});

	it('formats long', () => {
		const localDate = LocalDate.of('2025-09-25');

		expect(localDate.format('long')).toBe('Donnerstag, 25. September 2025');
	});

	it('formats medium', () => {
		const localDate = LocalDate.of('2025-09-25');

		expect(localDate.format('medium')).toBe('25. Sept. 2025');
	});

	it('formats short', () => {
		const localDate = LocalDate.of('2025-09-25');

		expect(localDate.format('short')).toBe('25.09.2025');
	});

	it('formats iso in toString', () => {
		const localDate = LocalDate.of('2025-09-25');

		expect(`${localDate}`).toBe('2025-09-25');
	});
});
