<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	function makeRepo() {
		console.log('making a repo');
	}
</script>

<!-- <form method="post" action="?/createRepo" use:enhance>
	<button onclick={makeRepo} class="rounded-md bg-blue-500 px-4 py-2 text-white">
		Click to make a repository
	</button>
</form> -->

<!-- <h2>Your Repos</h2>
<form method="post" action="?/listRepos" use:enhance>
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> List your repos </button>
</form> -->

<!-- {JSON.stringify(form?.data)} -->

<h2>-- Create</h2>

<a href="/create">Create a modpack</a>

<h2>-- All modpacks</h2>

{#each data.modpacks as modpack}
	<a href="/modpack/{modpack.id}">{modpack.name}</a>
{/each}

<form method="post" action="?/seedDB" use:enhance>
	<button class="rounded-md bg-blue-500 px-4 py-2 text-white"> Seed the database </button>
</form>
