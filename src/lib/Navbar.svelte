<script>
	import { theme } from '$lib/stores/theme.js';
	import ThemeIcons from '../components/ThemeIcons.svelte';

	function toggleTheme() {
		theme.update((currentTheme) => {
			const newTheme = !currentTheme;
			localStorage.setItem('theme', newTheme ? 'dark' : 'light');
			return newTheme;
		});
	}
</script>

<div>
	<nav class="navbar" class:light={!$theme} class:dark={$theme}>
		<a id="home-shortcut" class="link" class:light={!$theme} class:dark={$theme} href="/">
			Fieldwing
		</a>

		<a
			id="selection-shortcut"
			class="link"
			class:light={!$theme}
			class:dark={$theme}
			href="/selection"
		>
			Selection
		</a>

		<button id="theme" class:light={!$theme} class:dark={$theme} on:click={toggleTheme}>
			<ThemeIcons {theme} />
		</button>
	</nav>
</div>

<style>
	.navbar {
		transition: all 0.2s ease-in-out;
		padding: 2rem;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	#home-shortcut,
	#selection-shortcut {
		padding: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
		background: transparent;
	}

	.link {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		line-height: 1.5rem;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
		cursor: pointer;
	}

	button {
		width: 2rem;
		height: 2rem;
		border: none;
		outline: none;
		cursor: pointer;
		border-radius: 50%;
		padding: 6px 6px 3px 6px;
		background-color: var(--button-background-color);
	}

	button:hover {
		opacity: 0.8;
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
		background-color: var(--button-background-color-light);
	}

	#theme.dark {
		background-color: var(--button-background-color-dark);
	}

	:root {
		--button-background-color-light: #fac668;
		--button-background-color-dark: #3730a3;
	}
</style>
