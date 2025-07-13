<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { page } from '$app/stores';

	let { children, data }: LayoutProps = $props();

	// Navigation items
	const navItems = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/create', label: 'Create', icon: '✨' },
	];
</script>

<!-- Header -->
<header class="border-b-4 border-slate-300 bg-gradient-to-r from-slate-300 to-slate-200 shadow-lg">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo/Brand -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-3 transition-opacity hover:opacity-80">
					<div class="rounded-lg border-2 border-blue-400 bg-blue-500 p-2"></div>
					<span class="text-xl font-bold text-black">Modbox</span>
				</a>
			</div>

			<!-- Navigation -->
			<nav class="hidden space-x-1 md:flex">
				{#each navItems as item}
					<a
						href={item.href}
						class="rounded-lg border-2 border-transparent px-4 py-2 font-medium transition-all duration-200
							{$page.url.pathname === item.href
							? 'border-blue-400 bg-blue-500 text-black'
							: 'text-black hover:border-slate-600 hover:bg-slate-700 hover:text-black'}"
					>
						<span class="mr-2">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- User Section -->
			<div class="flex items-center space-x-4">
				{#if data.user}
					<div
						class="flex items-center space-x-3 rounded-lg border-2 border-slate-600 bg-slate-700 px-4 py-2"
					>
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
						<span class="font-medium text-white">Hello, {data.user.username}!</span>
					</div>
					<a
						href="/auth/sign-out"
						class="rounded-lg border-2 border-red-400 bg-red-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:border-red-500 hover:bg-red-600"
					>
						Logout
					</a>
				{:else}
					<div
						class="flex items-center space-x-3 rounded-lg border-2 border-slate-600 bg-slate-700 px-4 py-2"
					>
						<div class="h-3 w-3 rounded-full bg-gray-400"></div>
						<span class="font-medium text-slate-300">Hello, anonymous!</span>
					</div>
					<a
						href="/auth/sign-in"
						class="rounded-lg border-2 border-blue-400 bg-blue-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:border-blue-500 hover:bg-blue-600"
					>
						Login
					</a>
				{/if}
			</div>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	{@render children()}
</main>

<!-- Footer -->
<footer class="border-t-4 border-slate-600 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Brand Section -->
			<div class="col-span-1 md:col-span-2">
				<div class="mb-4 flex items-center space-x-3">
					<div class="rounded-lg border-2 border-blue-400 bg-blue-500 p-2"></div>
					<span class="text-xl font-bold text-white">Modbox</span>
				</div>
				<p class="mb-4 text-sm leading-relaxed text-slate-300">
					Your go-to platform for creating, sharing, and discovering amazing Minecraft modpacks.
					Built by the community, for the community.
				</p>
				<div class="flex space-x-4">
					<a
						href="https://github.com/TenBitMelon/Modbox"
						class="text-slate-400 transition-colors hover:text-white"
					>
						<span class="sr-only">GitHub</span>
						<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
				</div>
			</div>

			<!-- Quick Links -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Quick Links</h3>
				<ul class="space-y-2">
					<li>
						<a href="/" class="text-sm text-slate-300 transition-colors hover:text-white">Home</a>
					</li>
					<li>
						<a href="/modpacks" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Browse Modpacks</a
						>
					</li>
					<li>
						<a href="/create" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Create Modpack</a
						>
					</li>
					<li>
						<a href="/docs" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Documentation</a
						>
					</li>
				</ul>
			</div>

			<!-- Support -->
			<div>
				<h3 class="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Support</h3>
				<ul class="space-y-2">
					<li>
						<a href="/help" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Help Center</a
						>
					</li>
					<li>
						<a href="/contact" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Contact Us</a
						>
					</li>
					<li>
						<a href="/privacy" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Privacy Policy</a
						>
					</li>
					<li>
						<a href="/terms" class="text-sm text-slate-300 transition-colors hover:text-white"
							>Terms of Service</a
						>
					</li>
				</ul>
			</div>
		</div>

		<!-- Bottom Section -->
		<div class="mt-8 border-t border-slate-600 pt-8">
			<p class="mb-4 w-full text-center text-sm text-slate-400">
				NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
			</p>
			<div class="flex flex-col items-center justify-between md:flex-row">
				<p class="text-sm text-slate-400">© 2025 ModPack Hub. All rights reserved.</p>
				<div class="mt-4 flex items-center space-x-4 md:mt-0">
					<span class="text-sm text-slate-400">Made with</span>
					<span class="text-red-400">❤️</span>
					<span class="text-sm text-slate-400">for the Minecraft community</span>
				</div>
			</div>
		</div>
	</div>
</footer>
