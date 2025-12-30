<script lang="ts">
	import {
		Archive,
		CirclePause,
		EllipsisVertical,
		Pencil,
		RotateCcw,
		Trash2,
	} from 'lucide-svelte';
	import { MediaQuery } from 'svelte/reactivity';

	import { resolve } from '$app/paths';

	import TaskInfo from '$lib/TaskInfo.svelte';
	import { LocalDate } from '$lib/dates';
	import { archiveTask, deleteTask, reactivateTask } from '$lib/task.remote';

	interface Props {
		now: LocalDate;
		task: {
			id: number;
			title: string;
			nextDueDate: LocalDate;
			intervalCount: number;
			intervalType: 'days' | 'months';
			tags: string[];
			completed?: boolean;
			archivedAt?: Date | null;
		};
		mode: 'active' | 'archived';
		hideCompleted?: boolean;
		onPause?: (taskId: number) => void;
		onCheckboxChange?: (taskId: number, completed: boolean) => void;
	}

	const { now, task, mode, hideCompleted = false, onPause, onCheckboxChange }: Props = $props();

	const isLargeScreen = new MediaQuery('width >= 40rem');
</script>

<div
	class={[
		'flex items-center gap-4 p-3 sm:p-4 border rounded-lg transition-all duration-200',
		mode === 'active' && task.completed ? 'bg-base-300' : 'bg-base-100 hover:shadow-md',
		mode === 'active' && task.completed && hideCompleted && 'hidden',
	]}
>
	{#if mode === 'active'}
		<input
			type="checkbox"
			name="complete"
			class="checkbox checkbox-md shrink-0"
			bind:checked={task.completed}
			onchange={async (e) => {
				if (onCheckboxChange) {
					await onCheckboxChange(task.id, e.currentTarget.checked);
				}
			}}
		/>
	{/if}

	<div class="flex flex-col gap-1 grow">
		<a
			href={resolve('/task/[id]', { id: `${task.id}` })}
			class={[
				'font-semibold',
				mode === 'active' && task.completed
					? 'line-through text-base-content/50'
					: 'text-base-content',
			]}
		>
			{task.title}
		</a>

		<TaskInfo
			{now}
			task={{
				nextDueDate: task.nextDueDate,
				intervalCount: task.intervalCount,
				intervalType: task.intervalType,
				completed: task.completed,
				tags: task.tags,
			}}
		/>

		{#if mode === 'archived' && task.archivedAt}
			<p class="text-sm text-base-content/60">
				Archiviert am {new Date(task.archivedAt).toLocaleDateString('de-DE')}
			</p>
		{/if}
	</div>

	{#if mode === 'active'}
		<button
			class="sm:hidden p-2 text-base-content/40 hover:text-primary rounded-full hover:bg-gray-100"
			popovertarget="action-{task.id}"
			style:anchor-name="--anchor-{task.id}"
			title="Optionen"
		>
			<EllipsisVertical />
		</button>

		<div
			class="max-sm:dropdown max-sm:dropdown-end max-sm:menu max-sm:w-52 max-sm:rounded-box max-sm:bg-base-100 max-sm:shadow-md sm:relative sm:bg-transparent sm:shrink-0"
			popover={isLargeScreen.current ? undefined : ''}
			id="action-{task.id}"
			style:position-anchor="--anchor-{task.id}"
		>
			<div class="flex sm:flex-row flex-col gap-2 sm:items-center sm:gap-1">
				<a
					href={resolve('/edit/[id]', { id: `${task.id}` })}
					class="max-sm:btn max-sm:btn-primary sm:p-2 sm:text-base-content/40 sm:hover:text-primary sm:rounded-full sm:hover:bg-gray-100"
					title="Bearbeiten"
				>
					<Pencil class="size-5" />
					<span class="sm:hidden">Bearbeiten</span>
				</a>
				{#if onPause}
					<button
						class="max-sm:btn max-sm:btn-warning sm:p-2 sm:text-base-content/40 sm:hover:text-warning sm:rounded-full sm:hover:bg-gray-100"
						title="Pausieren"
						onclick={() => {
							onPause(task.id);
							document.getElementById(`action-${task.id}`)?.hidePopover();
						}}
					>
						<CirclePause class="size-5" />
						<span class="sm:hidden">Pausieren</span>
					</button>
				{/if}
				{#if mode === 'active'}
					<form {...archiveTask.for(`${task.id}`)} class="contents">
						<input
							{...archiveTask.for(`${task.id}`).fields.id.as('hidden', `${task.id}`)}
						/>
						<button
							class="max-sm:btn max-sm:btn-error sm:p-2 sm:text-base-content/40 sm:hover:text-error sm:rounded-full sm:hover:bg-gray-100"
							title="Archivieren"
							onclick={() =>
								document.getElementById(`action-${task.id}`)?.hidePopover()}
						>
							<Archive class="size-5" />
							<span class="sm:hidden">Archivieren</span>
						</button>
					</form>
				{/if}
			</div>
		</div>
	{:else if mode === 'archived'}
		<div class="flex gap-2 shrink-0">
			<form {...reactivateTask.for(`${task.id}`)} class="contents">
				<input {...reactivateTask.for(`${task.id}`).fields.id.as('hidden', `${task.id}`)} />
				<button class="btn btn-primary btn-sm" title="Reaktivieren">
					<RotateCcw class="size-4" />
					<span class="hidden sm:inline">Reaktivieren</span>
				</button>
			</form>
			<form {...deleteTask.for(`${task.id}`)} class="contents">
				<input {...deleteTask.for(`${task.id}`).fields.id.as('hidden', `${task.id}`)} />
				<button
					class="btn btn-error btn-sm"
					title="Löschen"
					onclick={(e) => {
						if (
							!confirm(
								'Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
							)
						) {
							e.preventDefault();
						}
					}}
				>
					<Trash2 class="size-4" />
					<span class="hidden sm:inline">Löschen</span>
				</button>
			</form>
		</div>
	{/if}
</div>
