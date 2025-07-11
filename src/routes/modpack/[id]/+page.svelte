<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let modpack = $state(data.modpack);
</script>

<h1>Modpack {modpack.name}</h1>

<p>Modpack ID: {modpack.id}</p>

<p>Modpack creator: {modpack.creatorId}</p>

<h2>Mods</h2>
<ul>
	{#each modpack.mods as mod}
		<li>
			{mod}
			<form
				method="post"
				action="?/removeMod"
				use:enhance={({ formData, cancel }) => {
					formData.set('mod', mod);

					const index = modpack.mods.indexOf(mod);
					if (index == -1) return cancel();
					modpack.mods.splice(index, 1);

					return ({ result, update }) => {
						if (result.type != 'success') {
							modpack.mods.splice(index, 0, mod);
						} else {
							update();
						}
					};
				}}
			>
				<button> Remove {mod} </button>
			</form>
		</li>
	{/each}
</ul>

<form
	method="post"
	action="?/addMod"
	use:enhance={({ formData, action, cancel, formElement }) => {
		const mod = formData.get('mod')?.toString();
		if (!mod) return cancel();

		modpack.mods.push(mod);

		return ({ result, update }) => {
			if (result.type != 'success') {
				modpack.mods.pop();
			} else {
				update();
			}
		};
	}}
>
	<input name="mod" value="" placeholder="Mod name" required />
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Add a mod </button>
</form>

<h2>Search for mods</h2>

<form method="get" action="?/searchMods" use:enhance>
	<input name="query" value={page.url.searchParams.get('query')} placeholder="Mod name" required />
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Search </button>
</form>

<ul>
	{#each data.mods.hits as mod}
		<li>
			<form
				method="post"
				action="?/addMod"
				use:enhance={({ formData }) => {
					formData.set('mod', mod.title);

					modpack.mods.push(mod.title);

					return ({ result, update }) => {
						if (result.type != 'success') {
							modpack.mods.pop();
						} else {
							update();
						}
					};
				}}
			>
				<button> Add {mod.title} </button>
			</form>
		</li>
	{/each}
</ul>
