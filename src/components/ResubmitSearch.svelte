<!-- ResubmitSearch.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import fbsData from '../data/fbs.json';
  import fcsData from '../data/fcs.json';
  import { searchedTeams, selectedTeams } from '$lib/stores/store';
  import { theme } from '$lib/stores/theme';
  import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
  import { goto } from '$app/navigation';

  let searchQuery: string = '';
  let searchResults: string[] = [];
  const minQueryLength: number = 2;

  let selectedWeek: number = 1;

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

    // Toggle selected team in the searchedTeams store
    searchedTeams.update((searchedTeams: string[]) => {
      if (searchedTeams.includes(team)) {
        return searchedTeams.filter((searchedTeam) => searchedTeam !== team);
      } else {
        return [...searchedTeams, team];
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

    // Set selectedWeek based on the URL parameter or the current week
    selectedWeek = weekParam ? parseInt(weekParam, 10) : getCurrentWeek();
  });

  function handleResubmit() {
    // Use goto to navigate to the results page with the selected teams and week as query parameters
    const selectedTeamsForSubmit = [...$selectedTeams, ...$searchedTeams];
    goto(`/results?teams=${selectedTeamsForSubmit}&week=${selectedWeek}`);
  }
</script>

<div class="resubmit-container" class:light={!$theme} class:dark={$theme}>
  <div class="container">
    <div>
      <label for="teamSearch">Search for a Different Team:</label>
      <input 
        type="text" 
        id="teamSearch" 
        bind:value={searchQuery} 
        placeholder="Enter team name" on:input={searchTeams} 
      />
    </div>

    <div>
      <!-- Dropdown container for choosing which week to fetch -->
      <label for="resubmit-week">Select Week:</label>
      <select id="resubmit-week" bind:value={selectedWeek}>
        {#each [...Array(17).keys()] as week}
          <option value={week + 1}>{week + 1}</option>
        {/each}
      </select>
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
              class:light={!$theme} class:dark={$theme}
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

    <button on:click={handleResubmit} class="resubmit-button">
      Submit
    </button>
  </div>
</div>

<style module>
  .resubmit-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1.25rem;
    background-color: var(--background-color);
    color: var(--text-color);
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
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .search-results {
    width: 90%;
    min-height: 80px;
    max-height: 80px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #d1d5db;
    overflow-y: auto;
  }

  .team-list-items {
    list-style-type: none;
    padding: 0.4rem 0.5rem;
  }

  .query-result{
    font-weight: bold;
  }

  #resubmit-week {
    background-color: var(--background-color);
    color: var(--text-color);
    padding: 3px;
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
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    padding: 0.25rem 0.75rem;
    transition: background-color 0.2s ease-in-out;
  }

  .resubmit-button:hover {
    opacity: 0.9;
  }

  button.selected {
    background-color: var(--highlight-color);
  }

  button.dark.selected {
    background-color: var(--highlight-color-dark);
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
    .team-list {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    
    .search-results {
      margin-bottom: 1.25rem;
		}
	}
</style>
