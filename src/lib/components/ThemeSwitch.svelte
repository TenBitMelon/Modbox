<script lang="ts">
	import { onMount } from 'svelte';

	let theme = $state('light');

	onMount(() => {
		document.documentElement.classList.toggle(
			'dark',
			localStorage.theme === 'dark' ||
				(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches),
		);
		theme = localStorage.theme;
	});

	$effect(() => {
		localStorage.theme = theme;
	});
</script>

<div class="relative contents">
	<input
		type="checkbox"
		id="theme-toggle"
		class="invisible"
		hidden
		onchange={(event) => (theme = event.currentTarget.checked ? 'dark' : 'light')}
	/>
	<label
		for="theme-toggle"
		class="block h-6 w-6 cursor-pointer rounded-full bg-amber-400 duration-300 content-['']"
	></label>
</div>

<style lang="postcss">
	#theme-toggle:checked + label {
		box-shadow: inset -8px -8px 1px 1px #ddd;
		background: transparent;
	}
</style>
