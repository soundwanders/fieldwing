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
		--highlight-text-color: #18181b;
		--highlight-color: #b2e7cb;
		--highlight-color-dark: #336699;

		--form-background-color: #f0f0f0;
		--form-background-color-dark: #1d232e;
		--form-sub-background-color: #eff4f1;
		--form-sub-background-color-dark: #242b38;
		--form-text-color: #09090b;
		--form-text-color-dark: #f8fafc;

		--get-started-background-color-light: #293545;
		--get-started-background-color-dark: #cbd5e1;
		--get-started-text-color-light: #f9f9f9;
		--get-started-text-color-dark: #09090b;

		--teams-color: #bb0000;
		--teams-color-dark: #ff9195;
	}

	.app-container {
		width: 100%;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
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
