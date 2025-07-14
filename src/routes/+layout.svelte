<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';

	let { children, data }: LayoutProps = $props();
</script>

<header class="">
	<div
		class="mx-auto grid max-w-7xl grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)_minmax(0,_1fr)] gap-x-12"
	>
		<div class="box flex w-fit justify-center px-4 py-2">
			<a href="/" class="">
				<span class="">Modbox</span>
			</a>
		</div>

		<nav class="box justify-around6 flex justify-around py-2">
			<a href="/create"> Create </a>
			<a href="/"> Browse </a>
		</nav>

		<div class="flex justify-end gap-4">
			<div class="box p-2">
				<ThemeSwitch />
			</div>
			<div class="box px-4 py-2">
				{#if data.user}
					<div class="">
						<span class="">Hello, {data.user.username}!</span>
					</div>
					<a href="/auth/sign-out" class="bg-red-500"> Logout </a>
				{:else}
					<a href="/auth/sign-in" class="bg-blue-500"> Login </a>
				{/if}
			</div>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="mx-auto min-h-screen max-w-7xl py-4">
	{@render children()}
</main>

<!-- Footer -->
<footer class="box mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
		<div class="col-span-1 md:col-span-2">
			<span class="">Modbox</span>

			<a href="https://github.com/TenBitMelon/Modbox" class="">
				<span class="sr-only">GitHub</span>
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
			</a>
		</div>

		<!-- Quick Links -->
		<div class="flex flex-col">
			<h3 class="mb-2">Quick Links</h3>
			<a href="/" class="">Home</a>
			<a href="/modpacks" class=""> Browse Modpacks </a>
			<a href="/create" class=""> Create Modpack </a>
			<a href="/docs" class=""> Documentation </a>
		</div>

		<!-- Support -->
		<div class="flex flex-col">
			<h3 class="mb-2">Support</h3>
			<a href="/help" class="">Help Center</a>
			<a href="/contact" class="">Contact Us</a>
			<a href="/privacy" class="">Privacy Policy</a>
			<a href="/terms" class="">Terms of Service</a>
		</div>
	</div>

	<!-- Bottom Section -->
	<div class="mt-8 border-t pt-8">
		<p class="mb-4">
			NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
		</p>
		<p class="">© 2025 ModPack Hub. All rights reserved.</p>
	</div>
</footer>
