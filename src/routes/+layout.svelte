<script>
	import Navbar from '$lib/Navbar.svelte';
	import { theme } from '$lib/stores/theme';
	import '../../src/styles/main.css';
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
		background-image: var(--background-image);
		color: var(--text-color);
		opacity: 0;
		animation: fadeIn 0.6s forwards;
		transition: background-color 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.light {
		--background-color: #f9f9f9;
		--background-image: linear-gradient(180deg, #f9f9f9 59%, #c7cbe9 93%);
		--text-color: #1a202c;
		--form-background-color: #eeeef0;
		--form-sub-background-color: #f4f4f5;
		--form-text-color: #09090b;
	}

	.dark {
		--background-color: #2b4162;
		--background-image: linear-gradient(180deg, #1a202c 59%, #1b293e 93%);
		--text-color: #f9f9f9;
		--form-background-color: #1d232e;
		--form-sub-background-color: #242b38;
		--form-text-color: #f8fafc;
	}

	/* Media query for smaller screens */
	@media screen and (max-width: 768px) {
		.app-container {
			width: 100%;
			min-height: 100%;
		}

		.content-container {
			padding: 0 2rem;
			margin: 0 auto;
			overflow-x: hidden;
		}
	}
</style>
