<script lang="ts">
	import { page } from '$app/state';

	import TaskInfo from '$lib/TaskInfo.svelte';
	import { LocalDate } from '$lib/dates';
	import { getTaskById, getTaskCompletions } from '$lib/task.remote';

	const taskId = $derived(parseInt(page.params.id!));
	const task = $derived(await getTaskById(taskId));

	const completions = $derived(getTaskCompletions(taskId));

	function averageDays(
		completions: {
			dueDate: LocalDate;
			completionDate: LocalDate;
		}[],
	) {
		const last = completions[completions.length - 1];
		const earliest = LocalDate.min(last.dueDate, last.completionDate);

		const daysTotal = LocalDate.now().diffDays(earliest);

		return {
			perWeek: (completions.length / daysTotal) * 7,
			everyNDays: daysTotal / completions.length,
		};
	}

	function formatNumber(n: number) {
		return new Intl.NumberFormat('de-DE', {
			maximumFractionDigits: 2,
		}).format(n);
	}
</script>

<div class="flex flex-col gap-1">
	<h1 class="text-xl font-bold">{task.title}</h1>

	<TaskInfo {task} />
</div>

<h2 class="font-bold text-lg mt-8 mb-2">Ausführungen</h2>

{#if completions.current}
	{@const average = averageDays(completions.current)}

	<p class="mb-2">
		Durchschnitt:
		{formatNumber(average.perWeek)} mal pro Woche / alle {formatNumber(average.everyNDays)} Tage
	</p>

	<ul class="list-disc ps-4 text-sm">
		{#each completions.current as completion (completion.id)}
			<li>{completion.completionDate.format('medium')}</li>
		{/each}
	</ul>
{:else if completions.loading}
	<span class="loading loading-dots loading-md"></span>
{/if}
