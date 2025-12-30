<script lang="ts">
	import { Archive, ArrowLeft } from 'lucide-svelte';

	import { resolve } from '$app/paths';

	import EmptyState from '$lib/EmptyState.svelte';
	import TaskCard from '$lib/TaskCard.svelte';
	import { LocalDate } from '$lib/dates';
	import { getArchivedTasks } from '$lib/task.remote';

	const tasks = $derived(await getArchivedTasks());
	const now = LocalDate.now();
</script>

<div class="flex items-center gap-4 mb-6">
	<a href={resolve('/')} class="btn btn-ghost btn-sm">
		<ArrowLeft class="size-4" />
		Zurück
	</a>
	<h1 class="text-2xl font-bold flex items-center gap-2">
		<Archive class="size-6" />
		Archivierte Aufgaben
	</h1>
</div>

{#if tasks.length === 0}
	<EmptyState
		icon={Archive}
		title="Keine archivierten Aufgaben"
		description="Archivierte Aufgaben werden hier angezeigt. Du kannst sie jederzeit reaktivieren."
		size="lg"
	/>
{:else}
	<div class="space-y-3">
		{#each tasks as task (task.id)}
			<TaskCard {now} {task} mode="archived" />
		{/each}
	</div>
{/if}
