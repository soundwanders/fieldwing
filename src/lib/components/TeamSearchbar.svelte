<!-- TeamSearchbar.svelte -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedTeams, selectedWeek } from '$lib/stores/store';
  import { teamDataStore, ensureTeamsLoaded, isTeamDataLoaded } from '$lib/stores/teamData';
  import { theme } from '$lib/stores/theme';

  import type { TeamSearchResult } from '$lib/stores/teamData';
	
  let searchQuery: string = '';
  let searchResults: string[] = [];
  const minQueryLength: number = 3;

  // Subscription cleanup tracking
  let unsubscribers: (() => void)[] = [];
	let searchTimeout: number | null = null;

  // Debounced search function
  function debouncedSearch() {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(async () => {
      await searchTeams();
    }, 150); // 150ms debounce

		// In onDestroy, clear the timeout
		onDestroy(() => {
			// Clean up all subscriptions
			unsubscribers.forEach(unsub => unsub());
			unsubscribers = [];
			
			// Clear any pending timeouts
			if (searchTimeout) {
				clearTimeout(searchTimeout);
				searchTimeout = null;
			}
		});
  }

  async function searchTeams() {
    const query: string = searchQuery.toLowerCase().trim();

    // Clear results if query is too short
    if (query.length < minQueryLength) {
      searchResults = [];
      return;
    }

    try {
      // Ensure team data is loaded
      await ensureTeamsLoaded();
      
      // Get search result and extract teams array
      const searchResult: TeamSearchResult = teamDataStore.searchTeams(query);
      searchResults = searchResult.teams; // Extract the teams array
      
      // Force reactive update
      searchResults = searchResults;
    } catch (error) {
      console.error('Search failed:', error);
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
    searchResults = [...searchResults]; // Force reactivity
  }

  // Handle input with debouncing
  function handleInput() {
    debouncedSearch();
  }

  onMount(() => {
    // Subscribe to selectedWeek with cleanup tracking
    const weekUnsub = selectedWeek.subscribe(value => {
      // Handle week changes if needed
    });
    
    unsubscribers.push(weekUnsub);

    // Initial search setup
    searchTeams();
  });

  onDestroy(() => {
    // Clean up all subscriptions
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
    
    // Clear any pending timeouts
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  });
</script>

<div class="search-wrapper">
  <section class="searchbar-section">
    <article class="searchbar-flex-container">
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
          placeholder="Enter team name (min 3 characters)"
          on:input={handleInput}
          autocomplete="off"
        />
      </div>
    </article>

    <article class="searchbar-flex-container">
      <div class="label-wrapper week-label">
        <label for="week-selector">Week:</label>
      </div>
      <div class="select-wrapper">
        <select class="week-select" id="week-selector" bind:value={$selectedWeek}>
          {#each [...Array(14).keys()] as week}
            <option value={week + 1}>{week + 1}</option>
          {/each}
        </select>
      </div>
    </article>

    <article class="searchbar-flex-container">
      <div class="label-wrapper">
        <p id="search-query">
          You searched for:
          <span class="query-result">{searchQuery}</span>
        </p>
        {#if searchQuery.length > 0 && searchQuery.length < minQueryLength}
          <p class="search-hint">Type at least {minQueryLength} characters to search</p>
        {/if}
      </div>

      <div class="input-wrapper">
        <div class="search-results" class:light={!$theme} class:dark={$theme}>
          {#if !$isTeamDataLoaded}
            <p class="loading-message">Loading teams...</p>
          {:else if searchResults.length > 0}
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
                    type="button"
                  >
                    {team}
                  </button>
                </li>
              {/each}
            </ul>
          {:else if searchQuery.length >= minQueryLength}
            <p class="no-results">No teams found for "{searchQuery}"</p>
          {:else}
            <p class="search-prompt">Start typing to search teams...</p>
          {/if}
        </div>
      </div>
    </article>
  </section>
</div>

<style module>
  .light {
    --highlight-text-color: #18181b;
    --highlight-color: #b2e7cb;
  }

  .dark {
    --highlight-text-color: #f9f9f9;
    --highlight-color: #336699;
  }

  .search-wrapper,
  .searchbar-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
    width: 100vw;
  }

  .searchbar-flex-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    width: min-content;
  }

  .label-wrapper {
    width: 100%;
    height: fit-content;
    text-align: left;
    margin: 0 1.375rem;
  }

  .week-label {
    margin: 0 2rem;
  }

  .input-wrapper {
    height: fit-content;
    margin: 0 1.3rem;
  }

  .team-searchbar {
    flex-grow: 1;
    height: 2.5rem;
    width: 265px;
    padding: 0.3rem;
    margin: 0.75rem 0;
    box-sizing: border-box;
    border: 1px solid #c3c8d0;
    border-radius: 0.25rem;
    background-color: var(--form-sub-background-color);
    color: var(--form-text-color);
  }

  .select-wrapper {
    display: flex;
    height: fit-content;
    margin: 0 2rem;
    align-items: flex-start;
  }

  #week-selector {
    padding: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    color: inherit;
    box-sizing: content-box;
    margin: 0.75rem 0;
    margin-left: auto;
    background-color: var(--form-sub-background-color);
  }

  .search-results {
    flex-grow: 1;
    min-height: 4rem;
    max-height: 4rem;
    width: 370px;
    overflow-y: auto;
    padding: 0.3rem;
    margin: 0.75rem 0;
    border: 1px solid #c3c8d0;
    border-radius: 0.25rem;
    background-color: var(--form-sub-background-color);
    color: var(--form-text-color);
    box-sizing: border-box;
  }

  .team-list {
    font-size: 0.875rem;
    line-height: 1rem;
    margin: 0.5rem auto;
  }

  .team-list:first-child {
    margin: 0.2rem auto;
  }

  .team-list-items {
    list-style-type: none;
    padding: 0.175rem 0;
  }

  #search-query {
    padding: 0;
    margin: 0;
  }

  .query-result {
    font-weight: bold;
  }

  .search-hint,
  .loading-message,
  .no-results,
  .search-prompt {
    font-size: 0.75rem;
    color: #666;
    padding: 0.5rem;
    text-align: center;
    font-style: italic;
  }

  .loading-message {
    color: var(--primary-color, #424ae1);
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

  /* Media query for mobile devices */
  @media screen and (max-width: 768px) {
    .search-wrapper,
    .searchbar-section {
      flex-direction: column;
      height: 100%;
      width: 100%;
      padding: 0;
      margin: 0 auto;
    }

    .searchbar-flex-container,
    .select-wrapper,
    .input-wrapper {
      height: 100%;
      width: 100%;
      max-width: min-content;
      padding: 0;
    }

    .label-wrapper,
    .input-wrapper,
    .select-wrapper {
      margin: 0 1rem;
    }

    .select-wrapper {
      margin-bottom: 1.25rem;
    }

    .team-searchbar,
    .search-results {
      width: 66vw;
    }

    .team-list {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .search-results {
      margin-bottom: 1.25rem;
      padding: 0.3rem 0;
    }

    .label-wrapper {
      width: 100%;
      text-align: left;
    }

    .input-wrapper:last-child {
      margin-bottom: 1rem !important;
    }
  }
</style>