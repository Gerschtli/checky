<script lang="ts">
	import { page } from '$app/state';

	import FormRow from '$lib/FormRow.svelte';
	import FormRowNumber from '$lib/FormRowNumber.svelte';
	import FormRowSelect from '$lib/FormRowSelect.svelte';
	import { editTask, getTaskById } from '$lib/task.remote';

	const task = $derived(await getTaskById(parseInt(page.params.id!)));
</script>

<h1 class="text-xl font-bold">Aufgabe bearbeiten</h1>

<form {...editTask} oninput={() => editTask.validate()} class="flex flex-col gap-2">
	<!-- FIXME: This should be possible with .as(...) -->
	<input type="hidden" name="id" value={task.id} />
	<!-- <input {...editTask.fields.id.as('hidden', task.id)} /> -->

	<FormRow
		type="text"
		id="title"
		label="Titel"
		field={editTask.fields.title}
		default={task.title}
	/>
	<FormRow
		type="date"
		id="nextDueDate"
		label="Nächstes Fälligkeitsdatum"
		field={editTask.fields.nextDueDate}
		default={task.nextDueDate.toIsoString()}
	/>
	<FormRowNumber
		id="intervalCount"
		label="Wiederholungsintervall"
		field={editTask.fields.intervalCount}
		default={task.intervalCount}
	/>
	<FormRowSelect
		id="intervalType"
		label="Wiederholungsintervall"
		field={editTask.fields.intervalType}
		default={task.intervalType}
		options={{
			days: 'alle n Tage',
			months: 'alle n Monate',
		}}
	/>
	<FormRowSelect
		id="repeatMode"
		label="Wiederholungsmodus"
		field={editTask.fields.repeatMode}
		default={task.repeatMode}
		options={{
			fromCompletionDate: 'Wiederholung ab Erledigungsdatum',
			fromDueDate: 'Wiederholung ab Fälligkeitsdatum',
		}}
	/>

	<button class="btn btn-primary">Speichern</button>
</form>
