<!-- MatchupSelection.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { selectedTeams } from '$lib/stores/store';
  import { theme } from '$lib/stores/theme';
  import fbsData from '../data/fbs.json';
  import fcsData from '../data/fcs.json';

  let team1: string = '';
  let team2: string = '';

  let minYear = '';
  let maxYear = '';

  let selectedConference: string = '';
  let selectedFbsTeam: string = '';
  let selectedFcsTeam: string = '';

  let selectedTeamsArray = $selectedTeams;

  const fbsTeams: string[] = fbsData;
  const fcsTeams: string[] = fcsData;

  // Filtered teams based on the selected conference
  let filteredTeams: string[] = [];

  function toggleSelection(team: string, teamType: string) {
    if (selectedTeamsArray.includes(team)) {
      selectedTeams.update((teams) => teams.filter((t) => t !== team));
      selectedTeamsArray = $selectedTeams;
    } else {
      selectedTeams.update((teams) => [...teams, team]);
      selectedTeamsArray = $selectedTeams;
      if (teamType === 'FBS') {
        team1 = team;
      } else if (teamType === 'FCS') {
        team2 = team;
      }
    }
  }

  function updateFilteredTeams() {
    if (selectedConference === 'FBS') {
      filteredTeams = fbsTeams;
    } else if (selectedConference === 'FCS') {
      filteredTeams = fcsTeams;
    } else if (selectedConference === 'all') {
      filteredTeams = [...fbsTeams, ...fcsTeams];
    } else {
      filteredTeams = []; 
    }
  }

  function handleSubmit() {
    // Navigate to the matchup route
    // construct url with selected teams, conference, and optional min/max years as query parameters
    goto(
      `/matchup?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}&conference=${encodeURIComponent(selectedConference)}${
        minYear ? `&minYear=${minYear}` : ''
      }${maxYear ? `&maxYear=${maxYear}` : ''}`
    );
  }

  onMount(() => {
    selectedTeamsArray = $selectedTeams;
  });

  $: {
    selectedTeamsArray = $selectedTeams;
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
          <select id="conference-select" bind:value={selectedConference} class:light={!$theme} class:dark={$theme}>
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
          <input type="text" id="minYear" bind:value={minYear} class:light={!$theme} class:dark={$theme} />
        </div>

        <div class="team-selector-wrapper">
          <label for="maxYear">Max Year:</label>
          <input type="text" id="maxYear" bind:value={maxYear} class:light={!$theme} class:dark={$theme} />
        </div>
      </div>

			<div class="button-container">
				<a href={team1 && team2 ? `/matchup?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}&conference=${encodeURIComponent(selectedConference)}${minYear ? `&minYear=${minYear}` : ''}${maxYear ? `&maxYear=${maxYear}` : ''}` : '#'}>
					<button type="button" class="submit-button" disabled={!team1 || !team2}>
						Submit
					</button>
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

  input, select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: var(--input-background-color);
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
    background-color: var(--primary-hover-color);
  }

	.submit-button:disabled {
		background-color: #525252;
		cursor: not-allowed;
	}

	.submit-button:hover:disabled {
		background-color: #404040;
	}

  /* Light Theme */
  .light {
    --background-color: #f0f0f0;
    --text-color: #333;
    --label-color: #555;
    --input-background-color: #f9f9f9;
    --input-text-color: #333;
    --button-background-color: #f5f5f5;
    --button-hover-color: #e0e0e0;
    --placeholder-color: #888;
  }

  /* Dark Theme */
  .dark {
    --background-color: #1a202c;
    --text-color: #f9f9f9;
    --label-color: #b0b0b0;
    --input-background-color: #2b2b2b;
    --input-text-color: #f9f9f9;
    --button-background-color: #333;
    --button-hover-color: #444;
    --placeholder-color: #666;
  }
</style>

