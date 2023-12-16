<script>
	import Navbar from '$lib/Navbar.svelte';
	import { theme } from '$lib/stores/theme';
</script>

<Navbar />

<div class="app-container" class:light={!$theme} class:dark={$theme}>
	<div class="content-container">
		<slot />
	</div>
</div>

<style>
	:root {
		--primary-color: #424ae1;
		--primary-hover-color: #363dc4;
	}

	.app-container {
		width: 100%;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
	}

	/* Media query for smaller screens */
	@media screen and (max-width: 768px) {
		.app-container {
			width: 100%;
			min-height: 100%;
		}

		.content-container {
			padding: 0 2.5rem;
			margin: 0 auto;
		}
	}
</style>
