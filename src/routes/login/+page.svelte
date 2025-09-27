<script lang="ts">
	import { login, register } from '$lib/auth.remote';
</script>

<h1 class="text-xl font-bold">Login</h1>

<!-- TODO: fix field errors and form errors for login and register -->
<form {...login} class="flex flex-col gap-2">
	<div class="flex flex-col">
		<label class="label" for={login.field('username')}>Username</label>
		<input
			type="text"
			class="input w-full"
			id={login.field('username')}
			name={login.field('username')}
			aria-invalid={login.issues?.username ? true : undefined}
			aria-errormessage="{login.field('username')}-error"
		/>
		{#if login.issues?.username}
			{#each login.issues.username as issue, i (i)}
				<small class="text-error" id="{login.field('username')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<div class="flex flex-col">
		<label class="label" for={login.field('_password')}>Passwort</label>
		<input
			type="password"
			class="input w-full"
			id={login.field('_password')}
			name={login.field('_password')}
			aria-invalid={login.issues?._password ? true : undefined}
			aria-errormessage="{login.field('_password')}-error"
		/>
		{#if login.issues?._password}
			{#each login.issues._password as issue, i (i)}
				<small class="text-error" id="{login.field('_password')}-error">
					{issue.message}
				</small>
			{/each}
		{/if}
	</div>

	<button class="btn btn-primary">Login</button>
	<button class="btn btn-secondary" {...register.buttonProps}>Registrieren</button>
</form>

<p class="!text-red-400 text-sm py-4">{register.result ?? ''}</p>
