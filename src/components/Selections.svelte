<!-- Selector.svelte -->

<script lang="ts">
	import LeagueSelector from './LeagueSelector.svelte';
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';

	let teams: any[] = [];
	let selectedTeam = '';
	let selectedLeague: string;
	const selectedTeamsArray = $selectedTeams;

	function toggleSelection(team: string) {
		selectedTeams.update((selectedTeams: string[]) => {
			if (selectedTeams.includes(team)) {
				return selectedTeams.filter((t) => t !== team);
			} else {
				return [...selectedTeams, team];
			}
		});
	}

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
			});
		} else {
			teams = [];
		}
	}
</script>

<section class="select-section" class:light={!$theme} class:dark={$theme}>
	<form class="selector-form">
		<h2>Select Teams</h2>

		<LeagueSelector leagues={['All', 'FBS', 'FCS']} bind:selectedLeague />

		<button type="button" class="select-team-button" class:light={!theme} class:dark={theme}>
			<span>{selectedTeam || 'Select a team'}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>

		<select bind:value={selectedTeam} aria-hidden="true" tabindex="-1">
			<option value="" />
			{#each teams as team}
				<option value={team}>{team}</option>
			{/each}
		</select>

		<button class="submit-team-button" type="button" on:click={() => toggleSelection(selectedTeam)}>
			Submit
		</button>
	</form>

	<div class="selected-items mt-10">
		<h2>Selected Items</h2>
		<ul>
			{#each selectedTeamsArray as selectedTeam}
				<li>{selectedTeam}</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.select-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		padding: 2.5rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.selector-form {
		width: 100%;
		max-width: 20rem;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.selector-form h2 {
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		color: #f9f9f9;
	}

	.select-team-button {
		display: flex;
		height: 2.5rem;
		align-items: center;
		justify-content: space-between;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		background-color: var(--background-color);
		color: var(--text-color);
		padding: 0.75rem;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}

	.select-team-button span {
		pointer-events: none;
	}

	.select-team-button svg {
		height: 1rem;
		width: 1rem;
		opacity: 0.5;
		background-color: var(--button-background-color);
	}

	.submit-team-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
		outline: none;
		cursor: pointer;
		background-color: var(--button-background-color);
		color: var(--text-color);
	}

	.submit-team-button:disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.submit-team-button:hover {
		background-color: #4299e1;
		color: var(--text-color);
	}

	.mt-10 {
		margin-top: 2.5rem;
	}

	.selected-items {
		width: 100%;
		max-width: 20rem;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.selected-items h2 {
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.selected-items li {
		border-bottom: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.selected-items li:last-child {
		border-bottom: none;
	}

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
	}
</style>
