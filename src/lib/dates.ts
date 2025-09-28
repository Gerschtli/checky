export class LocalDate {
	#date: Date;

	private constructor(date: Date) {
		this.#date = date;
	}

	static of(iso: string) {
		return new LocalDate(new Date(iso + 'T00:00:00Z'));
	}

	static now() {
		const today = new Date();
		today.setUTCHours(0);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		return new LocalDate(today);
	}

	addDays(numberOfDays: number) {
		const newDate = new Date(this.#date);
		newDate.setDate(newDate.getDate() + numberOfDays);

		return new LocalDate(newDate);
	}

	static min(localDate1: LocalDate, localDate2: LocalDate) {
		return localDate1.#date < localDate2.#date ? localDate1 : localDate2;
	}

	diffDays(localDate: LocalDate) {
		const diffTime = this.#date.getTime() - localDate.#date.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	}

	isAfter(localDate: LocalDate) {
		return this.#date > localDate.#date;
	}

	equals(localDate: LocalDate) {
		return this.#date.getTime() === localDate.#date.getTime();
	}

	format(mode: 'long' | 'medium' | 'short' | 'iso') {
		if (mode === 'iso') return this.#date.toISOString().split('T')[0];

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

		return new Intl.DateTimeFormat('de-DE', options).format(this.#date);
	}

	toString() {
		return this.format('iso');
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return `LocalDate {"${this}"}`;
	}
}
