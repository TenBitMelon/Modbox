<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
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

<ul>
	{#each data.searchResults.hits as mod}
		<li>
			{mod.title}
		</li>
	{/each}
</ul>
