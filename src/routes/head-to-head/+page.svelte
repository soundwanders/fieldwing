<!-- +page.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import '../../styles/main.css';
	import { formatStartDate } from '$lib/utils/formatStartDate';

	export let data: { matchupData?: any };
	const { matchupData } = data;

	let team1: string;
	let team2: string;

	$: {
		team1 = matchupData.team1;
		team2 = matchupData.team2;
	}

	console.log('matchupData', matchupData);
</script>

<section class="wrapper">
	<section class="results-section" class:light={!$theme} class:dark={$theme}>
		<div class="results-container">
			{#if matchupData}
				<div class="header-image-container">
					<img class="header-image" src="/h2h.png" alt="Head to Head Matchups" />
					<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
						{team1} 
						vs
						{team2}
						from {matchupData.startYear} to {matchupData.endYear}
					</h1>
				</div>
			
				<div class="head-to-head-container">
					{#each matchupData.games as gameResult, index (index)}
						{#if gameResult && gameResult.awayTeam && gameResult.homeTeam}
							<div class="head-to-head">
								<h2 class="matchup-teams" class:light={!$theme} class:dark={$theme}>
									<span class="team1">
										{gameResult.awayTeam} 
									</span>	
										at
									<span class="team2">
										{gameResult.homeTeam} 
									</span>
								</h2>

								<p class="matchup-info">
									Date: {formatStartDate(gameResult.date)}
								</p>

								<p class="matchup-info">
									Venue: {gameResult.venue}
								</p>

								<p class="matchup-result">
									{gameResult.winner} won with a score of {gameResult.homeScore} - {gameResult.awayScore}
								</p>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="no-data-message">
					Sorry, it seems like there is no head-to-head matchup data available for those two teams.
				</p>
			{/if}
		</div>
	</section>
</section>

<style>
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
		width: 100%;
		min-height: 100vh;
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
		margin: 0;
		padding: 0;
		color: var(--text-color);
	}

	.header-image-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header-image {
		width: 4%;
		height: auto;
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
	
	.team1 {
		color: var(--team-name-color);
	}

	.team2 {
		color: var(--team-name-color);
	}

	.head-to-head-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 100%;
		gap: 1.5rem;
	}

	.head-to-head {
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

	.head-to-head:hover {
		transform: scale(1.05);
	}

	.matchup-teams {
		font-size: 1.5rem;
		line-height: 2rem;
		color: var(--teams-color);
		margin-bottom: 0.5rem;
	}

	.matchup-info {
		font-size: 1rem;
		line-height: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--text-color);
	}

	.matchup-result {
		font-size: 1.2rem;
		line-height: 1.5rem;
		color: var(--teams-color);
	}

	.no-data-message {
		font-size: 1.2rem;
		line-height: 1.5rem;
		color: var(--text-color);
	}

	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
			min-height: 100%;
			margin: 0;
			padding: 0;
		}

		.head-to-head {
			flex: 1 1 auto;
		}

		.main-title {
			font-size: 1.5rem;
			line-height: 2rem;
		}

		.header-image {
			width: 25%;
			margin-bottom: 1rem;
		}

		.matchup-teams {
			font-size: 1.125rem;
			line-height: 1.75rem;
		}

		.matchup-result {
			font-size: 1rem;
			line-height: 1.5rem;
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
