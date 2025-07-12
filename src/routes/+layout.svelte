<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<!-- Thing if user is logged in -->
<div class="flex justify-between bg-blue-500 text-white">
	{#if data.user}
		<p>Hello {data.user.username}!</p>
		<a href="/auth/sign-out">Logout</a>
	{:else}
		<p>Hello anonymous!</p>
		<a href="/auth/sign-in">Login</a>
	{/if}
</div>

{@render children()}
