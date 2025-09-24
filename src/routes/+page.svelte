<script lang="ts">
	import { getUser } from '$lib/auth.remote';
	import { createTask, getAllTasks } from '$lib/task.remote';

	const user = await getUser();
</script>

<h1>Hi, {user.username}!</h1>
<p>Your user ID is {user.id}.</p>

<h2>All tasks</h2>

<ul>
	{#each await getAllTasks() as task}
		<li>
			<pre>{JSON.stringify(task, null, 2)}</pre>
		</li>
	{/each}
</ul>

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
			aria-invalid={createTask.issues?.repeatMode ? true : undefined}
			aria-errormessage="{createTask.field('repeatMode')}-error"
		>
			<option value="fromDueDate">fromDueDate</option>
			<option value="fromCompletionDate">fromCompletionDate</option>
		</select>
		{#if createTask.issues?.repeatMode}
			{#each createTask.issues.repeatMode as issue}
				<small id="{createTask.field('repeatMode')}-error">{issue.message}</small>
			{/each}
		{/if}
	</div>
	<button>Create task</button>
</form>
