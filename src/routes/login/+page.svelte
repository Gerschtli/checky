<script lang="ts">
	import FormRow from '$lib/FormRow.svelte';
	import { loginOrRegister } from '$lib/auth.remote';
</script>

<h1 class="text-xl font-bold">Login</h1>

<form {...loginOrRegister} class="flex flex-col gap-2">
	{#each loginOrRegister.fields.issues() as issue, i (i)}
		<small class="text-error">
			{issue.message}
		</small>
	{/each}

	<FormRow type="text" id="username" label="Username" field={loginOrRegister.fields.username} />
	<FormRow
		type="password"
		id="password"
		label="Passwort"
		field={loginOrRegister.fields._password}
	/>

	<button class="btn btn-primary" {...loginOrRegister.fields.action.as('submit', 'login')}>
		Login
	</button>
	<button class="btn btn-secondary" {...loginOrRegister.fields.action.as('submit', 'register')}>
		Registrieren
	</button>
</form>
