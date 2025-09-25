<script lang="ts">
	import { convertDateToIsoString } from '$lib/dates';
	import { createTask } from '$lib/task.remote';
</script>

<h2>Create task</h2>

<form {...createTask} oninput={() => createTask.validate()}>
	<div>
		<label for={createTask.field('title')}>Title</label>
		<input
			type="text"
			id={createTask.field('title')}
			name={createTask.field('title')}
			aria-invalid={createTask.issues?.title ? true : undefined}
			aria-errormessage="{createTask.field('title')}-error"
		/>
		{#if createTask.issues?.title}
			{#each createTask.issues.title as issue}
				<small id="{createTask.field('title')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={createTask.field('nextDueDate')}>nextDueDate</label>
		<input
			type="date"
			id={createTask.field('nextDueDate')}
			name={createTask.field('nextDueDate')}
			value={convertDateToIsoString(new Date())}
			aria-invalid={createTask.issues?.nextDueDate ? true : undefined}
			aria-errormessage="{createTask.field('nextDueDate')}-error"
		/>
		{#if createTask.issues?.nextDueDate}
			{#each createTask.issues.nextDueDate as issue}
				<small id="{createTask.field('nextDueDate')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={createTask.field('intervalDays')}>intervalDays</label>
		<input
			type="number"
			id={createTask.field('intervalDays')}
			name={createTask.field('intervalDays')}
			value="1"
			aria-invalid={createTask.issues?.intervalDays ? true : undefined}
			aria-errormessage="{createTask.field('intervalDays')}-error"
		/>
		{#if createTask.issues?.intervalDays}
			{#each createTask.issues.intervalDays as issue}
				<small id="{createTask.field('intervalDays')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={createTask.field('repeatMode')}>repeatMode</label>
		<select
			id={createTask.field('repeatMode')}
			name={createTask.field('repeatMode')}
			value="fromCompletionDate"
			aria-invalid={createTask.issues?.repeatMode ? true : undefined}
			aria-errormessage="{createTask.field('repeatMode')}-error"
		>
			<option value="fromCompletionDate">fromCompletionDate</option>
			<option value="fromDueDate">fromDueDate</option>
		</select>
		{#if createTask.issues?.repeatMode}
			{#each createTask.issues.repeatMode as issue}
				<small id="{createTask.field('repeatMode')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>
	<button>Create task</button>
</form>
