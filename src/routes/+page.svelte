<script lang="ts">
	import { Archive, Check, Pause, Pencil, Plus } from 'lucide-svelte';

	import { resolve } from '$app/paths';

	import { LocalDate } from '$lib/dates';
	import { archiveTask, completeTask, getAllTasks } from '$lib/task.remote';
</script>

<a role="button" href={resolve('/create')} title="Aufgabe erstellen"><Plus size={16} /></a>

{#each await getAllTasks() as task (task.id)}
	<article>
		<header>{task.title}</header>
		<div class="grid text-xs">
			<span>{task.nextDueDate.format('medium')}</span>
			<span>Alle {task.intervalDays} Tag(e)</span>
			<span>{task.repeatMode}</span>
		</div>
		<footer class="flex gap-4">
			<a
				role="button"
				href={resolve('/edit/[id]', { id: `${task.id}` })}
				title="Aufgabe bearbeiten"
			>
				<Pencil size={16} />
			</a>
			<form {...completeTask}>
				<input type="hidden" name="id" value={task.id} />
				<input type="hidden" name="completionDate" value={LocalDate.now()} />
				<button><Check size={16} /></button>
			</form>

			<form {...archiveTask}>
				<input type="hidden" name="id" value={task.id} />
				<button><Archive size={16} /></button>
			</form>
			<button><Pause size={16} /></button>
		</footer>
	</article>
{/each}
