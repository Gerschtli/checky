export class LocalDate {
	/**
	 * The internal date is stored in UTC to prevent timezone shifts.
	 * For a date like "2023-10-27", this will be 2023-10-27T00:00:00.000Z.
	 */
	private readonly date: Date;

	private constructor(date: Date) {
		this.date = date;
	}

	static fromIsoString(isoString: string) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
			throw new Error('Invalid ISO date format. Expected YYYY-MM-DD.');
		}

		const parts = isoString.split('-').map(Number);
		// Month is 0-indexed in JavaScript Date
		const year = parts[0];
		const month = parts[1] - 1;
		const day = parts[2];

		// Create a date in UTC to avoid timezone issues.
		const utcDate = new Date(Date.UTC(year, month, day));

		// Basic validation check
		if (
			utcDate.getUTCFullYear() !== year ||
			utcDate.getUTCMonth() !== month ||
			utcDate.getUTCDate() !== day
		) {
			throw new Error(`Invalid date components: ${isoString}`);
		}

		return new LocalDate(utcDate);
	}

	static now(timeZone: string = 'Europe/Berlin'): LocalDate {
		// Use Intl.DateTimeFormat to get the current date parts in the target timezone.
		// The 'en-CA' locale is used as it reliably formats to YYYY-MM-DD.
		const formatter = new Intl.DateTimeFormat('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			timeZone,
		});

		const todayIsoString = formatter.format(new Date());

		return LocalDate.fromIsoString(todayIsoString);
	}

	addDays(numberOfDays: number) {
		const newDate = new Date(this.date);
		newDate.setUTCDate(newDate.getUTCDate() + numberOfDays);

		return new LocalDate(newDate);
	}

	addMonths(numberOfMonths: number) {
		const newDate = new Date(this.date);
		newDate.setUTCMonth(newDate.getUTCMonth() + numberOfMonths);

		return new LocalDate(newDate);
	}

	static min(localDate1: LocalDate, localDate2: LocalDate) {
		return localDate1.date < localDate2.date ? localDate1 : localDate2;
	}

	diffDays(localDate: LocalDate) {
		const diffTime = this.date.getTime() - localDate.date.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	}

	isAfter(localDate: LocalDate) {
		return this.date > localDate.date;
	}

	equals(localDate: LocalDate) {
		return this.date.getTime() === localDate.date.getTime();
	}

	toIsoString() {
		const year = this.date.getUTCFullYear();
		// getUTCMonth() is 0-indexed, so we add 1.
		const month = (this.date.getUTCMonth() + 1).toString().padStart(2, '0');
		const day = this.date.getUTCDate().toString().padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	format(mode: 'long' | 'medium' | 'short') {
		let options: Intl.DateTimeFormatOptions;
		switch (mode) {
			case 'long': {
				options = {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				};
				break;
			}
			case 'medium': {
				options = {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				};
				break;
			}
			case 'short': {
				options = {
					month: '2-digit',
					day: '2-digit',
					year: 'numeric',
				};
				break;
			}
		}

		return new Intl.DateTimeFormat('de-DE', options).format(this.date);
	}

	toString() {
		return this.toIsoString();
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return `LocalDate {"${this}"}`;
	}
}
