<!-- src/lib/components/TeamSearchbar.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedTeams, selectedWeek } from '$lib/stores/store';
  import { teamDataStore, ensureTeamsLoaded, isTeamDataLoaded } from '$lib/stores/teamData';
  import { theme } from '$lib/stores/theme';
  import type { TeamSearchResult } from '$lib/stores/teamData';
	
  // Component state
  let searchQuery: string = '';
  let searchResults: string[] = [];
  let selectedTeamsArray: string[] = [];
  let isSearching: boolean = false;
  let searchError: string | null = null;
  
  const minQueryLength: number = 3;

  // Cleanup tracking - DECLARED AT TOP LEVEL
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let unsubscribers: (() => void)[] = [];

  // Search function without reactive statements
  async function searchTeams(): Promise<void> {
    const query = searchQuery.toLowerCase().trim();

    // Clear results if query is too short
    if (query.length < minQueryLength) {
      searchResults = [];
      searchError = null;
      return;
    }

    try {
      isSearching = true;
      searchError = null;
      
      // Ensure team data is loaded
      await ensureTeamsLoaded();
      
      // Get search result and extract teams array
      const searchResult: TeamSearchResult = teamDataStore.searchTeams(query);
      searchResults = searchResult.teams;
      
      console.log(`🔍 TeamSearchbar: Found ${searchResults.length} teams for "${query}"`);
      
    } catch (error) {
      console.error('TeamSearchbar search failed:', error);
      searchResults = [];
      searchError = 'Search failed. Please try again.';
    } finally {
      isSearching = false;
    }
  }

  // Debounced search function - NO onDestroy calls inside!
  function debouncedSearch(): void {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
    
    // Set new timeout
    searchTimeout = setTimeout(async () => {
      await searchTeams();
    }, 150);
  }

  // Team selection handler
  function selectTeam(event: Event, team: string): void {
    event.preventDefault();

    // Toggle selected team in the selectedTeams store
    selectedTeams.update((currentTeams: string[]) => {
      if (currentTeams.includes(team)) {
        return currentTeams.filter((selectedTeam) => selectedTeam !== team);
      } else {
        return [...currentTeams, team];
      }
    });

    // Force reactivity update
    searchResults = [...searchResults];
  }

  // Handle input with debouncing
  function handleInput(): void {
    debouncedSearch();
  }

  // Component initialization - ALL LIFECYCLE HOOKS HERE
  onMount(() => {
    console.log('🎯 TeamSearchbar mounted');
    
    // Subscribe to selectedTeams store
    const teamsUnsub = selectedTeams.subscribe(value => {
      selectedTeamsArray = value;
    });
    unsubscribers.push(teamsUnsub);

    // Subscribe to selectedWeek if needed
    const weekUnsub = selectedWeek.subscribe(value => {
      // Handle week changes if needed
    });
    unsubscribers.push(weekUnsub);

    // Initial search setup
    searchTeams();
  });

  // Cleanup - ONLY CALLED AT TOP LEVEL DURING INITIALIZATION
  onDestroy(() => {
    console.log('🧹 TeamSearchbar cleanup');
    
    // Clean up all subscriptions
    unsubscribers.forEach(unsub => {
      try {
        unsub();
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
    });
    unsubscribers = [];
    
    // Clear any pending timeouts
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  });

  // Simple reactive statement for selectedTeams (safe because it's read-only)
  $: selectedTeamsArray = $selectedTeams;
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
          <span class="query-result">{searchQuery || 'Nothing yet'}</span>
        </p>
        {#if searchQuery.length > 0 && searchQuery.length < minQueryLength}
          <p class="search-hint">Type at least {minQueryLength} characters to search</p>
        {/if}
      </div>

      <div class="input-wrapper">
        <div class="search-results" class:light={!$theme} class:dark={$theme}>
          {#if !$isTeamDataLoaded}
            <p class="loading-message">Loading teams...</p>
          {:else if isSearching}
            <p class="loading-message">Searching...</p>
          {:else if searchError}
            <p class="error-message">{searchError}</p>
          {:else if searchResults.length > 0}
            <ul class="team-list">
              {#each searchResults as team (team)}
                <li class="team-list-items">
                  <button
                    class="teams-button"
                    on:mousedown={(event) => selectTeam(event, team)}
                    class:selected={selectedTeamsArray.includes(team)}
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

<style>
  .light {
    --highlight-text-color: #18181b;
    --highlight-color: #b2e7cb;
    --form-sub-background-color: #f4f4f5;
    --form-text-color: #1a202c;
  }

  .dark {
    --highlight-text-color: #f9f9f9;
    --highlight-color: #336699;
    --form-sub-background-color: #374151;
    --form-text-color: #f9f9f9;
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
    list-style: none;
    padding: 0;
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
  .error-message,
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

  .error-message {
    color: #ef4444;
  }

  .teams-button {
    cursor: pointer;
    background: none;
    color: inherit;
    border: none;
    font: inherit;
    outline: inherit;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .teams-button:hover {
    background-color: var(--highlight-color);
  }

  .teams-button.selected {
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