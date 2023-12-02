<script>
	import { theme } from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	import ThemeIcons from '../components/ThemeIcons.svelte';

	function toggleTheme() {
		theme.update((currentTheme) => {
			const newTheme = !currentTheme;
			localStorage.setItem('theme', newTheme ? 'dark' : 'light');
			return newTheme;
		});
	}
</script>

<div class="nav-container">
	<nav class="navbar" class:light={!$theme} class:dark={$theme}>
		<a
			id="home-shortcut"
			class="link"
			class:light={!$theme}
			class:dark={$theme}
			href="/"
			aria-label="Go to Home"
		>
			Fieldwing
		</a>

		<a
			id="selection-shortcut"
			class="link"
			class:light={!$theme}
			class:dark={$theme}
			href="/selection"
			aria-label="Go to Team Selection page"
		>
			Selection
		</a>

		<span id="button-wrapper">
			<button
				id="theme"
				class:light={!$theme}
				class:dark={$theme}
				on:click={toggleTheme}
				aria-label={`Toggle ${$theme ? 'light' : 'dark'} theme`}
			>
				<ThemeIcons />
			</button>
		</span>
	</nav>
</div>

<style>
	:root {
		--theme-background-color-light: #ffd586;
		--theme-background-color-dark: #3730a3;
	}

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
	}

	#theme.light {
		background-color: var(--theme-background-color-light);
	}

	#theme.dark {
		background-color: var(--theme-background-color-dark);
	}

	.nav-container {
		max-height: 128px;
	}

	.navbar {
		transition: all 0.2s ease-in-out;
		padding: 2rem 10rem;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	.link {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		line-height: 1.5rem;
		text-decoration: none;
	}

	#home-shortcut,
	#selection-shortcut {
		padding: 1rem;
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: bold;
		background: transparent;
	}

	#selection-shortcut {
		margin-left: 2rem;
		margin-right: auto;
	}

	a:hover {
		text-decoration: underline;
		cursor: pointer;
	}

	#button-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button {
		width: 2rem;
		height: auto;
		border: none;
		outline: none;
		cursor: pointer;
		border-radius: 50%;
		background-color: var(--button-background-color);
	}

	button:hover {
		opacity: 0.9;
	}

	button:active {
		transform: translateY(1px);
	}

	@media screen and (max-width: 768px) {
		.navbar {
			padding: 2rem;
		}

		.link {
			font-size: 0.875rem !important;
			line-height: 1.25rem !important;
		}

		button {
			width: 1.5rem;
			height: 1.5rem;
			padding: 3px;
			align-self: center;
		}
	}
</style>
