<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { ModLoaders, type ModLoaderComponent, type ModLoadersType } from '$lib/mod-loaders';
	import type { PageProps } from './$types';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fromPromise } from 'neverthrow';
	import { slugify } from '$lib';

	let { form }: PageProps = $props();

	let selectedVersion: string = $state('');
	let selectedLoader: string = $state('');
	let compatibleLoaders = $derived(loadCompabibleLoaders(selectedVersion));
	let selectedLoaderVersion: string = $state('');
	let loaderVersionList = $derived(loadLoaderVersionList(selectedLoader));
	let showNonReleaseVersions: boolean = $state(false);

	let modpackName: string = $state('');

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
			const res = await fromPromise(
				ModLoaders[loader as ModLoadersType].versionListGetter(version),
				() => null,
			);
			if (res.isErr()) continue;
			const [versions] = res.value;
			if (versions.length > 0) {
				loaders.push(ModLoaders[loader as ModLoadersType]);
			}
		}

		if (!loaders.find((loader) => loader.name === selectedLoader)) selectedLoader = loaders[0].name;
		return loaders;
	}

	async function loadLoaderVersionList(loader: string) {
		if (!browser || !loader) return [];

		const res = await fromPromise(
			ModLoaders[loader as ModLoadersType].versionListGetter(selectedVersion),
			() => null,
		);
		if (res.isErr()) return [];
		const [versions] = res.value;

		if (!versions.find((version) => version === selectedLoaderVersion))
			selectedLoaderVersion = versions[versions.length - 1];

		return versions.reverse();
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
	<div class="mx-auto max-w-2xl">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-slate-800">Create New Modpack</h1>
			<p class="text-slate-600">Configure your modpack settings below</p>
		</div>

		<form method="post" action="?/createModpack" use:enhance class="space-y-6">
			<!-- Modpack Name -->
			<div class="rounded-lg border-4 border-slate-300 bg-white p-6 shadow-lg">
				<label class="mb-3 block text-sm font-semibold text-slate-700" for="name">
					Modpack Name
				</label>
				<input
					name="name"
					bind:value={modpackName}
					placeholder="Enter modpack name"
					required
					class="w-full rounded-lg border-3 border-slate-300 px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none"
				/>
				<span class="text-sm text-gray-500">
					Repository Name:
					<span class="font-semibold">
						{slugify(modpackName)}
					</span>
				</span>
			</div>

			<!-- Minecraft Version -->
			<div class="rounded-lg border-4 border-slate-300 bg-white p-6 shadow-lg">
				<div class="mb-3 flex items-center justify-between">
					<label class="text-sm font-semibold text-slate-700" for="showNonRelease">
						Minecraft Version
					</label>
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="showNonRelease"
							bind:checked={showNonReleaseVersions}
							class="h-4 w-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
						/>
						<label for="showNonRelease" class="text-sm text-slate-600"> Show snapshots </label>
					</div>
				</div>

				{#await versionManifest}
					<div class="flex items-center justify-center py-8">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
						<span class="ml-3 font-medium text-slate-600">Loading Minecraft versions...</span>
					</div>
				{:then versionManifest}
					<select
						name="version"
						required
						bind:value={selectedVersion}
						class="w-full rounded-lg border-3 border-slate-300 bg-white px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none"
					>
						{#each versionManifest.versions.filter((v) => v.type === 'release' || showNonReleaseVersions) as version}
							<option value={version.id} class="py-2">
								{#if version.type === 'release'}
									🟢 {version.id}
								{:else}
									🟡 {version.id} (snapshot)
								{/if}
							</option>
						{/each}
					</select>
				{/await}
			</div>

			<!-- Mod Loader -->
			<div class="rounded-lg border-4 border-slate-300 bg-white p-6 shadow-lg">
				<label class="mb-3 block text-sm font-semibold text-slate-700"> Mod Loader </label>

				{#await compatibleLoaders}
					<div class="flex items-center justify-center py-8">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
						<span class="ml-3 font-medium text-slate-600">Finding compatible loaders...</span>
					</div>
				{:then compatibleLoaders}
					<select
						name="loader"
						required
						bind:value={selectedLoader}
						class="w-full rounded-lg border-3 border-slate-300 bg-white px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none"
					>
						{#if compatibleLoaders.length > 0}
							{#each compatibleLoaders as loader}
								<option value={loader.name} class="py-2">{loader.friendlyName}</option>
							{/each}
						{:else}
							<option disabled class="text-red-500">No compatible loaders found</option>
						{/if}
					</select>
				{/await}
			</div>

			<!-- Loader Version -->
			<div class="rounded-lg border-4 border-slate-300 bg-white p-6 shadow-lg">
				<label class="mb-3 block text-sm font-semibold text-slate-700"> Loader Version </label>

				{#await loaderVersionList}
					<div class="flex items-center justify-center py-8">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
						<span class="ml-3 font-medium text-slate-600">Loading loader versions...</span>
					</div>
				{:then loaderVersionList}
					<select
						name="loaderVersion"
						required
						bind:value={selectedLoaderVersion}
						class="w-full rounded-lg border-3 border-slate-300 bg-white px-4 py-3 text-lg font-medium focus:border-blue-500 focus:outline-none"
					>
						{#each loaderVersionList as loaderVersion}
							<option value={loaderVersion} class="py-2">{loaderVersion}</option>
						{/each}
					</select>
				{/await}
			</div>

			<!-- Submit Button -->
			<div class="pt-4">
				<button
					type="submit"
					class="w-full transform rounded-lg border-4 border-blue-400 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:border-blue-500 hover:from-blue-600 hover:to-blue-700"
				>
					🚀 Create Modpack
				</button>
			</div>
		</form>

		<!-- Form Result -->
		{#if form}
			<div class="mt-6 rounded-lg border-4 border-slate-300 bg-white p-4 shadow-lg">
				<div class="flex items-center">
					{#if form.message.includes('success') || form.message.includes('created')}
						<div class="mr-3 text-xl text-green-500">✅</div>
					{:else}
						<div class="mr-3 text-xl text-red-500">❌</div>
					{/if}
					<p class="font-medium text-slate-700">{form.message}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
