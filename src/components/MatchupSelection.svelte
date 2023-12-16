<!-- MatchupSelection.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { selectedMatchupTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import fbsData from '../data/fbs.json';
	import fcsData from '../data/fcs.json';

	let minYear = '';
	let maxYear = '';
	let team1: string = '';
	let team2: string = '';
	let selectedConference: string = '';

	let selectedTeamsArray = $selectedMatchupTeams;

	const fbsTeams: string[] = fbsData;
	const fcsTeams: string[] = fcsData;

	// Filtered teams based on the selected conference
	let filteredTeams: string[] = [];

	function updateFilteredTeams() {
		if (selectedConference === 'FBS') {
			filteredTeams = fbsTeams;
		} else if (selectedConference === 'FCS') {
			filteredTeams = fcsTeams;
		} else if (selectedConference === 'All') {
			filteredTeams = [...fbsTeams, ...fcsTeams];
		} else {
			filteredTeams = [];
		}
	}

	function handleSubmit() {
		const [selectedTeam1, selectedTeam2] = $selectedMatchupTeams;

		// Navigate to the matchup route
		// Construct URL with selected teams, conference, and optional min/max years as query parameters
		goto(
			`/matchup?team1=${encodeURIComponent(selectedTeam1)}&team2=${encodeURIComponent(
				selectedTeam2
			)}&conference=${encodeURIComponent(selectedConference)}${
				minYear ? `&minYear=${minYear}` : ''
			}${maxYear ? `&maxYear=${maxYear}` : ''}`
		);
	}

	onMount(() => {
		selectedTeamsArray = $selectedMatchupTeams;
	});

	$: {
		selectedTeamsArray = $selectedMatchupTeams;
		updateFilteredTeams();
	}
</script>

<section class="select-section" class:light={!$theme} class:dark={$theme}>
	<div class="selection-wrapper">
		<form class="selector-form" class:light={!$theme} class:dark={$theme}>
			<h2>Select Teams for Matchup</h2>

			<div class="selector-container">
				<div class="team-selector-wrapper">
					<label for="conference-select">Select Conference:</label>
					<select
						id="conference-select"
						bind:value={selectedConference}
						class:light={!$theme}
						class:dark={$theme}
					>
						<option value="FBS">FBS</option>
						<option value="FCS">FCS</option>
						<option value="all">All</option>
					</select>
				</div>

				<div class="team-selector-wrapper">
					<label for="team1-select">Select Team 1:</label>
					<select id="team1-select" bind:value={team1} class:light={!$theme} class:dark={$theme}>
						{#each filteredTeams as team}
							<option value={team}>{team}</option>
						{/each}
					</select>
				</div>

				<div class="team-selector-wrapper">
					<label for="team2-select">Select Team 2:</label>
					<select id="team2-select" bind:value={team2} class:light={!$theme} class:dark={$theme}>
						{#each filteredTeams as team}
							<option value={team}>{team}</option>
						{/each}
					</select>
				</div>

				<div class="team-selector-wrapper">
					<label for="minYear">Min Year:</label>
					<input
						type="text"
						id="minYear"
						bind:value={minYear}
						class:light={!$theme}
						class:dark={$theme}
					/>
				</div>

				<div class="team-selector-wrapper">
					<label for="maxYear">Max Year:</label>
					<input
						type="text"
						id="maxYear"
						bind:value={maxYear}
						class:light={!$theme}
						class:dark={$theme}
					/>
				</div>
			</div>

			<div class="button-container">
				<a
					href={team1 && team2
						? `/matchup?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(
								team2
						  )}&conference=${encodeURIComponent(selectedConference)}${
								minYear ? `&minYear=${minYear}` : ''
						  }${maxYear ? `&maxYear=${maxYear}` : ''}`
						: '#'}
					data-sveltekit-prefetch
				>
					<button type="button" class="submit-button" disabled={!team1 || !team2}> Submit </button>
				</a>
			</div>
		</form>
	</div>
</section>

<style module>
	.select-section {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.selection-wrapper {
		width: 80%;
		max-width: 600px;
		padding: 1.5rem;
		margin-top: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		background-color: var(--background-color);
		color: var(--text-color);
		transition: background-color 0.2s ease;
	}

	.selector-form {
		display: flex;
		flex-direction: column;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 20px;
		text-align: center;
	}

	.selector-container {
		display: grid;
		gap: 10px;
	}

	.team-selector-wrapper {
		display: flex;
		flex-direction: column;
	}

	label {
		font-size: 0.9rem;
		margin-bottom: 5px;
		color: var(--label-color);
	}

	input,
	select {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
		background-color: var(--form-sub-background-color);
		color: var(--input-text-color);
	}

	.button-container {
		margin-top: 20px;
	}

	.submit-button {
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		padding: 0.25rem 0.675rem;
		color: #fff;
		background-color: var(--primary-color);
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	.submit-button:hover {
		opacity: 0.9;
	}

	.submit-button:disabled {
		background-color: var(--button-disabled-background-color);
		cursor: not-allowed;
	}

	.submit-button:hover:disabled {
		background-color: var(--button-disabled-hover-color);
	}

	/* Light Theme */
	.light {
		--background-color: #f0f0f0;
		--text-color: #333;
		--form-sub-background-color: #eff4f1;
		--label-color: #555;
		--input-background-color: #f9f9f9;
		--input-text-color: #333;
		--button-hover-color: #e0e0e0;
		--button-disabled-background-color: #7c7c7c;
		--button-disabled-hover-color: #5f5f5f;
		--placeholder-color: #888;
	}

	/* Dark Theme */
	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--form-sub-background-color: #242b38;
		--label-color: #b0b0b0;
		--input-background-color: #2b2b2b;
		--input-text-color: #f9f9f9;
		--button-hover-color: #444;
		--button-disabled-background-color: #707070;
		--button-disabled-hover-color: #5c5c5c;
		--placeholder-color: #666;
	}
</style>
