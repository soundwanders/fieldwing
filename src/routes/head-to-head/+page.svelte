<!-- src/routes/head-to-head/+page.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { formatStartDate } from '$lib/utils/formatStartDate';
	import MatchupSelection from '$lib/components/MatchupSelection.svelte';
	import { goto } from '$app/navigation';
	import '../../styles/main.css';

	export let data: { matchupData?: any; error?: string };
	const { matchupData } = data;

	let divisions = ['All', 'FBS', 'FCS'];
	let selectedDivision: string = '';

	if (!data || !data.matchupData) {
		goto('/matchups');
	}

	let team1: string;
	let team2: string;

	$: {
		team1 = matchupData?.team1;
		team2 = matchupData?.team2;
	}
</script>

<div class="wrapper">
	<div class="results-section" class:light={!$theme} class:dark={$theme}>
		<section class="results-container">
			{#if matchupData && matchupData.games && matchupData.games.length > 0}
				<div class="header-image-wrapper">
					<img class="h2h-image" src="/h2h.png" alt="Head to Head Matchups" aria-hidden="true" />
					<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
						{team1 ? team1 : ''}
						vs
						{team2 ? team2 : ''}
						from
						{matchupData.startYear || 'Unknown Start Year'}
						to
						{matchupData.endYear || 'Unknown End Year'}
					</h1>
				</div>
				<div class="head-to-head-container">
					{#each matchupData.games as gameResult, index (index)}
						{#if gameResult && gameResult.awayTeam && gameResult.homeTeam}
							<article class="head-to-head">
								<div class="matchup-teams" class:light={!$theme} class:dark={$theme}>
									<div class="team-row">
										<span class="team1">
											{gameResult.awayTeam}
										</span>
										<span class="at">at</span>
										<span class="team2">
											{gameResult.homeTeam}
										</span>
									</div>
									<div class="score-row">
										<span class="score">{gameResult.awayScore}</span>
										<span class="dash">-</span>
										<span class="score">{gameResult.homeScore}</span>
									</div>
								</div>

								<p class="matchup-result">
									{gameResult.winner} won with a score of {gameResult.homeScore} - {gameResult.awayScore}
								</p>

								<p class="matchup-info">
									Date: {formatStartDate(gameResult.date)}
								</p>

								<p class="matchup-info">Venue: {gameResult.venue || 'Unknown Venue'}</p>
							</article>
						{/if}
					{/each}
				</div>
			{:else}
				<p class="no-data-message">
					Sorry, it seems like there is no head-to-head matchup data available for those two teams.
				</p>
				<MatchupSelection {divisions} {selectedDivision} />
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
		--team-name-color: #bfc1ff;
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
		margin-bottom: 0.25rem;
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
		justify-content: center;
		width: 90%;
		gap: 2rem;
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
		transform: scale(1.02);
		transition: transform 0.3s ease-out;
	}

	.matchup-teams {
		text-wrap: balance;
		text-align: center;
		color: var(--teams-color);
		margin-bottom: 0.5rem;
	}

	.team-row {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5rem;
		line-height: 2rem;
	}

	.matchup-info {
		font-size: 0.875rem;
		line-height: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--text-color);
	}

	.matchup-result {
		font-size: 1rem;
		line-height: 1.25rem;
		font-weight: 600;
		padding-top: 0.25rem;
		color: var(--teams-color);
	}

	.at {
		color: var(--text-color);
		margin: 0 0.5rem;
	}

	.score-row {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2.5rem;
		line-height: 1;
		padding: 1rem 0 0.5rem 0;
		color: var(--teams-color);
	}

	.score {
		border: 1px solid #ccc;
		padding: 0.875rem;
		border-radius: 0.25rem;
		margin: 0 2rem;
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
			background-color: transparent;
			background-image: none;
		}

		.head-to-head {
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
			display: none;
		}

		.head-to-head {
			width: 90%;
		}

		.team-row {
			font-size: 1.5rem;
			line-height: 1.5rem;
		}

		.score-row {
			font-size: 2rem;
			line-height: 1;
		}

		.matchup-info,
		.matchup-result {
			font-size: 0.875rem;
			line-height: 1.25rem;
		}
	}

	/* Mobile Responsive Fixes for Head-to-Head Page */
	@media (max-width: 480px) {
		.wrapper {
			min-height: 100vh;
			width: 100%;
			padding: 0.5rem;
			box-sizing: border-box;
		}

		.results-section {
			width: 100%;
			padding: 0;
		}

		.results-container {
			width: 100%;
			padding: 0;
		}

		.header-image-wrapper {
			width: 100%;
			margin-bottom: 1rem;
			flex-direction: column;
			text-align: center;
		}

		.h2h-image {
			width: 20%;
			margin-right: 0;
			margin-bottom: 0.5rem;
		}

		.main-title {
			font-size: 1.125rem;
			line-height: 1.4;
			margin: 0;
			padding: 0 0.5rem;
			word-wrap: break-word;
			hyphens: auto;
			text-align: center;
		}

		.head-to-head-container {
			width: 100%;
			gap: 0.75rem;
			padding: 0 0.5rem;
			flex-direction: column;
		}

		.head-to-head {
			width: 100%;
			margin: 0;
			padding: 1rem;
			box-sizing: border-box;
			flex: none;
		}

		.matchup-teams {
			margin-bottom: 0.75rem;
		}

		.team-row {
			font-size: 1rem;
			line-height: 1.3;
			flex-wrap: wrap;
			gap: 0.25rem;
			justify-content: center;
			text-align: center;
		}

		.team1,
		.team2 {
			word-wrap: break-word;
			hyphens: auto;
			flex: 1;
			min-width: 0;
		}

		.at {
			flex-shrink: 0;
			margin: 0 0.25rem;
		}

		.score-row {
			font-size: 1.75rem;
			line-height: 1.2;
			padding: 0.75rem 0 0.5rem 0;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.score {
			padding: 0.5rem;
			margin: 0 0.5rem;
			font-size: 1.5rem;
			border-radius: 0.375rem;
		}

		.dash {
			margin: 0 0.25rem;
		}

		.matchup-info,
		.matchup-result {
			font-size: 0.8rem;
			line-height: 1.3;
			margin-bottom: 0.5rem;
			text-align: center;
			word-wrap: break-word;
		}

		.matchup-result {
			font-weight: 600;
			padding-top: 0.5rem;
		}

		.no-data-message {
			font-size: 1rem;
			line-height: 1.4;
			padding: 1rem;
			text-align: center;
			margin: 1rem 0;
		}
	}

	@media (max-width: 360px) {
		.wrapper {
			padding: 0.25rem;
		}

		.main-title {
			font-size: 1rem;
			line-height: 1.3;
		}

		.head-to-head {
			padding: 0.75rem;
		}

		.team-row {
			font-size: 0.9rem;
		}

		.score-row {
			font-size: 1.5rem;
		}

		.score {
			font-size: 1.25rem;
			padding: 0.375rem;
			margin: 0 0.25rem;
		}

		.matchup-info,
		.matchup-result {
			font-size: 0.75rem;
		}
	}

	/* Tablet improvements */
	@media (min-width: 481px) and (max-width: 768px) {
		.wrapper {
			padding: 1rem;
		}

		.main-title {
			font-size: 1.5rem;
			line-height: 1.4;
		}

		.head-to-head-container {
			width: 95%;
			gap: 1rem;
		}

		.head-to-head {
			flex: 0 0 calc(50% - 0.5rem);
			max-width: calc(50% - 0.5rem);
		}

		.h2h-image {
			width: 6%;
		}
	}

	/* Large screens adjustment */
	@media (min-width: 1025px) {
		.head-to-head-container {
			width: 85%;
		}

		.head-to-head {
			flex: 0 0 calc(33.33% - 1.5rem);
			max-width: calc(33.33% - 1.5rem);
		}
	}
</style>
