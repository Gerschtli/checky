<script lang="ts" generics="T extends string">
	import type { RemoteFormField } from '@sveltejs/kit';

	interface Props {
		default?: T;
		id: string;
		label: string;
		field: RemoteFormField<T>;
		options: Record<T, string>;
	}

	const { default: defaultValue, id, label, field, options }: Props = $props();
	// FIXME: this should not be necessary
	const fieldSelect = $derived(field as unknown as RemoteFormField<string>);

	const errorId = $derived(`${id}-error`);

	$effect(() => {
		// FIXME: is there a better way without $effect?
		if (defaultValue !== undefined) fieldSelect.set(defaultValue);
	});
</script>

<div class="flex flex-col">
	<label class="label" for={id}>{label}</label>
	<select {id} class="select w-full" {...fieldSelect.as('select')} aria-errormessage={errorId}>
		{#each Object.entries(options) as [value, label] (value)}
			<option {value}>{label}</option>
		{/each}
	</select>

	{#each fieldSelect.issues() as issue, i (i)}
		<small class="text-error" id={errorId}>
			{issue.message}
		</small>
	{/each}
</div>
