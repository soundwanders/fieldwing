<!-- Selector.svelte -->

<script lang="ts">
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	export let leagues: string[];
	export let selectedLeague: string;

	let selectedTeamsArray = $selectedTeams;
	let teams: string[] = [];
	let selectedWeek: number = 1;

	function loadTeams() {
		if (selectedLeague === 'All') {
			import('../data/fbs.json').then((fbsData) => {
				import('../data/fcs.json').then((fcsData) => {
					teams = [...fbsData.default, ...fcsData.default];
				});
			});
		} else if (selectedLeague === 'FBS') {
			import('../data/fbs.json').then((data) => {
				teams = data.default;
			});
		} else if (selectedLeague === 'FCS') {
			import('../data/fcs.json').then((data) => {
				teams = data.default;
				selectedTeamsArray = $selectedTeams;
			});
		} else {
			teams = [];
		}
		selectedWeek = 1;
	}

	// Toggle selection / deselection of teams
	// Update UI and ensure that selectedTeamsArray is updated on each selection
	const toggleSelection = (event: Event, team: string) => {
		event.preventDefault();

		if (selectedTeamsArray.includes(team)) {
			selectedTeams.update((teams) => teams.filter((t) => t !== team));
			selectedTeamsArray = $selectedTeams;
		} else {
			selectedTeams.update((teams) => [...teams, team]);
			selectedTeamsArray = $selectedTeams;
		}
	};

	onMount(() => {
		selectedTeamsArray = $selectedTeams;
	});

	$: {
		selectedTeamsArray = $selectedTeams;
	}
</script>

<section class="select-section" class:light={!$theme} class:dark={$theme}>
	<div class="selection-wrapper">
		<form class="selector-form" class:light={!$theme} class:dark={$theme}>
			<h2>Select Your Teams</h2>

			<div class="select-container">
				<div class="select-wrapper">
					<!-- Dropdown container for team lists -->
					<label for="league-select">Select a Conference:</label>
					<select id="league-select" bind:value={selectedLeague} on:change={loadTeams}>
							<option value="" disabled>...</option>
							{#each leagues as league}
									<option value={league}>{league}</option>
							{/each}
					</select>
				</div>

				<div class="select-wrapper">
					<label for="select-week">Select Week:</label>
					<select id="select-week" bind:value={selectedWeek}>
							{#each [...Array(17).keys()] as week}
									<option value={week + 1}>{week + 1}</option>
							{/each}
					</select>
				</div>
			</div>

			<div class="select-container">
				<div class="teams-container" class:light={!$theme} class:dark={$theme}>
					<ul>
						{#if teams.length > 0}
							{#each teams as team}
								<li>
									<button
										on:mousedown={(event) => toggleSelection(event, team)}
										class="teams-button"
										class:selected={$selectedTeams.includes(team)}
										tabindex="0"
									>
										{team}
									</button>
								</li>
							{/each}
						{:else}
							<p class="select-conference-placeholder">🏈 Select a conference to view teams</p>
						{/if}
					</ul>
				</div>
			</div>
		</form>

		<div class="selected-teams" class:light={!$theme} class:dark={$theme}>
			<h2>Selected Teams</h2>
			<ul>
				{#each selectedTeamsArray.filter(Boolean) as selectedTeam (selectedTeam)}
					<li class="selected-teams-list-items">
						<button on:mousedown={(event) => toggleSelection(event, selectedTeam)}>
							{selectedTeam}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Only enable submit button to redirect to results page if there are selected teams -->
		<a
			href={selectedTeamsArray.length > 0
				? `/results?teams=${selectedTeamsArray.join(',')}&week=${selectedWeek}`
				: '#'}
			data-sveltekit-prefetch
		>
			<button type="button" class="submit-button" disabled={selectedTeamsArray.length === 0}>
				Submit
			</button>
		</a>
	</div>
</section>

<style module>
	.select-section {
		width: 100vw;
		min-height: 100vh;
		display: flex;
		background-color: var(--background-color);
		color: var(--text-color);
		transition: background-color 0.2s ease;
	}

	.selection-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		align-content: center;
		width: 100%;
		min-height: 70vh;
		padding: 0.5rem 2.5rem;
		margin-top: 2rem;
	}

	/* Form */
	.selector-form {
		width: 100%;
		max-width: 20rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
    transition: background-color 0.2s ease;
	}

	/* Team Selection Form  */
	.selector-form h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.25rem;
		color: var(--text-color);
	}

	/* Select Container */
	.select-container {
		display: flex;
		align-items: flex-start;
		width: 100%;
		gap: 1rem;
	}

	/* Select Elements Wrapper */
	.select-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
	}

	/* Teams Container Select Elements */
  #league-select,
  #select-week {
		margin-top: 0.25rem;
    padding: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
		transition: background-color 0.2s ease;
  }

	label {
		font-size: 0.75rem;
		line-height: 1rem;
	}

	/* Teams List Container */
	.teams-container {
		min-height: 200px;
		max-height: 200px;
		width: 100%;
		padding: 0.3rem;
		margin-top: 1.25rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.teams-container ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.teams-container li {
		padding: 0.3rem 0.5rem;
		border-bottom: 1px solid #d1d5db;
		font-weight: bold;
	}

	.teams-button {
		cursor: pointer;
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		background-color: inherit;
		border: none;
		color: inherit;
	}

	.teams-container button.selected {
		background-color: var(--highlight-color);
	}

	.teams-container.dark button.selected {
		background-color: var(--highlight-color-dark);
	}

	.teams-container.dark button:hover {
		background-color: var(--highlight-color-dark);
	}
  
	/* Selected Teams Container */
	.selected-teams {
		width: 100%;
		max-width: 20rem;
		min-height: 200px;
		max-height: 200px;
		padding: 1.5rem;
		margin: 2rem 0 2rem 0;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		background-color: var(--form-background-color);
		color: var(--form-text-color);
		overflow-y: auto;
	}

	.selected-teams h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		color: inherit;
	}

	.selected-teams ul {
		list-style: none;
		padding: 0;
		margin: 0;
		color: inherit;
	}

	.selected-teams-list-items {
		padding: 0 0.5rem;
		border-bottom: 1px solid #d1d5db;
	}

	.selected-teams-list-items:last-child {
		border-bottom: none;
	}

	.select-conference-placeholder {
		padding: 0 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.selected-teams-list-items button {
		width: 100%;
		text-align: left;
		padding: 0.5rem 0;
		border: none;
		background-color: inherit;
		color: inherit;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	.selected-teams-list-items:hover {
		background-color: var(--highlight-color);
	}

	.selected-teams-list-items:hover {
		background-color: var(--highlight-color-dark);
	}

	/* Submit Button */
	.submit-button {
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		padding: 0.3rem 0.75rem;
		background-color: var(--primary-color);
		color: #fff;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	.submit-button:hover {
		opacity: 0.9;
	}

  .submit-button:disabled {
    background-color: #71717a;
    cursor: not-allowed;
  }

  .submit-button:hover:disabled {
    background-color: #52525b;
  }

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
	}

	/* Media query for mobile devices */
	@media screen and (max-width: 768px) {
		.selection-wrapper {
			margin-top: 1rem;
			min-height: 100%;
		}

		.select-section {
			width: 100%;
			margin: 0 auto;
		}

		.selected-teams {
			min-height: 140px;
			max-height: 140px;
		}
	}
</style>
