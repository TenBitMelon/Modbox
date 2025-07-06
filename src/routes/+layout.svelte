<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<!-- Thing if user is logged in -->
{#if data.user}
	<div class="bg-blue-500 text-white">
		<p>Hello {data.user.username}!</p>
	</div>
{/if}

{@render children()}
