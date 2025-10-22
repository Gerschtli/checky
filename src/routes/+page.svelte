<script lang="ts">
	import {
		Archive,
		CircleCheck,
		CirclePause,
		EllipsisVertical,
		Eye,
		EyeOff,
		Pencil,
		TriangleAlert,
	} from 'lucide-svelte';

	import { dev } from '$app/environment';
	import { resolve } from '$app/paths';

	import TaskInfo from '$lib/TaskInfo.svelte';
	import { LocalDate } from '$lib/dates';
	import { initData } from '$lib/init.remote';
	import {
		archiveTask,
		completeTask,
		getAllTasks,
		getAllTasksForDate,
		pauseTask,
		uncompleteTask,
	} from '$lib/task.remote';

	let now = $state(LocalDate.now());
	const timeTravel = $derived(!now.equals(LocalDate.now()));
	let hideCompleted = $state(false);

	const tasks = $derived(timeTravel ? await getAllTasksForDate({ now }) : await getAllTasks());

	async function onTaskCheckboxChange(id: number, taskCompleted: boolean) {
		if (taskCompleted) {
			await completeTask({ id, completionDate: now });
		} else {
			await uncompleteTask({ id, completionDate: now });
		}
	}
</script>

{#if timeTravel}
	<div role="alert" class="alert alert-warning mb-4">
		<TriangleAlert />
		<!-- prettier-ignore -->
		<span>
			Back to the future!
			<br />
			Du siehst die Übersicht vom
			<strong class="text-nowrap">{now.format('long')}</strong>.
		</span>

		<button class="btn btn-outline btn-sm" onclick={() => (now = LocalDate.now())}>
			Zu Heute
		</button>
	</div>
{/if}

<button class="btn btn-accent mb-4" onclick={() => (now = now.addDays(-1))}>Tag zurück</button>
<button class="btn btn-accent mb-4" onclick={() => (now = now.addDays(1))} disabled={!timeTravel}>
	Tag vor
</button>
<button class="btn btn-primary btn-soft mb-4" onclick={() => (hideCompleted = !hideCompleted)}>
	{#if hideCompleted}<Eye />{:else}<EyeOff />{/if}
</button>

{#if dev}
	<button class="btn btn-warning mb-4" onclick={() => initData()}>Testdaten generieren</button>
{/if}

{#snippet taskBox(task: {
	id: number;
	title: string;
	nextDueDate: LocalDate;
	intervalCount: number;
	intervalType: 'days' | 'months';
	completed: boolean;
})}
	<div
		class={[
			'flex items-center gap-4 p-3 sm:p-4 border rounded-lg transition-all duration-200',
			task.completed ? 'bg-base-300' : 'bg-base-100 hover:shadow-md',
			task.completed && hideCompleted && 'hidden',
		]}
	>
		<input
			type="checkbox"
			name="complete"
			class="checkbox checkbox-md shrink-0"
			bind:checked={task.completed}
			onchange={async (e) => await onTaskCheckboxChange(task.id, e.currentTarget.checked)}
		/>

		<div class="flex flex-col gap-1 grow">
			<a
				href={resolve('/task/[id]', { id: `${task.id}` })}
				class={[
					'font-semibold',
					task.completed ? 'line-through text-base-content/50' : 'text-base-content',
				]}
			>
				{task.title}
			</a>

			<TaskInfo {now} {task} />
		</div>

		<button
			class="sm:hidden p-2 text-base-content/40 hover:text-primary rounded-full hover:bg-gray-100"
			popovertarget="action-{task.id}"
			style:anchor-name="--anchor-{task.id}"
			title="Optionen"
		>
			<EllipsisVertical />
		</button>

		<div
			class="max-sm:flex max-sm:dropdown max-sm:dropdown-end max-sm:menu max-sm:w-52 max-sm:rounded-box max-sm:bg-base-100 max-sm:shadow-md max-sm:flex-col max-sm:gap-2 sm:flex sm:items-center sm:gap-1 sm:relative sm:bg-transparent sm:shrink-0"
			popover
			id="action-{task.id}"
			style:position-anchor="--anchor-{task.id}"
		>
			<a
				href={resolve('/edit/[id]', { id: `${task.id}` })}
				class="max-sm:btn max-sm:btn-primary sm:p-2 sm:text-base-content/40 sm:hover:text-primary sm:rounded-full sm:hover:bg-gray-100"
				title="Bearbeiten"
			>
				<Pencil class="size-5" />
				<span class="sm:hidden">Bearbeiten</span>
			</a>
			<form {...pauseTask.for(task.id)} class="contents">
				<input type="hidden" name="id" value={task.id} />
				<input type="hidden" name="countDays" value={1} />
				<button
					class="max-sm:btn max-sm:btn-warning sm:p-2 sm:text-base-content/40 sm:hover:text-warning sm:rounded-full sm:hover:bg-gray-100"
					title="Pausieren"
				>
					<CirclePause class="size-5" />
					<span class="sm:hidden">Pausieren</span>
				</button>
			</form>
			<form {...archiveTask.for(task.id)} class="contents">
				<input type="hidden" name="id" value={task.id} />
				<button
					class="max-sm:btn max-sm:btn-error sm:p-2 sm:text-base-content/40 sm:hover:text-error sm:rounded-full sm:hover:bg-gray-100"
					title="Archivieren"
				>
					<Archive class="size-5" />
					<span class="sm:hidden">Archivieren</span>
				</button>
			</form>
		</div>
	</div>
{/snippet}

{#if tasks.now.length === 0 && tasks.later.length === 0}
	<div class="flex flex-col items-center py-8">
		<CircleCheck strokeWidth={1} size={32} class="text-base-content/50" />
		<h3 class="mt-4 text-sm font-medium text-base-content">Keine Aufgaben</h3>
		<p class="mt-1 text-sm text-base-content/50">
			Beginne, indem du eine neue Aufgabe erstellst.
		</p>
	</div>
{:else}
	<div class="flex gap-4 flex-col">
		{#each tasks.now as task (task.id)}
			{@render taskBox(task)}
		{/each}

		{#if tasks.tomorrow.length}
			<div class="divider text-base-content/60">Morgen</div>

			{#each tasks.tomorrow as task (task.id)}
				{@render taskBox(task)}
			{/each}
		{/if}

		{#if tasks.thisWeek.length}
			<div class="divider text-base-content/60">Diese Woche</div>

			{#each tasks.thisWeek as task (task.id)}
				{@render taskBox(task)}
			{/each}
		{/if}

		{#if tasks.next7Days.length}
			<div class="divider text-base-content/60">Nächste 7 Tage</div>

			{#each tasks.next7Days as task (task.id)}
				{@render taskBox(task)}
			{/each}
		{/if}

		{#if tasks.later.length}
			<div class="divider text-base-content/60">Später</div>

			{#each tasks.later as task (task.id)}
				{@render taskBox(task)}
			{/each}
		{/if}
	</div>
{/if}
