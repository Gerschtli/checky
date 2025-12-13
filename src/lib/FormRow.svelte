<script lang="ts">
	import type { RemoteFormField } from '@sveltejs/kit';

	interface Props {
		type: 'text' | 'date' | 'password';
		default?: string;
		id: string;
		label: string;
		field: RemoteFormField<string>;
	}

	const { type, default: defaultValue, id, label, field }: Props = $props();

	const errorId = $derived(`${id}-error`);

	$effect(() => {
		// FIXME: is there a better way without $effect?
		if (defaultValue !== undefined) field.set(defaultValue);
	});
</script>

<div class="flex flex-col">
	<label class="label" for={id}>{label}</label>
	<input {id} class="input w-full" {...field.as(type)} aria-errormessage={errorId} />

	{#each field.issues() as issue, i (i)}
		<small class="text-error" id={errorId}>
			{issue.message}
		</small>
	{/each}
</div>
