<!-- Selector.svelte -->

<script lang="ts">
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { getCurrentYear } from '$lib/utils/getCurrentYear';

	export let conferences: string[];
	export let selectedConference: string;

	let selectedTeamsArray = $selectedTeams;
	let teams: string[] = [];
	let selectedWeek: number = 1;
	let selectedYear: number = new Date().getFullYear();

	// currentYear placeholder for select-year input element
	const currentYear = getCurrentYear();
	const yearString = getCurrentYear().toString();

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

<section class="submit-section" class:light={!$theme} class:dark={$theme}>
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
		display: flex;
		justify-content: center;
		align-items: flex-start;
		width: 100vw;
		height: 100%;
		color: var(--text-color);
		transition: background-color 0.2s ease;
	}

	.selection-wrapper {
		display: flex;
		justify-content: center;
		gap: 4rem;
		width: 60%;
		height: fit-content;
		padding: 0.5rem 2.5rem;
		margin-top: 0.5rem;
	}

	/* Team Selection Form */
	.selector-form {
		width: 100%;
		max-width: 20rem;
		border: 1px solid #c3c8d0;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
		transition: background-color 0.2s ease;
	}

	.selector-form h2 {
		font-family: 'Nunito Sans';
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 2rem;
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

	/* Teams Container Select Elements */
	#conference-select,
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
		border: 1px solid #c3c8d0;
		border-radius: 0.25rem;
		overflow-x: hidden;
		overflow-y: auto;
		background-color: var(--form-sub-background-color);
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
		border-bottom: 1px solid #c3c8d0;
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

	.teams-button:hover {
		background-color: var(--highlight-color);
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
		border: 1px solid #c3c8d0;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		overflow-y: auto;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
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
		border-bottom: 1px solid #c3c8d0;
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
		box-sizing: border-box;
	}

	.selected-teams button:hover {
		background-color: var(--highlight-color);
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

	.light {
		--text-color: #1a202c;
		--form-background-color: #eeeef0;
		--form-sub-background-color: #f4f4f5;
		--form-text-color: #09090b;
		--highlight-text-color: #18181b;
		--highlight-color: #b2e7cb;
		--button-disabled-background-color: #7c7c7c;
		--button-disabled-hover-color: #5f5f5f;
	}

	.dark {
		--text-color: #f9f9f9;
		--form-background-color: #1d232e;
		--form-sub-background-color: #242b38;
		--form-text-color: #f8fafc;
		--highlight-text-color: #f9f9f9;
		--highlight-color: #336699;
		--button-disabled-background-color: #707070;
		--button-disabled-hover-color: #5c5c5c;
	}

	/* Media query for mobile devices */
	@media screen and (max-width: 768px) {
		.selection-wrapper {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 90%;
			min-height: 100%;
			margin-top: 0.25rem;
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
