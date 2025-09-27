<script lang="ts">
	import { LocalDate } from '$lib/dates';
	import { createTask } from '$lib/task.remote';
</script>

<h1 class="text-xl font-bold">Aufgabe erstellen</h1>

<form {...createTask} oninput={() => createTask.validate()} class="flex flex-col gap-2">
	<div class="flex flex-col">
		<label class="label" for={createTask.field('title')}>Titel</label>
		<input
			type="text"
			class="input w-full"
			id={createTask.field('title')}
			name={createTask.field('title')}
			aria-invalid={createTask.issues?.title ? true : undefined}
			aria-errormessage="{createTask.field('title')}-error"
		/>
		{#if createTask.issues?.title}
			{#each createTask.issues.title as issue, i (i)}
				<small class="text-error" id="{createTask.field('title')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={createTask.field('nextDueDate')}>Nächstes Fälligkeitsdatum</label>
		<input
			type="date"
			class="input w-full"
			id={createTask.field('nextDueDate')}
			name={createTask.field('nextDueDate')}
			value={LocalDate.now().addDays(1)}
			aria-invalid={createTask.issues?.nextDueDate ? true : undefined}
			aria-errormessage="{createTask.field('nextDueDate')}-error"
		/>
		{#if createTask.issues?.nextDueDate}
			{#each createTask.issues.nextDueDate as issue, i (i)}
				<small class="text-error" id="{createTask.field('nextDueDate')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={createTask.field('intervalDays')}>
			Wiederholungsintervall in Tagen
		</label>
		<input
			type="number"
			class="input w-full"
			id={createTask.field('intervalDays')}
			name={createTask.field('intervalDays')}
			value="1"
			aria-invalid={createTask.issues?.intervalDays ? true : undefined}
			aria-errormessage="{createTask.field('intervalDays')}-error"
		/>
		{#if createTask.issues?.intervalDays}
			{#each createTask.issues.intervalDays as issue, i (i)}
				<small class="text-error" id="{createTask.field('intervalDays')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={createTask.field('repeatMode')}>Wiederholungsmodus</label>
		<select
			class="w-full select"
			id={createTask.field('repeatMode')}
			name={createTask.field('repeatMode')}
			value="fromCompletionDate"
			aria-invalid={createTask.issues?.repeatMode ? true : undefined}
			aria-errormessage="{createTask.field('repeatMode')}-error"
		>
			<option value="fromCompletionDate">Wiederholung ab Erledigungsdatum</option>
			<option value="fromDueDate">Wiederholung ab Fälligkeitsdatum</option>
		</select>
		{#if createTask.issues?.repeatMode}
			{#each createTask.issues.repeatMode as issue, i (i)}
				<small class="text-error" id="{createTask.field('repeatMode')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<button class="btn btn-primary">Erstellen</button>
</form>
