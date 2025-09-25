export function addToDate(inputDate: string, addDays: number) {
	const date = new Date(inputDate);
	date.setDate(date.getDate() + addDays);

	return convertDateToIsoString(date);
}

export function convertDateToIsoString(date: Date) {
	return date.toISOString().split('T')[0];
}

export function formatDate(date: string) {
	return new Date(date).toLocaleDateString('de-DE', {
		dateStyle: 'medium',
	});
}
