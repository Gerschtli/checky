<script lang="ts">
	import { Calendar, Repeat } from 'lucide-svelte';

	import { LocalDate } from './dates';

	interface Props {
		now?: LocalDate;
		info?: true;
		task: {
			completed?: boolean;
			nextDueDate: LocalDate;
			intervalCount: number;
			intervalType: 'days' | 'months';
		};
	}

	const { now, info, task }: Props = $props();

	const dueInDays = $derived(task.nextDueDate.diffDays(now ?? LocalDate.now()));
</script>

<div
	class={[
		'flex items-center text-xs',
		task.completed ? 'text-base-content/40' : 'text-base-content/50',
	]}
>
	<div class={{ 'hidden sm:contents': !info, contents: info }}>
		<Calendar class="size-4 me-1" />
		<div class="text-nowrap">{task.nextDueDate.format('medium')}</div>
		<div class="mx-2">•</div>
	</div>

	<Repeat class="size-4 me-1" />
	<div class="text-nowrap">
		{#if task.intervalType === 'days' && task.intervalCount % 7 !== 0}
			{#if task.intervalCount === 1}
				Täglich
			{:else}
				Alle {task.intervalCount} Tage
			{/if}
		{:else if task.intervalType === 'days' && task.intervalCount % 7 === 0}
			{@const intervalCount = task.intervalCount / 7}
			{#if intervalCount === 1}
				Wöchentlich
			{:else}
				Alle {intervalCount} Wochen
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
