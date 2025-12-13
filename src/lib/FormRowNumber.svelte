<script lang="ts">
	import type { RemoteFormField } from '@sveltejs/kit';

	interface Props {
		default?: number;
		id: string;
		label: string;
		field: RemoteFormField<string>;
	}

	const { default: defaultValue, id, label, field }: Props = $props();
	// FIXME: this should not be necessary
	const fieldNumber = $derived(field as unknown as RemoteFormField<number>);

	const errorId = $derived(`${id}-error`);

	$effect(() => {
		// FIXME: is there a better way without $effect?
		if (defaultValue !== undefined) fieldNumber.set(defaultValue);
	});
</script>

<div class="flex flex-col">
	<label class="label" for={id}>{label}</label>
	<input {id} class="input w-full" {...fieldNumber.as('number')} aria-errormessage={errorId} />

	{#each fieldNumber.issues() as issue, i (i)}
		<small class="text-error" id={errorId}>
			{issue.message}
		</small>
	{/each}
</div>
