<script lang="ts">
	import { resolve } from '$app/paths';

	import favicon from '$lib/assets/favicon.svg';
	import { getUserOptional, logout } from '$lib/auth.remote';

	import '../app.css';

	const user = await getUserOptional();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="container">
	<nav>
		<ul>
			<li><strong><a href={resolve('/')}>Checky</a></strong></li>
		</ul>
		{#if user}
			<ul>
				<li>
					<form {...logout}>
						<button>Sign out</button>
					</form>
				</li>
			</ul>
		{/if}
	</nav>
</header>

<main class="container py-8">
	{@render children?.()}
</main>
