<!-- MatchupSelection.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { selectedMatchupTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';

	export let conferences: string[];
	export let selectedConference: string;

	let minYear = '';
	let maxYear = '';
	let teams: string[] = [];
	let selectedTeamsArray = $selectedMatchupTeams;

	function loadTeams() {
		if (selectedConference === 'All') {
			import('../data/fbs.json').then((fbsData) => {
				import('../data/fcs.json').then((fcsData) => {
					teams = [...fbsData.default, ...fcsData.default];
				});
			});
		} else if (selectedConference === 'FBS') {
			import('../data/fbs.json').then((data) => {
				teams = data.default;
			});
		} else if (selectedConference === 'FCS') {
			import('../data/fcs.json').then((data) => {
				teams = data.default;
				selectedTeamsArray = $selectedMatchupTeams;
			});
		} else {
			teams = [];
		}
	}

	onMount(() => {
		selectedTeamsArray = $selectedMatchupTeams;
	});

	$: {
		selectedTeamsArray = $selectedMatchupTeams;
	}
</script>

<section class="select-section" class:light={!$theme} class:dark={$theme}>
	<div class="vs-wrapper">
		<img src="/matchup.png" alt="Head to head matchups" />
	</div>

	<div class="selection-wrapper">
		<form class="selector-form" class:light={!$theme} class:dark={$theme}>
			<h2>Select Teams for Matchup</h2>

			<div class="selector-container">
				<div class="team-selector-wrapper">
					<!-- Dropdown container for team lists -->
					<label for="conference-select">Select a Conference:</label>
					<select
						class="conferences-dropdown"
						id="conference-select"
						class:light={!$theme}
						class:dark={$theme}
						bind:value={selectedConference}
						on:change={loadTeams}
					>
						<option value="" disabled>...</option>
						{#each conferences as conference}
							<option value={conference}>{conference}</option>
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
					<a
						href={selectedTeamsArray
							? `/head-to-head?team1=${encodeURIComponent(
									selectedTeamsArray[0]
							  )}&team2=${encodeURIComponent(selectedTeamsArray[1])}
							&conference=${encodeURIComponent(selectedConference)}
							${minYear ? `&minYear=${minYear}` : ''}
							${maxYear ? `&maxYear=${maxYear}` : ''}`
							: '#'}
						data-sveltekit-prefetch
					>
						<button
							type="button"
							class="submit-button"
							disabled={!selectedTeamsArray[0] || !selectedTeamsArray[1]}
						>
							Submit
						</button>
					</a>
				</div>
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

	.vs-wrapper img {
		max-width: 9%;
		height: auto;
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
			margin-bottom: 4rem;
		}

		.vs-wrapper img {
			max-width: 33%;
			height: auto;
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
			width: 45%;
			max-width: 45%;
		}
	}
</style>
