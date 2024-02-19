<script>
	import { theme } from '$lib/stores/theme.js';
	import { media } from '$lib/utils/media';
	import ThemeIcons from './ThemeIcons.svelte';
	import MobileNavbar from './MobileNavbar.svelte';
	import { onMount } from 'svelte';

	let isMobile = false;

	const updateIsMobile = () => {
		isMobile = media('(max-width: 768px)');
	};

	onMount(() => {
		updateIsMobile();
		window.addEventListener('resize', updateIsMobile);
		return () => {
			window.removeEventListener('resize', updateIsMobile);
		};
	});

	function toggleTheme() {
		theme.update((currentTheme) => {
			const newTheme = !currentTheme;
			localStorage.setItem('theme', newTheme ? 'dark' : 'light');
			return newTheme;
		});
	}
</script>

{#if isMobile}
	<div class="mobile-container">
		<MobileNavbar />
	</div>
{:else}
	<div class="nav-container" role="navigation">
		<nav class="navbar" class:light={!$theme} class:dark={$theme}>
			<a
				id="home-shortcut"
				class="link"
				class:light={!$theme}
				class:dark={$theme}
				href="/"
				aria-label="Go to Home"
			>
				<img class="fieldwing-logo" src="/fieldwing.png" alt="Fieldwing Logo" />
			</a>

			<a
				id="games-shortcut"
				class="link"
				class:light={!$theme}
				class:dark={$theme}
				href="/game-results"
				aria-label="Go to Game Results page"
			>
				Games
			</a>

			<a
				id="matchup-shortcut"
				class="link"
				class:light={!$theme}
				class:dark={$theme}
				href="/matchups"
				aria-label="Go to Head-to-Head Matchups page"
			>
				Matchups
			</a>

			<a
				id="player-stats-shortcut"
				class="link"
				class:light={!$theme}
				class:dark={$theme}
				href="/players"
				aria-label="Go to Player Statistics page"
			>
				Player Stats
			</a>

			<a
				id="team-stats-shortcut"
				class="link"
				class:light={!$theme}
				class:dark={$theme}
				href="/teams"
				aria-label="Go to Team Statistics page"
			>
				Team Stats
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
{/if}

<style module>
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
		animation: fadeIn 0.2s forwards ease-out;
	}

	.navbar {
		padding: 2rem 10rem;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	.fieldwing-logo {
		height: auto;
		width: 1.875rem;
	}

	.link {
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}

	#home-shortcut,
	#games-shortcut,
	#matchup-shortcut,
	#player-stats-shortcut,
	#team-stats-shortcut {
		padding: 1rem 2rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: bold;
		background: transparent;
	}

	#team-stats-shortcut {
		margin-right: auto;
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
		width: 1.5rem;
		height: auto;
		border: none;
		outline: none;
		border-radius: 50%;
		background-color: var(--button-background-color);
		cursor: pointer;
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

	@media screen and (max-width: 768px) {
		.navbar {
			padding: 2rem;
		}

		.fieldwing-logo {
			height: auto;
			width: 1.675rem;
		}

		#home-shortcut,
		#games-shortcut,
		#matchup-shortcut,
		#player-stats-shortcut,
		#team-stats-shortcut {
			font-size: 0.75rem;
			line-height: 1rem;
			padding: 1rem 0.675rem;
		}

		button {
			width: 1.2rem;
			height: 1.2rem;
			padding: 3px;
			align-self: center;
		}
	}
</style>
