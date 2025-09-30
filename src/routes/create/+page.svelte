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
		<label class="label" for={createTask.field('intervalCount')}>Wiederholungsintervall</label>
		<input
			type="number"
			class="input w-full"
			id={createTask.field('intervalCount')}
			name={createTask.field('intervalCount')}
			value="1"
			aria-invalid={createTask.issues?.intervalCount ? true : undefined}
			aria-errormessage="{createTask.field('intervalCount')}-error"
		/>
		{#if createTask.issues?.intervalCount}
			{#each createTask.issues.intervalCount as issue, i (i)}
				<small class="text-error" id="{createTask.field('intervalCount')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={createTask.field('intervalType')}>Wiederholungsintervall</label>
		<select
			class="w-full select"
			id={createTask.field('intervalType')}
			name={createTask.field('intervalType')}
			value="days"
			aria-invalid={createTask.issues?.intervalType ? true : undefined}
			aria-errormessage="{createTask.field('intervalType')}-error"
		>
			<option value="days">n Mal pro Tag</option>
			<option value="months">n Mal pro Monat</option>
		</select>
		{#if createTask.issues?.intervalType}
			{#each createTask.issues.intervalType as issue, i (i)}
				<small class="text-error" id="{createTask.field('intervalType')}-error">
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
