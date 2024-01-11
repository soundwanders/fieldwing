<!-- MatchupSelection.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedMatchupTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';

	export let divisions: string[];
	export let selectedDivision: string;

	let minYear = '';
	let maxYear = '';
	let teams: string[] = [];
	let selectedTeamsArray = $selectedMatchupTeams;
	let errorMessage: string = '';

	function loadTeams() {
		if (selectedDivision === 'All') {
			import('../data/fbs.json').then((fbsData) => {
				import('../data/fcs.json').then((fcsData) => {
					teams = [...fbsData.default, ...fcsData.default];
				});
			});
		} else if (selectedDivision === 'FBS') {
			import('../data/fbs.json').then((data) => {
				teams = data.default;
			});
		} else if (selectedDivision === 'FCS') {
			import('../data/fcs.json').then((data) => {
				teams = data.default;
				selectedTeamsArray = $selectedMatchupTeams;
			});
		} else {
			teams = [];
		}
	}

	function validateData() {
		if (!selectedTeamsArray[0] || !selectedTeamsArray[1]) {
			errorMessage = 'Please select both teams.';
			return false;
		}

		if (minYear && maxYear && parseInt(minYear) > parseInt(maxYear)) {
			errorMessage = 'Min year should be less than or equal to max year.';
			return false;
		}

		errorMessage = '';
		return true;
	}

	async function handleSubmit() {
		if (validateData()) {
			// if valid data, go to head to head matchup results
			goto(getHeadToHeadURL());
		}
	}

	function getHeadToHeadURL() {
		return `/head-to-head?team1=${encodeURIComponent(
			selectedTeamsArray[0]
		)}&team2=${encodeURIComponent(selectedTeamsArray[1])}&division=${encodeURIComponent(
			selectedDivision
		)}${minYear ? `&minYear=${minYear}` : ''}${maxYear ? `&maxYear=${maxYear}` : ''}`;
	}

	onMount(() => {
		selectedTeamsArray = $selectedMatchupTeams;
	});

	$: {
		selectedTeamsArray = $selectedMatchupTeams;
	}
</script>

<section class="select-section" class:light={!$theme} class:dark={$theme}>
	<figure class="vs-wrapper">
		<img class="matchup-image" src="/matchup.png" alt="Head to head matchups" />
	</figure>

	<div class="selection-wrapper">
		<form class="selector-form" class:light={!$theme} class:dark={$theme}>
			<h2>Select Teams for Matchup</h2>

			<div class="selector-container">
				<div class="team-selector-wrapper">
					<!-- Dropdown container for team lists -->
					<label for="division-select">Select a Division:</label>
					<select
						class="divisions-dropdown"
						id="division-select"
						class:light={!$theme}
						class:dark={$theme}
						bind:value={selectedDivision}
						on:change={loadTeams}
					>
						<option value="" disabled>...</option>
						{#each divisions as division}
							<option value={division}>{division}</option>
						{/each}
					</select>
				</div>

				<div class="team-selector-wrapper">
					<label for="team1-select">Select Team 1:</label>
					<select
						id="team1-select"
						bind:value={selectedTeamsArray[0]}
						class:light={!$theme}
						class:dark={$theme}
					>
						{#each teams as team}
							<option value={team}>{team}</option>
						{/each}
					</select>
				</div>

				<div class="team-selector-wrapper">
					<label for="team2-select">Select Team 2:</label>
					<select
						id="team1-select"
						bind:value={selectedTeamsArray[1]}
						class:light={!$theme}
						class:dark={$theme}
					>
						{#each teams.filter((team) => team !== selectedTeamsArray[0]) as team}
							<option value={team}>{team}</option>
						{/each}
					</select>
				</div>

				<div class="year-selector-wrapper">
					<div class="input-selector-wrapper">
						<label for="minYear">Min Year:</label>
						<input
							type="text"
							id="minYear"
							bind:value={minYear}
							class:light={!$theme}
							class:dark={$theme}
						/>
					</div>

					<div class="input-selector-wrapper">
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
					<button
						type="button"
						class="submit-button"
						disabled={!selectedTeamsArray[0] || !selectedTeamsArray[1]}
						on:click={handleSubmit}
					>
						Submit
					</button>
				</div>

				{#if errorMessage}
					<p class="error-message">{errorMessage}</p>
				{/if}
			</div>
		</form>
	</div>
</section>

<style module>
	.select-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.vs-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.matchup-image {
		height: auto;
		width: 8%;
	}

	.selection-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80%;
		max-width: 600px;
		padding: 1.5rem;
		margin-top: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 0.75rem;
		background-color: var(--form-background-color);
		color: var(--text-color);
		transition: background-color 0.2s ease;
		border: 1px solid #c3c8d0;
	}

	.selector-form {
		display: flex;
		flex-direction: column;
	}

	.selector-container {
		display: grid;
		gap: 10px;
		max-width: 420px;
	}

	.team-selector-wrapper {
		display: flex;
		flex-direction: column;
	}

	.year-selector-wrapper {
		display: flex;
		width: 100%;
		gap: 2rem;
	}

	.input-selector-wrapper {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		gap: 0.1rem;
	}

	.selector-form h2 {
		font-family: 'Nunito Sans';
		font-size: 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	label {
		font-size: 0.9rem;
		margin-bottom: 5px;
		color: var(--label-color);
	}

	input,
	select {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
		background-color: var(--form-sub-background-color);
		color: var(--input-text-color);
	}

	.button-container {
		display: flex;
		justify-content: center;
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
		--text-color: #333;
		--form-background-color: #eeeef0;
		--form-sub-background-color: #f4f4f5;
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
		--text-color: #f9f9f9;
		--form-background-color: #1d232e;
		--form-sub-background-color: #242b38;
		--label-color: #b0b0b0;
		--input-background-color: #2b2b2b;
		--input-text-color: #f9f9f9;
		--button-hover-color: #444;
		--button-disabled-background-color: #707070;
		--button-disabled-hover-color: #5c5c5c;
		--placeholder-color: #666;
	}

	/* Add media query for smaller screens */
	@media screen and (max-width: 768px) {
		.selection-wrapper {
			width: 90%;
			margin-bottom: 4rem;
		}

		.vs-wrapper img {
			width: 33%;
			height: auto;
			margin-right: -0.5rem;
		}

		.selector-form {
			width: 100%;
			margin-bottom: 2rem;
		}

		.selector-container {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.team-selector-wrapper,
		.year-selector-wrapper {
			width: 100%;
			max-width: 100%;
		}

		.input-selector-wrapper {
			width: 44%;
			max-width: 44%;
		}
	}
</style>
