<script lang="ts">
	import { Calendar } from 'lucide-svelte';

	import { LocalDate } from './dates';

	interface Props {
		now?: LocalDate;
		task: {
			completed?: boolean;
			nextDueDate: LocalDate;
			intervalCount: number;
			intervalType: 'days' | 'months';
		};
	}

	const { now, task }: Props = $props();

	const dueInDays = $derived(task.nextDueDate.diffDays(now ?? LocalDate.now()));
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
		{#if task.intervalType === 'days'}
			{#if task.intervalCount === 1}
				Täglich
			{:else if task.intervalCount === 7}
				Wöchentlich
			{:else}
				Alle {task.intervalCount} Tage
			{/if}
		{:else if task.intervalType === 'months'}
			{#if task.intervalCount === 1}
				Monatlich
			{:else}
				Alle {task.intervalCount} Monate
			{/if}
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
