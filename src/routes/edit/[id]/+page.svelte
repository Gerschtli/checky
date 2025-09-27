<script lang="ts">
	import { page } from '$app/state';

	import { editTask, getTaskById } from '$lib/task.remote';

	const task = await getTaskById(parseInt(page.params.id!));
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
		<label class="label" for={editTask.field('intervalDays')}>
			Wiederholungsintervall in Tagen
		</label>
		<input
			type="number"
			class="input w-full"
			id={editTask.field('intervalDays')}
			name={editTask.field('intervalDays')}
			value={task.intervalDays}
			aria-invalid={editTask.issues?.intervalDays ? true : undefined}
			aria-errormessage="{editTask.field('intervalDays')}-error"
		/>
		{#if editTask.issues?.intervalDays}
			{#each editTask.issues.intervalDays as issue, i (i)}
				<small class="text-error" id="{editTask.field('intervalDays')}-error">
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
