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

<div class="search-container">
  <div class="container">
    <label for="teamSearch">Search for a Team:</label>
    <input 
      type="text" 
      id="teamSearch" 
      bind:value={searchQuery} 
      placeholder="Enter team name" on:input={searchTeams} 
    />

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
  </div>
</div>

<style module>
  .search-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  label {
    padding: 2rem 0;
    font-weight: bold;
  }

  input[type='text'] {
    width: 100%;
    padding: 10px 0;
    padding-left: 10px;
    margin: 0.75rem 0;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .search-results {
    width: 100%;
    min-height: 130px;
    max-height: 130px;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    margin-top: 0.5rem;
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

  button.dark.selected {
    background-color: var(--highlight-color-dark);
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
