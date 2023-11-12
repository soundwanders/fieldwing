<!-- Selector.svelte -->

<script lang="ts">
	import { selectedTeams } from '$lib/stores/store';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	export let leagues: string[];
	export let selectedLeague: string;

	let teams: any[] = [];
	let selectedTeam = '';
	let selectedTeamsArray = $selectedTeams;

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

	const toggleSelection = () => {
		if (selectedTeamsArray.includes(selectedTeam)) {
			selectedTeams.update((teams) => teams.filter((t) => t !== selectedTeam));
		} else {
			selectedTeams.update((teams) => [...teams, selectedTeam]);
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
	<div class="container">
		<form class="selector-form" class:light={!$theme} class:dark={$theme}>
			<h2>Select Teams</h2>

			<select id="leagueSelect" bind:value={selectedLeague} on:change={loadTeams}>
				{#each leagues as league}
					<option value={league}>{league}</option>
				{/each}
			</select>

			<select class="teams-container" bind:value={selectedTeam} aria-hidden="true" tabindex="-1">
				<option value="" />
				{#each teams as team}
					<option value={team}>{team}</option>
				{/each}
			</select>

			<button
				class="submit-team-button"
				type="button"
				on:click={toggleSelection}
				aria-label={`Toggle selection for ${selectedTeam}`}
			>
				{selectedTeamsArray.includes(selectedTeam) ? 'Remove' : 'Add'}
			</button>
		</form>

		<div class="selected-teams mt-10">
			<h2>Selected Items</h2>
			<ul>
				{#each selectedTeamsArray as selectedTeam}
					<li>{selectedTeam}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.select-section {
		width: 100vw;
		min-height: 100vh;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 90vh;
		padding: 2.5rem;
	}

	.selector-form {
		width: 100%;
		max-width: 20rem;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
	}

	.selector-form h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		color: #f9f9f9;
	}

	.teams-container {
		max-height: 200px;
		width: 600px;
		max-width: 600px;
		padding: 1rem 0.3rem;
		overflow-y: auto; /* Enable vertical scrolling due to list being longer than parent container */
	}

	.submit-team-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
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

	.selected-teams {
		width: 100%;
		max-width: 20rem;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
	}

	.selected-teams h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
	}

	.selected-teams li {
		border-bottom: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		background-color: var(--form-background-color);
		color: var(--form-text-color);
    list-style-type: none;
	}

	.selected-teams li:last-child {
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

	:root {
		--form-background-color-light: #94a3b8;
		--form-background-color-dark: #1e293b;
		--form-text-color-light: #09090b;
		--form-text-color-dark: #f9f9f9;
	}
</style>
