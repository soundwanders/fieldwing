<!-- +page.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { selectedTeams } from '$lib/stores/store';
	import '../../styles/main.css';

	let team1: string;
	let team2: string;

	export let data: { matchupData?: any[] };
	const { matchupData } = data;

	let teamNames: string;
	$: teamNames = `${team1} vs ${team2}`;

	console.log('matchupData', matchupData);
</script>

<section class="wrapper">
	<section class="results-section" class:light={!$theme} class:dark={$theme}>
		<div class="results-container">
			<h1>
				Head-to-Head Matchup for
				<span class="header-teams" class:light={!$theme} class:dark={$theme}>
					{teamNames}
				</span>
			</h1>

			{#if matchupData}
				<div class="head-to-head-container">
					{#each matchupData as matchup (matchup.id)}
						{#each matchup.data as gameResult (gameResult.id)}
							<div class="head-to-head" class:light={!$theme} class:dark={$theme}>
								<h2 class="matchup-info" class:light={!$theme} class:dark={$theme}>
									{matchup.team1} vs {matchup.team2}
								</h2>

								<p class="matchup-info">
									{matchup.details}
								</p>

								<p class="matchup-info">
									{matchup.result}
								</p>
							</div>
						{/each}
					{/each}
				</div>
			{:else}
				<p>Sorry, seems like there is no head-to-head matchup data available.</p>
			{/if}
		</div>
	</section>
</section>

<style>
	/* Styles specific to the matchup page */
	.head-to-head-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.head-to-head {
		width: max-content;
		text-align: center;
		padding: 0.5rem 2rem 1.5rem 2rem;
		margin: 0.5rem 3rem;
		margin-bottom: 1.25rem;
		border: 1px solid #d1d5db;
		border-radius: 5px;
		box-sizing: border-box;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		background-color: var(--background-color);
		color: var(--text-color);
		transition: transform 0.2s ease;
	}

	.matchup-info {
		font-size: 1rem;
		line-height: 1.25rem;
		margin-bottom: 0.5rem;
	}
</style>
