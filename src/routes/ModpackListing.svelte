<script lang="ts">
	import { abbreviateNumber } from '$lib';
	import { type Modpack } from '$lib/server/db/schema';
	import { slide } from 'svelte/transition';

	let { modpack, left, expanded }: { modpack: Modpack; left: boolean; expanded: boolean } =
		$props();
</script>

<div
	role="definition"
	onmouseenter={() => {}}
	class="box relative flex h-64 flex-col items-center {expanded
		? 'grow flex-row'
		: 'aspect-square flex-col'}"
>
	<!-- Image -->
	<div
		class="flex shrink-0 items-end justify-center bg-blue-500 {expanded
			? 'h-full w-32 flex-col border-r-4 border-gray-300'
			: 'h-1/2 w-full border-b-4 border-gray-300'}"
	>
		<div
			class="aspect-square h-24 border-4 border-gray-300 bg-red-500 {expanded
				? 'translate-x-1/4'
				: 'translate-y-1/2'}"
		></div>
	</div>

	<!-- Featured -->
	{#if modpack.isPublic}
		<div class="absolute top-0 left-0 h-8 w-8 -translate-x-4 -translate-y-4 rotate-45 bg-gray-300">
			<!-- Star svg -->
			<svg
				class="h-full w-full scale-75 -rotate-45"
				viewBox="0 0 25 25"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12.5 0L17.3492 5.82561L24.3882 8.63729L20.3462 15.0494L19.8473 22.6127L12.5 20.75L5.15268 22.6127L4.65378 15.0494L0.611794 8.63729L7.65077 5.82561L12.5 0Z"
					fill="#EDEDED"
				/>
			</svg>
		</div>
	{/if}

	<!-- Content -->
	<!-- flex flex-col overflow-hidden p-4 -->
	<div class="flex h-full flex-col p-4 {left ? 'pl-8' : 'pr-8'} {expanded ? '' : 'justify-end'}">
		<a href="/modpack/{modpack.id}" class={expanded ? '' : 'text-center'}>{modpack.name}</a>

		{#if expanded}
			<!-- Description -->
			<p class="">{modpack.description}</p>
			<!-- Stats -->
			<div class="">
				<!-- Downloads -->
				<span class="flex items-baseline gap-2">
					<svg class="h-5" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M11 2V14M11 14L5 8M11 14L17 8M20 17V23H11H2V17"
							stroke="#C7C7C7"
							stroke-width="4"
							stroke-linecap="square"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="text-xl">{abbreviateNumber(1)}</span>
				</span>
				<span class="flex">
					<!-- Last Update -->
					<svg
						class="h-5 translate-y-1"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M16.5134 13.3511C15.8319 14.9744 14.6134 16.3092 13.0655 17.128C11.5175 17.9469 9.7359 18.1992 8.02416 17.8419C6.31242 17.4846 4.77649 16.5399 3.67806 15.1687C2.57964 13.7975 1.98668 12.0846 2.00023 10.322C2.01377 8.55932 2.63298 6.85593 3.75235 5.50205C4.87172 4.14817 6.42199 3.22756 8.13901 2.89708C9.85603 2.5666 11.6336 2.8467 13.1688 3.68966C14.7039 4.53261 15.9018 5.88626 16.5582 7.51997M16.5582 7.51997L16.5134 0.5M16.5582 7.51997H10"
							stroke="#C7C7C7"
							stroke-width="4"
						/>
					</svg>

					<span class="text-xl">{1}</span>
				</span>
			</div>
		{/if}
	</div>
</div>
