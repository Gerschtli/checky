<script lang="ts">
	import { page } from '$app/state';

	import { editTask, getTaskById } from '$lib/task.remote';

	const task = await getTaskById(parseInt(page.params.id!));
</script>

<h2>Edit task {task.id}</h2>

<form {...editTask} oninput={() => editTask.validate()}>
	<input type="hidden" name="id" value={task.id} />
	<div>
		<label for={editTask.field('title')}>Title</label>
		<input
			type="text"
			id={editTask.field('title')}
			name={editTask.field('title')}
			value={task.title}
			aria-invalid={editTask.issues?.title ? true : undefined}
			aria-errormessage="{editTask.field('title')}-error"
		/>
		{#if editTask.issues?.title}
			{#each editTask.issues.title as issue, i (i)}
				<small id="{editTask.field('title')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={editTask.field('nextDueDate')}>nextDueDate</label>
		<input
			type="date"
			id={editTask.field('nextDueDate')}
			name={editTask.field('nextDueDate')}
			value={task.nextDueDate}
			aria-invalid={editTask.issues?.nextDueDate ? true : undefined}
			aria-errormessage="{editTask.field('nextDueDate')}-error"
		/>
		{#if editTask.issues?.nextDueDate}
			{#each editTask.issues.nextDueDate as issue, i (i)}
				<small id="{editTask.field('nextDueDate')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={editTask.field('intervalDays')}>intervalDays</label>
		<input
			type="number"
			id={editTask.field('intervalDays')}
			name={editTask.field('intervalDays')}
			value={task.intervalDays}
			aria-invalid={editTask.issues?.intervalDays ? true : undefined}
			aria-errormessage="{editTask.field('intervalDays')}-error"
		/>
		{#if editTask.issues?.intervalDays}
			{#each editTask.issues.intervalDays as issue, i (i)}
				<small id="{editTask.field('intervalDays')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>

	<div>
		<label for={editTask.field('repeatMode')}>repeatMode</label>
		<select
			id={editTask.field('repeatMode')}
			name={editTask.field('repeatMode')}
			value={task.repeatMode}
			aria-invalid={editTask.issues?.repeatMode ? true : undefined}
			aria-errormessage="{editTask.field('repeatMode')}-error"
		>
			<option value="fromCompletionDate">fromCompletionDate</option>
			<option value="fromDueDate">fromDueDate</option>
		</select>
		{#if editTask.issues?.repeatMode}
			{#each editTask.issues.repeatMode as issue, i (i)}
				<small id="{editTask.field('repeatMode')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>
	<button>Edit task</button>
</form>
