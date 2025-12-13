<script lang="ts">
	import FormRow from '$lib/FormRow.svelte';
	import { login, register } from '$lib/auth.remote';
</script>

<h1 class="text-xl font-bold">Login</h1>

<form {...login} class="flex flex-col gap-2">
	{#each login.fields.issues() as issue, i (i)}
		<small class="text-error">
			{issue.message}
		</small>
	{/each}

	<FormRow type="text" id="username" label="Username" field={login.fields.username} />
	<FormRow type="password" id="password" label="Passwort" field={login.fields._password} />

	<button class="btn btn-primary">Login</button>
	<button class="btn btn-secondary" {...register.buttonProps}>Registrieren</button>
</form>
