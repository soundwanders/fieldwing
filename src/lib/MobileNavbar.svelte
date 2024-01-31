<script lang="ts">
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme.js';
	import ThemeIcons from './ThemeIcons.svelte';
	import HamburgerIcon from './HamburgerIcon.svelte';

	let showMenu: boolean = false;
	let selectedPage: string = 'Teams';

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function toggleTheme() {
		theme.update((currentTheme: boolean) => {
			const newTheme = !currentTheme;
			localStorage.setItem('theme', newTheme ? 'dark' : 'light');
			return newTheme;
		});
	}

	const navigateToPage = () => {
		if (selectedPage) {
			goto(selectedPage);
			toggleMenu();
		}
	};
</script>

<div class="nav-container" role="navigation" class:light={!$theme} class:dark={$theme}>
	<nav class="navbar">
		<div class="left-section">
			<a id="home-shortcut" class="link" href="/" role="button" aria-label="Go to Home">
				<img class="fieldwing-logo" src="/fieldwing.png" alt="Fieldwing Logo" />
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
		</div>

		<div class="right-section">
			<span class="hamburger" aria-label="navigation-toggle-icon">
				<button
					class="hamburger-toggle-icon"
					class:light={!$theme}
					class:dark={$theme}
					on:click={toggleMenu}
					on:keydown={(e) => e.key === 'Enter' && toggleMenu()}
					aria-expanded={showMenu}
				>
					<HamburgerIcon bind:isOpen={showMenu} />
				</button>
			</span>

			<div class={showMenu ? 'dropdown-container show visible' : 'dropdown-container'}>
				<div class="nav-links" class:show={showMenu} role="navigation">
					<select
						bind:value={selectedPage}
						class="nav-dropdown"
						id="navigation-link-options"
						on:change={navigateToPage}
					>
						<option class="nav-item" id="teams-shortcut" value="/teams" role="button">Teams</option>
						<option class="nav-item" id="matchups-shortcut" value="/matchups" role="button"
							>Matchups</option
						>
						<option class="nav-item" id="players-shortcut" value="/players" role="button"
							>Players</option
						>
					</select>
				</div>
			</div>
		</div>
	</nav>
</div>

<style module>
	:root {
		--theme-background-color-light: #ffd586;
		--theme-background-color-dark: #302a8f;
	}

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
		--form-sub-background-color: #f4f4f5;
		--select-background-color: #d9d9dd;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
		--form-sub-background-color: #242b38;
		--select-background-color: #384357;
	}

	#theme.light {
		background-color: var(--theme-background-color-light);
	}

	#theme.dark {
		background-color: var(--theme-background-color-dark);
	}

	.fieldwing-logo {
		height: auto;
		width: 1.675rem;
		margin-right: 0.675rem;
	}

	.hamburger {
		display: flex;
		padding: 0 0.5rem;
		z-index: 10;
	}

	.hamburger-toggle-icon {
		margin-right: auto;
		background-color: transparent;
	}

	.nav-container {
		animation: fadeIn 0.2s forwards ease-out;
	}

	.navbar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	.dropdown-container {
		position: fixed;
		right: 12vw;
		padding: 1rem;
		margin-bottom: 0.25rem;
		transition: transform 0.3s ease;
		transform: translateX(-100%);
	}

	.dropdown-container.show {
		transform: translateX(0);
		z-index: 8;
	}

	.nav-dropdown {
		border: none;
		outline: none;
		color: var(--color);
		background-color: var(--select-background-color);
	}

	.nav-links {
		display: flex;
		align-items: center;
		text-align: center;
		display: none;
		border-radius: 0.5rem;
		padding: 0.25rem 0.5rem;
		background-color: var(--select-background-color);
	}

	.nav-links.show {
		display: flex;
	}

	.left-section {
		display: flex;
		align-items: center;
	}

	.right-section {
		display: flex;
		align-items: center;
	}

	#home-shortcut,
	#teams-shortcut,
	#matchups-shortcut,
	#players-shortcut {
		font-size: 0.75rem;
		line-height: 1rem;
		padding: 1rem 0.675rem;
		font-weight: bold;
		background: transparent;
	}

	a:hover {
		text-decoration: underline;
		cursor: pointer;
	}

	a:active {
		translate: 0 1px;
	}

	#button-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button {
		width: 1.2rem;
		height: auto;
		align-self: center;
		border: none;
		outline: none;
		border-radius: 50%;
		background-color: var(--button-background-color);
		cursor: pointer;
		padding: 3px;
	}

	#theme {
		width: 1.2rem;
		height: 1.2rem;
	}

	button:hover {
		opacity: 0.9;
	}

	button:active {
		translate: 0 1px;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
