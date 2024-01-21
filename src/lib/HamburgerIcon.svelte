<script>
	export let isOpen = false;
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={isOpen ? 'open' : ''}
>
	<path
		d="M3 12h18M3 6h18M3 18h18"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

<style>
	svg {
		width: 24px;
		height: 24px;
		transition: transform 0.3s ease;
		cursor: pointer;
	}

	svg.open {
		transform: rotate(90deg);
	}
</style>
