<script lang="ts">
	import { page } from '$app/state';

	import { editTask, getTaskById } from '$lib/task.remote';

	const task = $derived(await getTaskById(parseInt(page.params.id!)));
</script>

<h1 class="text-xl font-bold">Aufgabe bearbeiten</h1>

<form {...editTask} oninput={() => editTask.validate()} class="flex flex-col gap-2">
	<input type="hidden" name="id" value={task.id} />

	<div class="flex flex-col">
		<label class="label" for={editTask.field('title')}>Titel</label>
		<input
			type="text"
			class="input w-full"
			id={editTask.field('title')}
			name={editTask.field('title')}
			value={task.title}
			aria-invalid={editTask.issues?.title ? true : undefined}
			aria-errormessage="{editTask.field('title')}-error"
		/>
		{#if editTask.issues?.title}
			{#each editTask.issues.title as issue, i (i)}
				<small class="text-error" id="{editTask.field('title')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={editTask.field('nextDueDate')}>Nächstes Fälligkeitsdatum</label>
		<input
			type="date"
			class="input w-full"
			id={editTask.field('nextDueDate')}
			name={editTask.field('nextDueDate')}
			value={task.nextDueDate}
			aria-invalid={editTask.issues?.nextDueDate ? true : undefined}
			aria-errormessage="{editTask.field('nextDueDate')}-error"
		/>
		{#if editTask.issues?.nextDueDate}
			{#each editTask.issues.nextDueDate as issue, i (i)}
				<small class="text-error" id="{editTask.field('nextDueDate')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={editTask.field('intervalCount')}>Wiederholungsintervall</label>
		<input
			type="number"
			class="input w-full"
			id={editTask.field('intervalCount')}
			name={editTask.field('intervalCount')}
			value={task.intervalCount}
			aria-invalid={editTask.issues?.intervalCount ? true : undefined}
			aria-errormessage="{editTask.field('intervalCount')}-error"
		/>
		{#if editTask.issues?.intervalCount}
			{#each editTask.issues.intervalCount as issue, i (i)}
				<small class="text-error" id="{editTask.field('intervalCount')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={editTask.field('intervalType')}>Wiederholungsintervall</label>
		<select
			class="w-full select"
			id={editTask.field('intervalType')}
			name={editTask.field('intervalType')}
			value={task.intervalType}
			aria-invalid={editTask.issues?.intervalType ? true : undefined}
			aria-errormessage="{editTask.field('intervalType')}-error"
		>
			<option value="days">n Mal pro Tag</option>
			<option value="months">n Mal pro Monat</option>
		</select>
		{#if editTask.issues?.intervalType}
			{#each editTask.issues.intervalType as issue, i (i)}
				<small class="text-error" id="{editTask.field('intervalType')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={editTask.field('repeatMode')}>Wiederholungsmodus</label>
		<select
			class="w-full select"
			id={editTask.field('repeatMode')}
			name={editTask.field('repeatMode')}
			value={task.repeatMode}
			aria-invalid={editTask.issues?.repeatMode ? true : undefined}
			aria-errormessage="{editTask.field('repeatMode')}-error"
		>
			<option value="fromCompletionDate">Wiederholung ab Erledigungsdatum</option>
			<option value="fromDueDate">Wiederholung ab Fälligkeitsdatum</option>
		</select>
		{#if editTask.issues?.repeatMode}
			{#each editTask.issues.repeatMode as issue, i (i)}
				<small class="text-error" id="{editTask.field('repeatMode')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<button class="btn btn-primary">Speichern</button>
</form>
