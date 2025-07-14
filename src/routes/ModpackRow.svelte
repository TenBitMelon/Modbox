<script lang="ts">
	import { type Modpack } from '$lib/server/db/schema';
	import ModpackRow from './ModpackRow.svelte';
	import ModpackListing from './ModpackListing.svelte';

	let { pack1, pack2 }: { pack1: Modpack; pack2: Modpack } = $props();
	let expanded = $state(true);
</script>

<ModpackListing modpack={pack1} left={true} {expanded} />
<ModpackListing modpack={pack2} left={false} expanded={!expanded} />
