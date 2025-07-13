<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let modpack = $state(data.modpack);
</script>

<div class="mx-auto max-w-4xl space-y-6 p-6">
	<!-- Header Section -->
	<div class="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
		<h1 class="mb-4 text-3xl font-bold text-gray-800">
			Modpack {modpack.name} ({modpack.slug})
		</h1>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="rounded border border-gray-200 bg-gray-50 p-3">
				<span class="font-semibold text-gray-600">Modpack ID:</span>
				<span class="ml-2 text-gray-800">{modpack.id}</span>
			</div>
			<div class="rounded border border-gray-200 bg-gray-50 p-3">
				<span class="font-semibold text-gray-600">Creator:</span>
				<span class="ml-2 text-gray-800">{modpack.creatorId}</span>
			</div>
		</div>

		<div class="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
			<span class="font-semibold text-gray-600">GitHub:</span>
			<a href={modpack.githubUrl} class="ml-2 text-blue-600 underline hover:text-blue-800">
				{modpack.githubUrl}
			</a>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="rounded-lg border-2 border-green-300 bg-green-50 p-4">
			<p class="font-medium text-green-700">{form.success}</p>
		</div>
	{:else if form?.message}
		<div class="rounded-lg border-2 border-red-300 bg-red-50 p-4">
			<p class="font-medium text-red-700">{form.message}</p>
		</div>
	{/if}

	<!-- Modpack TOML Section -->
	<div class="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-2xl font-bold text-gray-800">Modpack TOML</h2>
		<div class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
			<pre class="text-sm whitespace-pre-wrap text-gray-700">{atob(data.packToml)}</pre>
		</div>
	</div>

	<!-- Search Section -->
	<div class="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-2xl font-bold text-gray-800">Search for Mods</h2>

		<form method="get" action="?/searchMods" class="mb-6">
			<div class="flex gap-3">
				<input
					name="query"
					value={page.url.searchParams.get('query')}
					placeholder="Mod name"
					required
					class="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<button
					class="rounded-md border border-blue-500 bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
				>
					Search
				</button>
			</div>
		</form>

		{#if data.searchResults.hits.length > 0}
			<div class="space-y-3">
				<h3 class="text-lg font-semibold text-gray-700">Search Results:</h3>
				{#each data.searchResults.hits as mod}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<span class="font-medium text-gray-800">{mod.title}</span>
						<form method="post" action="?/addMod" use:enhance>
							<input name="modSlug" hidden value={mod.slug} required />
							<button
								class="rounded-md border border-green-500 bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
							>
								Add Mod
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Add Mod Section -->
	<div class="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
		<h2 class="mb-4 text-2xl font-bold text-gray-800">Add a Mod to this Pack</h2>

		<form method="post" action="?/addMod" use:enhance>
			<div class="flex gap-3">
				<input
					name="modSlug"
					placeholder="Enter Modrinth slug or URL"
					required
					class="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
				/>
				<button
					class="rounded-md border border-green-500 bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600"
				>
					Add Mod
				</button>
			</div>
		</form>
	</div>

	<!-- Danger Zone -->
	<div class="rounded-lg border-2 border-red-300 bg-red-50 p-6 shadow-sm">
		<h2 class="mb-4 text-2xl font-bold text-red-800">Danger Zone</h2>
		<p class="mb-4 text-red-700">
			This action cannot be undone. This will permanently delete the modpack.
		</p>

		<form
			method="post"
			action="?/deleteModpack"
			use:enhance={() => {
				return () => {
					window.open(`${modpack.githubUrl}/settings#danger-zone`, '_blank');
				};
			}}
		>
			<button
				class="rounded-md border border-red-500 bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
			>
				Delete Modpack
			</button>
		</form>
	</div>
</div>
