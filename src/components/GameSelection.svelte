<!-- Selector.svelte -->

<script lang="ts">
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { onDestroy, onMount } from 'svelte';
	import { getCurrentYear } from '$lib/utils/getCurrentYear';

	export let leagues: string[];
	export let selectedLeague: string;

	let selectedTeamsArray = $selectedTeams;
	let teams: string[] = [];
	let selectedWeek: number = 1;
	let selectedYear: number = new Date().getFullYear();

	// currentYear placeholder for select-year input element
	const currentYear = getCurrentYear();
	const yearString = getCurrentYear().toString();

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

			<div class="selector-container">
				<div class="team-selector-wrapper">
					<!-- Dropdown container for team lists -->
					<label for="league-select">Select a Conference:</label>
					<select
						class="conferences-dropdown"
						id="league-select"
						class:light={!$theme}
						class:dark={$theme}
						bind:value={selectedLeague}
						on:change={loadTeams}
					>
						<option value="" disabled>...</option>
						{#each leagues as league}
							<option value={league}>{league}</option>
						{/each}
					</select>
				</div>

				<!-- Dropdown for selecting the week -->
				<div class="team-selector-wrapper">
					<label for="select-week">Select Week:</label>
					<select
						class="weeks-dropdown"
						id="select-week"
						class:light={!$theme}
						class:dark={$theme}
						bind:value={selectedWeek}
					>
						{#each [...Array(17).keys()] as week}
							<option value={week + 1}>{week + 1}</option>
						{/each}
					</select>
				</div>

				<!-- Dropdown for selecting the year -->
				<div class="team-selector-wrapper">
					<label for="select-year">Select Year:</label>
					<input
						type="number"
						class="year-input"
						id="select-year"
						class:light={!$theme}
						class:dark={$theme}
						bind:value={selectedYear}
						min={1900}
						max={currentYear}
						placeholder={yearString}
					/>
				</div>
			</div>

			<div class="selector-container">
				<div class="teams-container" class:light={!$theme} class:dark={$theme}>
					<ul>
						{#if teams.length > 0}
							{#each teams as team}
								<li class="teams-container-list-item">
									<button
										on:mousedown={(event) => {
											event.preventDefault();
											toggleSelection(event, team);
										}}
										class="teams-button"
										class:light={!$theme}
										class:dark={$theme}
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
						<button
							on:mousedown={(event) => {
								event.preventDefault();
								toggleSelection(event, selectedTeam);
							}}
						>
							{selectedTeam}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<section class="submit-section">
	<div class="button-container">
		<!-- Only enable submit button to redirect to games page if there are selected teams -->
		<a
			href={selectedTeamsArray.length > 0
				? `/games?teams=${selectedTeamsArray.join(',')}&year=${selectedYear}&week=${selectedWeek}`
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
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		background-color: var(--background-color);
		color: var(--text-color);
		transition: background-color 0.2s ease;
	}

	.selection-wrapper {
		display: flex;
		justify-content: center;
		gap: 4rem;
		width: 60%;
		height: 50%;
		height: fit-content;
		padding: 0.5rem 2.5rem;
		margin-top: 2rem;
	}

	/* Team Selection Form */
	.selector-form {
		width: 100%;
		max-width: 20rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--form-background-color) !important;
		color: var(--form-text-color) !important;
		transition: background-color 0.2s ease;
	}

	.selector-form.dark {
		background-color: var(--form-background-color-dark) !important;
		color: var(--form-text-color-dark) !important;
	}

	.selector-form h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.25rem;
	}

	/* Selection Container */
	.selector-container {
		display: flex;
		align-items: flex-end;
		width: 100%;
		gap: 1rem;
	}

	/* Select Elements Flex Wrapper */
	.team-selector-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
		background-color: transparent;
	}

	.conferences-dropdown,
	.weeks-dropdown,
	.year-input {
		background-color: var(--form-sub-background-color);
	}

	.conferences-dropdown.dark,
	.weeks-dropdown.dark,
	.year-input.dark {
		background-color: var(--form-sub-background-color-dark);
	}

	/* Teams Container Select Elements */
	#league-select,
	#select-week,
	#select-year {
		margin-top: 0.25rem;
		padding: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		border: 1px solid #ced4da;
		border-radius: 0.25rem;
		color: inherit;
	}

	#select-year {
		max-width: 6rem;
	}

	option {
		background-color: inherit;
		color: inherit;
	}

	/* Select element labels */
	label {
		font-size: 0.75rem;
		line-height: 1rem;
		background-color: inherit;
		color: inherit;
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
		background-color: var(--form-sub-background-color);
	}

	.teams-container.dark {
		background-color: var(--form-sub-background-color-dark);
	}

	.teams-container ul {
		list-style: none;
		padding: 0;
		margin: 0;
		background-color: inherit;
		color: inherit;
	}

	.teams-container-list-item {
		padding: 0.3rem 0.5rem;
		border-bottom: 1px solid #d1d5db;
		font-weight: bold;
	}

	.teams-container-list-item button {
		cursor: pointer;
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		border: none;
		border-radius: 0.25rem;
		background-color: inherit;
		color: inherit;
		box-sizing: border-box;
	}

	.teams-button.selected {
		background-color: var(--highlight-color);
	}

	.teams-button.dark.selected {
		background-color: var(--highlight-color-dark);
	}

	.teams-button:hover {
		background-color: var(--highlight-color);
	}

	.teams-button.dark:hover {
		background-color: var(--highlight-color-dark);
	}

	.select-conference-placeholder {
		padding: 0 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: inherit;
		background-color: inherit;
	}

	/* Selected Teams Container */
	.selected-teams {
		width: 100%;
		max-width: 20rem;
		padding: 1.5rem;
		margin: 0;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		overflow-y: auto;
		background-color: var(--form-background-color) !important;
		color: var(--form-text-color) !important;
	}

	.selected-teams.dark {
		background-color: var(--form-background-color-dark) !important;
		color: var(--form-text-color-dark) !important;
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
		padding: 0 0.5rem 0.25rem 0.5rem;
		margin: 0.5rem 0;
		border-bottom: 1px solid #d1d5db;
		background-color: inherit;
		color: inherit;
		box-sizing: border-box;
	}

	.selected-teams-list-items:last-child {
		border-bottom: none;
	}

	.selected-teams-list-items button {
		width: 100%;
		font-size: 1rem;
		line-height: 1.25rem;
		text-align: left;
		padding: 0.5rem;
		border: none;
		border-radius: 0.25rem;
		background-color: inherit;
		color: inherit;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		box-sizing: border-box;
	}

	.selected-teams button:hover {
		background-color: var(--highlight-color);
	}

	.selected-teams.dark button:hover {
		background-color: var(--highlight-color-dark);
	}

	/* Submit Button Styles */
	.button-container {
		width: 100%;
		display: flex;
		justify-content: center;
		margin: 2rem 0;
	}

	.submit-button {
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		padding: 0.25rem 0.5rem;
		color: #fff;
		background-color: var(--primary-color);
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	.submit-button:hover {
		opacity: 0.9;
	}

	.submit-button:disabled {
		background-color: #525252;
		cursor: not-allowed;
	}

	.submit-button:hover:disabled {
		background-color: #404040;
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
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			min-height: 100%;
			margin-top: 1rem;
			gap: 2.5rem;
		}

		h2 {
			margin-top: 0;
		}

		.select-section {
			width: 100%;
			margin: 0 auto;
		}

		.team-selector-wrapper {
			align-self: end;
		}

		.selected-teams {
			min-height: 140px;
			max-height: 140px;
			margin: 0;
		}

		.selected-teams ul {
			padding-bottom: 2rem;
		}

		.selected-teams-list-items button {
			font-size: 0.875rem;
			line-height: 1rem;
		}

		.button-container {
			margin: 1rem 0 2rem 0;
		}
	}
</style>
