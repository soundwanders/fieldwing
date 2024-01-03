<!-- +page.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import '../../styles/main.css';
	import { formatStartDate } from '$lib/utils/formatStartDate';

	export let data: { matchupData?: any };
	const { matchupData } = data;

	let team1: string;
	let team2: string;

	let teamNames: string;

	$: {
		team1 = matchupData.team1;
		team2 = matchupData.team2;
		teamNames = `${team1} vs ${team2}`;
	}

	console.log('matchupData', matchupData);
</script>

<section class="wrapper">
	<section class="results-section" class:light={!$theme} class:dark={$theme}>
		<div class="results-container">
			{#if matchupData}
				<h1>
					Head-to-Head Matchup for
					<span class="header-teams" class:light={!$theme} class:dark={$theme}>
						{teamNames}
					</span>
				</h1>

				<p>Start Year: {matchupData.startYear}</p>
				<p>End Year: {matchupData.endYear}</p>

				<div class="head-to-head-container" class:light={!$theme} class:dark={$theme}>
					{#each matchupData.games as gameResult, index (index)}
						{#if gameResult && gameResult.awayTeam && gameResult.homeTeam}
							<div class="head-to-head">
								<h2 class="matchup-info" class:light={!$theme} class:dark={$theme}>
									{gameResult.awayTeam} vs {gameResult.homeTeam}
								</h2>

								<p class="matchup-info">
									Date: {formatStartDate(gameResult.date)}
								</p>

								<p class="matchup-info">
									Venue: {gameResult.venue}
								</p>

								<p class="matchup-info">
									Result: {gameResult.winner} won with a score of {gameResult.homeScore} - {gameResult.awayScore}
								</p>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<p>
					Sorry, it seems like there is no head-to-head matchup data available for those two teams.
				</p>
			{/if}
		</div>
	</section>
</section>

<style>
	.wrapper {
		width: 100vw;
		height: 100vh;
		background-color: var(--background-color);
		background-image: var(--background-image);
		margin: 0;
		padding: 0;
	}

	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
		--teams-color: #bb0000;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--teams-color: #ff9195;
	}

	.head-to-head-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		color: var(--text-color);
		animation: fadeIn 0.8s forwards ease-out;
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

	.head-to-head {
		width: max-content;
		text-align: center;
		padding: 0.5rem 2rem 1.5rem 2rem;
		margin: 0.5rem 3rem;
		margin-bottom: 1.25rem;
		border: 1px solid #c3c8d0;
		border-radius: 5px;
		box-sizing: border-box;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.matchup-info {
		font-size: 1rem;
		line-height: 1.25rem;
		margin-bottom: 0.5rem;
	}
</style>
