<script lang="ts">
	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
		title: string;
		description: string;
		size?: 'sm' | 'lg';
	}

	const { icon: Icon, title, description, size = 'sm' }: Props = $props();
</script>

<div class="flex flex-col items-center py-{size === 'sm' ? '8' : '12'}">
	<Icon strokeWidth={1} size={size === 'sm' ? 32 : 48} class="text-base-content/50 mb-4" />
	<h3 class="mt-4 text-{size === 'sm' ? 'sm' : 'lg'} font-medium text-base-content mb-2">
		{title}
	</h3>
	<p class="mt-1 text-{size === 'sm' ? 'sm' : 'base'} text-base-content/70 text-center">
		{description}
	</p>
</div>
