<script lang="ts">
	import { LogOut, Plus } from 'lucide-svelte';

	import { onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';

	import favicon from '$lib/assets/favicon.svg';
	import { getUserOptional, logout } from '$lib/auth.remote';
	import { LocalDate } from '$lib/dates';

	import '../app.css';

	const user = await getUserOptional();

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="shadow-sm bg-base-100">
	<div class="max-w-2xl mx-auto p-4 flex items-center justify-between">
		<div>
			<a href={resolve('/')} class="text-3xl font-bold text-base-content">Checky</a>
			<p class="text-base-content/50 mt-1">{LocalDate.now().format('long')}</p>
		</div>

		<div class="flex gap-4">
			<a
				href={resolve('/create')}
				class="btn btn-primary"
				aria-label="Neue Aufgabe erstellen"
			>
				<Plus />
			</a>

			{#if user}
				<form {...logout}>
					<button class="btn btn-neutral btn-soft" aria-label="Ausloggen">
						<LogOut class="text-neutral" />
					</button>
				</form>
			{/if}
		</div>
	</div>
</header>

<main class="px-4 mx-auto max-w-2xl py-4">
	{@render children?.()}
</main>

<style>
	:global(html) {
		min-height: 100dvh;
		background-color: var(--color-base-200);
	}
</style>
