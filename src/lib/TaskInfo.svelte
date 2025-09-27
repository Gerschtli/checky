<script lang="ts">
	import { Calendar } from 'lucide-svelte';

	import { LocalDate } from './dates';

	interface Props {
		task: {
			completed?: boolean;
			nextDueDate: LocalDate;
			intervalDays: number;
		};
	}

	const { task }: Props = $props();

	const dueInDays = $derived(task.nextDueDate.diffDays(LocalDate.now()));
</script>

<div
	class={[
		'flex items-center text-xs',
		task.completed ? 'text-base-content/40' : 'text-base-content/50',
	]}
>
	<Calendar class="size-4 me-1" />
	<div class="text-nowrap">{task.nextDueDate.format('medium')}</div>
	<div class="mx-2">•</div>
	<div class="text-nowrap">
		{#if task.intervalDays === 1}
			Täglich
		{:else if task.intervalDays === 7}
			Wöchentlich
		{:else}
			Alle {task.intervalDays} Tage
		{/if}
	</div>
	<div class="mx-2">•</div>

	<div
		class={{
			'text-xs': true,
			'text-error': dueInDays < 0,
			'text-warning': dueInDays === 0,
			'text-success': dueInDays > 0,
		}}
	>
		{#if dueInDays < 0}
			Überfällig seit {Math.abs(dueInDays)}&nbsp;Tagen
		{:else if dueInDays === 0}
			Heute fällig
		{:else if dueInDays === 1}
			Morgen fällig
		{:else if dueInDays > 0}
			Fällig in {dueInDays}&nbsp;Tagen
		{/if}
	</div>
</div>
