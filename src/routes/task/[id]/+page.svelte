<script lang="ts">
	import TaskInfo from '$lib/TaskInfo.svelte';
	import { LocalDate } from '$lib/dates';
	import { getTaskById, getTaskCompletions } from '$lib/task.remote';

	const { params } = $props();

	const taskId = $derived(parseInt(params.id));
	const task = $derived(await getTaskById(taskId));
	const completions = $derived(await getTaskCompletions(taskId));

	function averageDays(
		completions: {
			dueDate: LocalDate;
			completionDate: LocalDate;
		}[],
	) {
		if (completions.length === 0) {
			return {
				perWeek: 0,
				everyNDays: 0,
			};
		}

		const last = completions[completions.length - 1];
		const earliest = LocalDate.min(last.dueDate, last.completionDate);

		const daysTotal = LocalDate.now().diffDays(earliest) + 1;

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

	const average = $derived(averageDays(completions));
</script>

<div class="flex flex-col gap-1">
	<h1 class="text-xl font-bold">{task.title}</h1>

	<TaskInfo {task} info />
</div>

<h2 class="font-bold text-lg mt-8 mb-2">Ausführungen</h2>

<p class="mb-2">
	Durchschnitt:
	{formatNumber(average.perWeek)} mal pro Woche / alle {formatNumber(average.everyNDays)} Tage
</p>

<ol class="list-decimal ps-6 text-sm">
	{#each completions as completion (completion.id)}
		<li>
			{completion.completionDate.format('long')} (Fällig am {completion.dueDate.format(
				'medium',
			)})
		</li>
	{/each}
</ol>
