<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<form method="post" action="?/createModpack" use:enhance>
	<input name="name" value="" placeholder="Modpack name" required />
	<select name="version" required>
		<option value="1.20">1.20</option>
		<option value="1.20.1">1.20.1</option>
		<option value="1.20.2">1.20.2</option>
		<option value="1.20.3">1.20.3</option>
	</select>
	<select name="loader" required>
		<option value="forge">Forge</option>
		<option value="forge">NeoForge</option>
		<option value="fabric">Fabric</option>
	</select>

	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Create a modpack </button>
</form>

{#if form}
	<p>{form.message}</p>
{/if}
