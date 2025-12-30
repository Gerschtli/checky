<script lang="ts">
	import { Archive, CircleCheck, CirclePause, Eye, EyeOff, TriangleAlert } from 'lucide-svelte';

	import { dev } from '$app/environment';
	import { resolve } from '$app/paths';

	import EmptyState from '$lib/EmptyState.svelte';
	import FormRowNumber from '$lib/FormRowNumber.svelte';
	import FormRowSelect from '$lib/FormRowSelect.svelte';
	import TaskCard from '$lib/TaskCard.svelte';
	import { LocalDate } from '$lib/dates';
	import { initData } from '$lib/init.remote';
	import {
		completeTask,
		getAllTags,
		getAllTasks,
		getAllTasksForDate,
		pauseTask,
		pauseTasksByTag,
		uncompleteTask,
	} from '$lib/task.remote';

	let now = $state(LocalDate.now());
	const timeTravel = $derived(!now.equals(LocalDate.now()));
	let hideCompleted = $state(false);
	let pauseTaskId = $state<number | null>(null);
	let showPauseByTagModal = $state(false);

	const tasks = $derived(timeTravel ? await getAllTasksForDate({ now }) : await getAllTasks());
	const tags = $derived(await getAllTags());

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
<button class="btn btn-warning mb-4" onclick={() => (showPauseByTagModal = true)}>
	<CirclePause class="size-4" />
	Alle mit Tag pausieren
</button>
<a href={resolve('/archived')} class="btn btn-secondary mb-4">
	<Archive class="size-4" />
	Archiv
</a>

{#if dev}
	<button class="btn btn-warning mb-4" onclick={() => initData()}>Testdaten generieren</button>
{/if}

{#if tasks.now.length === 0 && tasks.later.length === 0}
	<EmptyState
		icon={CircleCheck}
		title="Keine Aufgaben"
		description="Beginne, indem du eine neue Aufgabe erstellst."
	/>
{:else}
	<div class="flex gap-4 flex-col">
		{#each tasks.now as task (task.id)}
			<TaskCard
				{now}
				{task}
				mode="active"
				{hideCompleted}
				onPause={(id) => (pauseTaskId = id)}
				onCheckboxChange={onTaskCheckboxChange}
			/>
		{/each}

		{#if tasks.tomorrow.length}
			<div class="divider text-base-content/60">Morgen</div>

			{#each tasks.tomorrow as task (task.id)}
				<TaskCard
					{now}
					{task}
					mode="active"
					{hideCompleted}
					onPause={(id) => (pauseTaskId = id)}
					onCheckboxChange={onTaskCheckboxChange}
				/>
			{/each}
		{/if}

		{#if tasks.thisWeek.length}
			<div class="divider text-base-content/60">Diese Woche</div>

			{#each tasks.thisWeek as task (task.id)}
				<TaskCard
					{now}
					{task}
					mode="active"
					{hideCompleted}
					onPause={(id) => (pauseTaskId = id)}
					onCheckboxChange={onTaskCheckboxChange}
				/>
			{/each}
		{/if}

		{#if tasks.next7Days.length}
			<div class="divider text-base-content/60">Nächste 7 Tage</div>

			{#each tasks.next7Days as task (task.id)}
				<TaskCard
					{now}
					{task}
					mode="active"
					{hideCompleted}
					onPause={(id) => (pauseTaskId = id)}
					onCheckboxChange={onTaskCheckboxChange}
				/>
			{/each}
		{/if}

		{#if tasks.later.length}
			<div class="divider text-base-content/60">Später</div>

			{#each tasks.later as task (task.id)}
				<TaskCard
					{now}
					{task}
					mode="active"
					{hideCompleted}
					onPause={(id) => (pauseTaskId = id)}
					onCheckboxChange={onTaskCheckboxChange}
				/>
			{/each}
		{/if}
	</div>
{/if}

<dialog
	class="modal"
	onclick={(e) => {
		if (e.target === e.currentTarget) pauseTaskId = null;
	}}
	onsubmit={() => (pauseTaskId = null)}
	open={pauseTaskId !== null}
>
	<div class="modal-box">
		<h3 class="font-bold text-lg">Aufgabe pausieren</h3>
		<p class="py-4">Wie viele Tage soll die Aufgabe pausiert werden?</p>
		<form {...pauseTask} oninput={() => pauseTask.validate()} class="flex flex-col gap-4">
			<input {...pauseTask.fields.id.as('hidden', `${pauseTaskId}`)} />
			<FormRowNumber id="countDays" label="Anzahl Tage" field={pauseTask.fields.countDays} />

			<div class="modal-action">
				<button type="button" class="btn" onclick={() => (pauseTaskId = null)}>
					Abbrechen
				</button>
				<button type="submit" class="btn btn-warning">Pausieren</button>
			</div>
		</form>
	</div>
</dialog>

<dialog
	class="modal"
	onclick={(e) => {
		if (e.target === e.currentTarget) showPauseByTagModal = false;
	}}
	onsubmit={() => (showPauseByTagModal = false)}
	open={showPauseByTagModal}
>
	<div class="modal-box">
		<h3 class="font-bold text-lg">Alle Aufgaben mit Tag pausieren</h3>
		<p class="py-4">Wähle einen Tag und die Anzahl der Tage zum Pausieren aus.</p>
		<form
			{...pauseTasksByTag}
			oninput={() => pauseTasksByTag.validate()}
			class="flex flex-col gap-4"
		>
			<FormRowSelect
				id="tagName"
				label="Tag"
				field={pauseTasksByTag.fields.tagName}
				options={tags.reduce(
					(acc, tag) => {
						acc[tag.name] = tag.name;
						return acc;
					},
					{} as Record<string, string>,
				)}
			/>

			<FormRowNumber
				id="countDays"
				label="Anzahl Tage"
				field={pauseTasksByTag.fields.countDays}
			/>

			<div class="modal-action">
				<button type="button" class="btn" onclick={() => (showPauseByTagModal = false)}>
					Abbrechen
				</button>
				<button type="submit" class="btn btn-warning">Pausieren</button>
			</div>
		</form>
	</div>
</dialog>
