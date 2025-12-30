<script lang="ts">
	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		title: string;
		description: string;
	}

	const { icon: Icon, title, description }: Props = $props();
</script>

<div class="flex flex-col items-center py-8">
	<Icon strokeWidth={1} size={32} class="text-base-content/50 mb-4" />
	<h3 class="mt-4 text-sm font-medium text-base-content mb-2">
		{title}
	</h3>
	<p class="mt-1 text-sm text-base-content/70 text-center">
		{description}
	</p>
</div>
