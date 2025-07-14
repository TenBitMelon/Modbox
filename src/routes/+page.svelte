<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import type { PageProps } from './$types';
	import { abbreviateNumber } from '$lib';
	import { type Modpack } from '$lib/server/db/schema';
	import { writable, type Writable } from 'svelte/store';
	import ModpackRow from './ModpackRow.svelte';

	let { form, data }: PageProps = $props();

	function makeRepo() {
		console.log('making a repo');
	}
</script>

<!-- <form method="post" action="?/seedDB" use:enhance>
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Seed the database </button>
</form> -->

<div class="box mx-auto mb-12 flex max-w-3xl">
	<input
		type="text"
		placeholder="Search mods..."
		class="w-full border border-gray-300 bg-white p-2 text-black"
	/>
	<select class=" border border-gray-300 bg-white p-2 text-black">
		<option>Sort by</option>
		<option>Name</option>
		<option>Author</option>
		<option>Rating</option>
		<option>Date</option>
	</select>
	<select class=" border border-gray-300 bg-white p-2 text-black">
		<option>Loader</option>
		<option>Forge</option>
		<option>Fabric</option>
		<option>Quilt</option>
	</select>
	<select class=" border border-gray-300 bg-white p-2 text-black">
		<option>Minecraft</option>
		<option>1.20.1</option>
		<option>1.19.4</option>
		<option>1.19.2</option>
		<option>1.18.2</option>
		<option>1.17.1</option>
		<option>1.16.5</option>
		<option>1.15.2</option>
		<option>1.14.4</option>
		<option>1.13.2</option>
		<option>1.12.2</option>
	</select>
</div>

<div class="mx-auto flex max-w-3xl flex-col gap-8">
	{#each Array.from({ length: data.modpacks.length / 2 }) as _, i}
		<div class="flex w-full justify-between gap-8">
			<ModpackRow pack1={data.modpacks[i * 2]} pack2={data.modpacks[i * 2 + 1]} />
		</div>
	{/each}
</div>
