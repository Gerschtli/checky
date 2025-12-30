<script lang="ts">
	import FormRow from '$lib/FormRow.svelte';
	import FormRowNumber from '$lib/FormRowNumber.svelte';
	import FormRowSelect from '$lib/FormRowSelect.svelte';
	import { LocalDate } from '$lib/dates';
	import { createTask } from '$lib/task.remote';
</script>

<h1 class="text-xl font-bold">Aufgabe erstellen</h1>

<form {...createTask} oninput={() => createTask.validate()} class="flex flex-col gap-2">
	<FormRow type="text" id="title" label="Titel" field={createTask.fields.title} />
	<FormRow
		type="date"
		id="nextDueDate"
		label="Nächstes Fälligkeitsdatum"
		field={createTask.fields.nextDueDate}
		default={LocalDate.now().toIsoString()}
	/>
	<FormRowNumber
		id="intervalCount"
		label="Wiederholungsintervall"
		field={createTask.fields.intervalCount}
		default={1}
	/>
	<FormRowSelect
		id="intervalType"
		label="Wiederholungsintervall"
		field={createTask.fields.intervalType}
		default="days"
		options={{
			days: 'alle n Tage',
			months: 'alle n Monate',
		}}
	/>
	<FormRowSelect
		id="repeatMode"
		label="Wiederholungsmodus"
		field={createTask.fields.repeatMode}
		default="fromCompletionDate"
		options={{
			fromCompletionDate: 'Wiederholung ab Erledigungsdatum',
			fromDueDate: 'Wiederholung ab Fälligkeitsdatum',
		}}
	/>
	<FormRow
		type="text"
		id="tags"
		label="Tags (optional, durch Komma getrennt)"
		field={createTask.fields.tags}
	/>

	<button class="btn btn-primary">Erstellen</button>
</form>
