<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme.js';
	import ThemeIcons from './ThemeIcons.svelte';
	import HamburgerIcon from './HamburgerIcon.svelte';

	let showMenu: boolean = false;

	// Reactive current page detection
	$: currentPath = $page.url.pathname;

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	function toggleTheme() {
		theme.update((currentTheme: boolean) => {
			const newTheme = !currentTheme;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('theme', newTheme ? 'dark' : 'light');
			}
			return newTheme;
		});
	}

	function navigateToPage(path: string) {
		closeMenu();
		goto(path);
	}

	// Close menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (showMenu && !target.closest('.nav-container')) {
			closeMenu();
		}
	}

	// Close menu on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showMenu) {
			closeMenu();
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="nav-container" role="navigation" class:light={!$theme} class:dark={$theme}>
	<nav class="navbar">
		<div class="left-section">
			<button
				class="home-link"
				on:click={() => navigateToPage('/')}
				aria-label="Go to Home"
				type="button"
			>
				<img class="fieldwing-logo" src="/fieldwing.png" alt="Fieldwing Logo" />
			</button>

			<button
				id="theme"
				class:light={!$theme}
				class:dark={$theme}
				on:click={toggleTheme}
				aria-label={`Switch to ${$theme ? 'light' : 'dark'} theme`}
				type="button"
			>
				<ThemeIcons />
			</button>
		</div>

		<div class="right-section">
			<button
				class="hamburger-toggle-icon"
				class:light={!$theme}
				class:dark={$theme}
				on:click={toggleMenu}
				aria-expanded={showMenu}
				aria-label="Toggle navigation menu"
				aria-controls="mobile-nav-menu"
				type="button"
			>
				<HamburgerIcon bind:isOpen={showMenu} />
			</button>

			{#if showMenu}
				<div
					class="dropdown-container show"
					id="mobile-nav-menu"
					role="menu"
					aria-label="Main navigation"
				>
					<nav class="nav-links">
						<button
							class="nav-item"
							class:active={currentPath === '/game-results'}
							on:click={() => navigateToPage('/game-results')}
							role="menuitem"
							type="button"
						>
							<span class="nav-icon">🏈</span>
							Games
						</button>

						<button
							class="nav-item"
							class:active={currentPath === '/matchups'}
							on:click={() => navigateToPage('/matchups')}
							role="menuitem"
							type="button"
						>
							<span class="nav-icon">⚔️</span>
							Matchups
						</button>

						<button
							class="nav-item"
							class:active={currentPath === '/players'}
							on:click={() => navigateToPage('/players')}
							role="menuitem"
							type="button"
						>
							<span class="nav-icon">👤</span>
							Player Stats
						</button>

						<button
							class="nav-item"
							class:active={currentPath === '/teams'}
							on:click={() => navigateToPage('/teams')}
							role="menuitem"
							type="button"
						>
							<span class="nav-icon">🏛️</span>
							Team Stats
						</button>
					</nav>
				</div>
			{/if}
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
		--nav-hover-color: #e5e5e5;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
		--form-sub-background-color: #242b38;
		--select-background-color: #384357;
		--nav-hover-color: #374151;
	}

	#theme.light {
		background-color: var(--theme-background-color-light);
	}

	#theme.dark {
		background-color: var(--theme-background-color-dark);
	}

	.nav-container {
		animation: fadeIn 0.2s forwards ease-out;
		position: relative;
		z-index: 1000;
	}

	.navbar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	.left-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.right-section {
		display: flex;
		align-items: center;
		position: relative;
	}

	.home-link {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.fieldwing-logo {
		height: auto;
		width: 1.675rem;
	}

	.hamburger-toggle-icon {
		background-color: transparent;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dropdown-container {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background-color: var(--select-background-color);
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.1);
		min-width: 200px;
		z-index: 1001;
		animation: slideDown 0.2s ease-out;
	}

	.nav-links {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		gap: 0.25rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: none;
		border: none;
		padding: 0.75rem 1rem;
		cursor: pointer;
		color: inherit;
		width: 100%;
		text-align: left;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.nav-item:hover {
		background-color: var(--nav-hover-color);
	}

	.nav-item.active {
		background-color: var(--primary-color, #424ae1);
		color: white;
	}

	.nav-item.active .nav-icon {
		filter: brightness(1.2);
	}

	.nav-icon {
		font-size: 1rem;
		display: inline-block;
		width: 1.2rem;
		text-align: center;
	}

	button {
		width: auto;
		height: auto;
		border: none;
		outline: none;
		background-color: transparent;
		cursor: pointer;
	}

	#theme {
		width: 1.2rem;
		height: 1.2rem;
		border-radius: 50%;
		padding: 3px;
	}

	button:hover {
		opacity: 0.9;
	}

	button:active {
		transform: translateY(1px);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Focus styles for accessibility */
	.nav-item:focus,
	.hamburger-toggle-icon:focus,
	.home-link:focus,
	#theme:focus {
		outline: 2px solid var(--primary-color, #424ae1);
		outline-offset: 2px;
	}
</style>
