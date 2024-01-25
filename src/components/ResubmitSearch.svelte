<!-- ResubmitSearch.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import fbsData from '../data/fbs.json';
	import fcsData from '../data/fcs.json';
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
	import { getCurrentYear } from '$lib/utils/getCurrentYear';

	let searchQuery: string = '';
	let searchResults: string[] = [];

	let selectedWeek: number = 1;
	let selectedYear: number = new Date().getFullYear();

	let selectedTeamsArray = $selectedTeams;

	const minQueryLength: number = 2;

	function searchTeams() {
		const query: string = searchQuery.toLowerCase();

		if (query.length >= minQueryLength) {
			searchResults = [...fbsData, ...fcsData].filter((team: string) => {
				return team.toLowerCase().includes(query);
			});
		} else {
			searchResults = [];
		}
	}

	function selectTeam(event: Event, team: string) {
		event.preventDefault();

		// Toggle selected team in the selectedTeams store
		selectedTeams.update((selectedTeams: string[]) => {
			if (selectedTeams.includes(team)) {
				return selectedTeams.filter((selectedTeam) => selectedTeam !== team);
			} else {
				return [...selectedTeams, team];
			}
		});

		// Trigger a re-render to update searchResults and highlight selected team
		searchTeams();
	}

	// Update searchResults when the component mounts to handle pre-selected teams
	onMount(() => {
		searchTeams();

		// Check if there's a week parameter in the URL
		const urlParams = new URLSearchParams(window.location.search);
		const weekParam = urlParams.get('week');
		const yearParam = urlParams.get('year');

		// Set selectedWeek based on the URL parameter or the current week
		selectedWeek = weekParam ? parseInt(weekParam, 10) : getCurrentWeek();

		// Set selectedYear based on the URL parameter or the current year
		selectedYear = yearParam ? parseInt(yearParam, 10) : getCurrentYear();

		selectedTeamsArray = $selectedTeams;
	});

	$: {
		selectedTeamsArray = $selectedTeams;
	}
</script>

<section class="resubmit-wrapper" class:light={!$theme} class:dark={$theme}>
	<div class="container">
		<div class="resubmit-container">
			<label for="teamSearch">Search for a Different Team:</label>
			<input
				type="text"
				id="teamSearch"
				bind:value={searchQuery}
				placeholder="Enter team name"
				on:input={searchTeams}
			/>
		</div>

		<div class="resubmit-container">
			<!-- Dropdown container for choosing which week to fetch -->
			<label for="resubmit-week">Select Week:</label>
			<select id="resubmit-week" bind:value={selectedWeek}>
				{#each [...Array(14).keys()] as week}
					<option value={week + 1}>{week + 1}</option>
				{/each}
			</select>
		</div>

		<div class="resubmit-container">
			<!-- Input for selecting the year -->
			<label for="resubmit-year">Select Year:</label>
			<input
				type="number"
				id="resubmit-year"
				bind:value={selectedYear}
				min={1900}
				max={new Date().getFullYear()}
			/>
		</div>

		<p id="search-query">
			You searched for:
			<span class="query-result">{searchQuery}</span>
		</p>

		<div class="search-results">
			{#if searchResults.length > 0}
				<ul class="team-list">
					{#each searchResults as team (team)}
						<li class="team-list-items">
							<button
								class="teams-button"
								on:mousedown={(event) => selectTeam(event, team)}
								class:selected={$selectedTeams.includes(team)}
								class:light={!$theme}
								class:dark={$theme}
								tabindex="0"
							>
								{team}
							</button>
						</li>
					{/each}
				</ul>
			{:else if searchQuery.length >= minQueryLength}
				<p>No teams found!</p>
			{/if}
		</div>

		<a
			href={selectedTeamsArray.length > 0
				? `/games?teams=${selectedTeamsArray.join(',')}&year=${selectedYear}&week=${selectedWeek}`
				: '#'}
			data-sveltekit-reload
		>
			<button type="button" class="resubmit-button" disabled={selectedTeamsArray.length === 0}>
				Submit
			</button>
		</a>
	</div>
</section>

<style module>
	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
		--highlight-text-color: #18181b;
		--highlight-color: #b2e7cb;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--highlight-text-color: #f9f9f9;
		--highlight-color: #336699;
	}

	.resubmit-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 0 1rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.container {
		margin-top: 2.5rem;
	}

	.resubmit-container {
		margin-bottom: 1.5rem;
	}

	label {
		padding: 2rem 0;
		font-weight: bold;
	}

	input {
		width: 85%;
		padding: 10px 0.5rem;
		padding-left: 10px;
		margin: 0.75rem 0;
		border: 1px solid #c3c8d0;
		border-radius: 0.25rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.search-results {
		min-height: 2rem;
		max-height: 2rem;
		width: 90%;
		padding: 0rem 0 1.5rem 0;
		border: 1px solid #c3c8d0;
		border-radius: 0.25rem;
		margin: 1rem 0;
		border-bottom: 1px solid #c3c8d0;
		overflow-y: auto;
	}

	.team-list-items {
		list-style-type: none;
		padding: 0.25rem 0.5rem 0.5rem 0.5rem;
	}

	.query-result {
		font-weight: bold;
	}

	#resubmit-week {
		padding: 3px;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	button {
		cursor: pointer;
		background: none;
		color: inherit;
		border: none;
		font: inherit;
		outline: inherit;
	}

	/* Submit Button Styles */
	.resubmit-button {
		cursor: pointer;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		padding: 0.25rem 0.675rem;
		background-color: var(--primary-color);
		color: #f9f9f9;
		margin-bottom: 3rem;
	}

	.resubmit-button:hover {
		opacity: 0.9;
	}

	button.selected {
		background-color: var(--highlight-color);
	}

	/* Media query for mobile devices */
	@media screen and (max-width: 768px) {
		.resubmit-wrapper {
			background-color: transparent;
		}

		.team-list {
			font-size: 0.875rem;
			line-height: 1.25rem;
		}

		.search-results {
			margin-bottom: 1.25rem;
		}
	}
</style>
