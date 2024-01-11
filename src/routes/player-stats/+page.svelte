<!-- src/routes/stats/+page.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import '../../styles/main.css';

	export let data: { playerStatsData?: any };
	const { playerStatsData } = data;
</script>

<div class="wrapper">
	<div class="results-section" class:light={!$theme} class:dark={$theme}>
		<section class="results-container">
			{#if playerStatsData && playerStatsData.length > 0}
				<div class="header-image-wrapper">
					<img class="h2h-image" src="/h2h.png" alt="Player Stats" />
					<h1 class="main-title" class:light={!$theme} class:dark={$theme}>Player Statistics</h1>
				</div>

				<div class="player-stats-container">
					{#each playerStatsData as playerStats}
						<article class="player-stats">
							<h2 class="player-name" class:light={!$theme} class:dark={$theme}>
								{playerStats.player}
							</h2>

							{#if playerStats.team}
								<div class="info-container">
									<p><strong>Team:</strong> {playerStats.team}</p>
								</div>
							{/if}

							{#if playerStats.conference}
								<div class="info-container">
									<p><strong>Conference:</strong> {playerStats.conference}</p>
								</div>
							{/if}

							{#if playerStats.startWeek && playerStats.endWeek}
								<div class="info-container">
									<p><strong>Start Week:</strong> {playerStats.startWeek}</p>
									<p><strong>End Week:</strong> {playerStats.endWeek}</p>
								</div>
							{/if}

							{#if playerStats.seasonType}
								<div class="info-container">
									<p><strong>Season Type:</strong> {playerStats.seasonType}</p>
								</div>
							{/if}

							{#if playerStats.category}
								<div class="info-container">
									<p><strong>Category:</strong> {playerStats.category}</p>
								</div>
							{/if}

							{#if playerStats.stats && playerStats.stats.length > 0}
								<div class="stats-container">
									{#each playerStats.stats as stat}
										<p>{stat.label}: {stat.value}</p>
									{/each}
								</div>
							{/if}
						</article>
					{/each}
				</div>
			{:else}
				<p class="no-data-message">No player stats data available.</p>
			{/if}
		</section>
	</div>
</div>

<style module>
	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
		--teams-color: #bb0000;
		--team-name-color: #005ebb;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--teams-color: #ff9195;
		--team-name-color: #abaeff;
	}

	.wrapper {
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: baseline;
		justify-content: center;
		background-color: var(--background-color);
		background-image: var(--background-image);
		margin: 0;
		padding: 0;
	}

	.results-section {
		display: flex;
		justify-content: center;
		width: 100vw;
		color: var(--text-color);
	}

	.header-image-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2rem;
	}

	.h2h-image {
		height: auto;
		width: 3.5%;
		margin-right: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.results-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.main-title {
		font-size: 2.25rem;
		line-height: 2.5rem;
		text-wrap: balance;
		text-align: center;
		color: var(--text-color);
	}

	.player-stats-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90%;
		gap: 2rem;
	}

	.player-stats {
		flex: 0 0 calc(33.33% - 1.5rem);
		text-align: center;
		margin-bottom: 0.5rem;
		padding: 1.25rem;
		border: 1px solid #c3c8d0;
		border-radius: 0.75rem;
		box-sizing: border-box;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease-in-out;
	}

	.player-stats {
		transform: scale(1.05);
	}

	.no-data-message {
		font-size: 1.2rem;
		line-height: 1.5rem;
		color: var(--text-color);
	}

	@media (max-width: 768px) {
		.wrapper {
			min-height: 100%;
			width: 100%;
			margin: 0;
			padding: 0;
		}

		.player-stats {
			flex: 1 1 auto;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
		}

		.header-image-wrapper {
			width: 90%;
			margin-bottom: 1rem;
		}

		.h2h-image {
			width: 25%;
			height: auto;
			margin-right: -1rem;
			margin-bottom: 0;
		}
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
