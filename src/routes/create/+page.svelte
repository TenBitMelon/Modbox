<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ModLoaders, type ModLoaderComponent } from '$lib';
	import type { PageProps } from './$types';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fromPromise } from 'neverthrow';

	let { form }: PageProps = $props();

	let selectedVersion: string = $state('');
	let selectedLoader: string = $state('');
	let compatibleLoaders = $derived(loadCompabibleLoaders(selectedVersion));
	let selectedLoaderVersion: string = $state('');
	let loaderVersionList = $derived(loadLoaderVersionList(selectedLoader));

	let versionManifest: Promise<{
		latest: {
			release: string;
			snapshot: string;
		};
		versions: {
			id: string;
			releaseTime: string;
			time: string;
			type: 'release' | 'snapshot';
			url: string;
		}[];
	}> = $state(new Promise(() => {}));

	onMount(() => {
		versionManifest = fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json')
			.then((res) => res.json())
			.then((manifest) => {
				selectedVersion = manifest.latest.release;
				return manifest;
			});
	});

	async function loadCompabibleLoaders(version: string) {
		if (!browser || !version) return [];

		const loaders: { name: string; friendlyName: string }[] = [];
		for (const loader in ModLoaders) {
			const res = await fromPromise(ModLoaders[loader].versionListGetter(version), () => null);
			if (res.isErr()) continue;
			const [versions] = res.value;
			if (versions.length > 0) {
				loaders.push(ModLoaders[loader]);
			}
		}

		if (!loaders.find((loader) => loader.name === selectedLoader)) selectedLoader = loaders[0].name;
		return loaders;
	}

	async function loadLoaderVersionList(loader: string) {
		if (!browser || !loader) return [];

		const res = await fromPromise(
			ModLoaders[loader].versionListGetter(selectedVersion),
			() => null
		);
		if (res.isErr()) return [];
		const [versions] = res.value;

		if (!versions.find((version) => version === selectedLoaderVersion))
			selectedLoaderVersion = versions[versions.length - 1];

		return versions.reverse();
	}
</script>

<form method="post" action="?/createModpack" use:enhance>
	<input name="name" value="" placeholder="Modpack name" required />
	{#await versionManifest}
		<p>Loading...</p>
	{:then versionManifest}
		<select name="version" required bind:value={selectedVersion}>
			{#each versionManifest.versions as version}
				<option value={version.id}>{version.type == 'release' ? '〉' : ''}{version.id}</option>
			{/each}
		</select>
		{#await compatibleLoaders}
			<p>Loading...</p>
		{:then compatibleLoaders}
			<select name="loader" required bind:value={selectedLoader}>
				{#if compatibleLoaders.length > 0}
					{#each compatibleLoaders as loader}
						<option value={loader.name}>{loader.friendlyName}</option>
					{/each}
				{:else}
					<option disabled>No compatible loaders found</option>
				{/if}
			</select>
			{#await loaderVersionList}
				<p>Loading...</p>
			{:then loaderVersionList}
				<select name="loaderversion" required bind:value={selectedLoaderVersion}>
					{#each loaderVersionList as loaderVersion}
						<option value={loaderVersion}>{loaderVersion}</option>
					{/each}
				</select>
			{/await}
		{/await}
	{/await}
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Create a modpack </button>
</form>

{#if form}
	<p>{form.message}</p>
{/if}
