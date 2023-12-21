<!-- Searchbar.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import fbsData from '../data/fbs.json';
	import fcsData from '../data/fcs.json';
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';

	let searchQuery: string = '';
	let searchResults: string[] = [];
	const minQueryLength: number = 2;

	// Update searchResults when the component mounts to handle pre-selected teams
	onMount(() => {
		searchTeams();
	});

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
</script>

<div class="search-wrapper">
	<div class="search-flex-container">
		<div class="label-wrapper">
			<label for="teamSearch">Search for a Team:</label>
		</div>

		<div class="input-wrapper">
			<input
				type="text"
				class="team-searchbar"
				class:light={!$theme}
				class:dark={$theme}
				id="teamSearch"
				bind:value={searchQuery}
				placeholder="Enter team name"
				on:input={searchTeams}
			/>
		</div>
	</div>

	<div class="search-flex-container">
		<div class="label-wrapper">
			<p id="search-query">
				You searched for:
				<span class="query-result">{searchQuery}</span>
			</p>
		</div>

		<div class="input-wrapper">
			<div class="search-results" class:light={!$theme} class:dark={$theme}>
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
		</div>
	</div>
</div>

<style module>
	.search-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.search-flex-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.team-searchbar {
		flex-grow: 1;
		height: 2.5rem;
		padding: 0.3rem;
		margin: 0.75rem 0;
		box-sizing: border-box;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
	}

	.search-results {
		flex-grow: 1;
		height: 2.5rem;
		width: 300px;
		overflow-y: auto;
		padding: 0.3rem;
		margin-top: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
		box-sizing: border-box;
	}

	.label-wrapper {
		width: 100%;
		height: fit-content;
		text-align: left;
	}

	.input-wrapper {
		height: fit-content;
	}

	.team-list-items {
		list-style-type: none;
		padding: 0.4rem 0.5rem;
	}

	.query-result {
		font-weight: bold;
	}

	label {
		padding: 2rem 0;
		font-weight: bold;
	}

	button {
		cursor: pointer;
		background: none;
		color: inherit;
		border: none;
		font: inherit;
		outline: inherit;
	}

	button.selected {
		background-color: var(--highlight-color);
	}

	.light {
		--form-background-color: #f0f0f0;
		--form-sub-background-color: #eff4f1;
		--form-text-color: #09090b;
		--highlight-text-color: #18181b;
		--highlight-color: #b2e7cb;
	}

	.dark {
		--form-background-color: #1d232e;
		--form-sub-background-color: #242b38;
		--form-text-color: #09090b;
		--form-text-color: #f8fafc;
		--highlight-text-color: #f9f9f9;
		--highlight-color: #336699;
	}

	/* Media query for mobile devices */
	@media screen and (max-width: 768px) {
		.search-wrapper {
			flex-direction: column;
		}

		.search-flex-container {
			padding: 0 1rem;
			flex-direction: column;
		}

		.team-list {
			font-size: 0.875rem;
			line-height: 1.25rem;
		}

		.search-results {
			margin-bottom: 1.25rem;
		}

		.label-wrapper {
			width: 100%;
			text-align: center;
		}
	}
</style>
