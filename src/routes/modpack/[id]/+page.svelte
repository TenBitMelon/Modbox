<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let modpack = $state(data.modpack);
</script>

<pre class="text-red-400">{form?.success}</pre>

<h1>Modpack {modpack.name} ({modpack.slug})</h1>

<p>Modpack ID: {modpack.id}</p>

<p>Modpack creator: {modpack.creatorId}</p>

<a href={modpack.githubUrl}>GitHub {modpack.githubUrl}</a>

<h2>Modpack Toml</h2>
<pre>
{atob(data.packToml)}
</pre>

<h2>Search for mods</h2>

<form method="get" action="?/searchMods">
	<input name="query" value={page.url.searchParams.get('query')} placeholder="Mod name" required />
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Search </button>
</form>

{#each data.searchResults.hits as mod}
	<form method="post" action="?/addMod" use:enhance>
		<input name="modSlug" hidden value={mod.slug} required />
		<button class="rounded-md bg-green-500 px-4 py-2 text-white">Add "{mod.title}"</button>
	</form>
{/each}

<h2>Add a Mod to this Pack</h2>
<form method="post" action="?/addMod" use:enhance>
	<input name="modSlug" placeholder="Enter Modrinth slug or URL" required />
	<button class="rounded-md bg-green-500 px-4 py-2 text-white">Add Mod</button>
</form>

{#if form?.success}
	<p class="text-green-400">{form.success}</p>
{:else if form?.message}
	<p class="text-red-500">{form.message}</p>
{/if}

<form
	method="post"
	action="?/deleteModpack"
	use:enhance={() => {
		return () => {
			window.open(`${modpack.githubUrl}/settings#danger-zone`, '_blank');
		};
	}}
>
	<button class="rounded-md bg-red-500 px-4 py-2 text-white">Delete Modpack</button>
</form>
