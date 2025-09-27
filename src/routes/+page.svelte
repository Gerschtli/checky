<script lang="ts">
	import { Archive, CircleCheck, CirclePause, EllipsisVertical, Pencil } from 'lucide-svelte';

	import { resolve } from '$app/paths';

	import TaskInfo from '$lib/TaskInfo.svelte';
	import {
		archiveTask,
		completeTask,
		getAllTasks,
		pauseTask,
		uncompleteTask,
	} from '$lib/task.remote';

	const tasks = $derived(await getAllTasks());

	async function onTaskCheckboxChange(id: number, taskCompleted: boolean) {
		if (taskCompleted) {
			await completeTask({ id });
		} else {
			await uncompleteTask({ id });
		}
	}
</script>

{#if tasks.length === 0}
	<div class="flex flex-col items-center py-8">
		<CircleCheck strokeWidth={1} size={32} class="text-base-content/50" />
		<h3 class="mt-4 text-sm font-medium text-base-content">Keine Aufgaben</h3>
		<p class="mt-1 text-sm text-base-content/50">
			Beginne, indem du eine neue Aufgabe erstellst.
		</p>
	</div>
{:else}
	<div class="flex gap-4 flex-col">
		{#each tasks as task (task.id)}
			<div
				class={[
					'flex items-center gap-4 p-3 sm:p-4 border rounded-lg transition-all duration-200',
					task.completed ? 'bg-base-300' : 'bg-base-100 hover:shadow-md',
				]}
			>
				<input
					type="checkbox"
					name="complete"
					class="checkbox checkbox-md shrink-0"
					checked={task.completed}
					onchange={async (e) =>
						await onTaskCheckboxChange(task.id, e.currentTarget.checked)}
				/>

				<div class="flex flex-col gap-1 grow">
					<a
						href={resolve('/task/[id]', { id: `${task.id}` })}
						class={[
							'font-semibold',
							task.completed
								? 'line-through text-base-content/50'
								: 'text-base-content',
						]}
					>
						{task.title}
					</a>

					<TaskInfo {task} />
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
					class="max-sm:flex max-sm:dropdown max-sm:dropdown-end max-sm:menu max-sm:w-52 max-sm:rounded-box max-sm:bg-base-100 max-sm:shadow-md max-sm:flex-col max-sm:gap-2 sm:flex sm:items-center sm:gap-1 sm:relative sm:shrink-0"
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
		{/each}
	</div>
{/if}
