<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedTeams } from '$lib/stores/store';
  import { teamDataStore, ensureTeamsLoaded } from '$lib/stores/teamData';
  import { theme } from '$lib/stores/theme';
  import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
  import { getCurrentYear } from '$lib/utils/getCurrentYear';
  import type { TeamSearchResult } from '$lib/stores/teamData'; // Add this import

  let searchQuery: string = '';
  let searchResults: string[] = []; // Keep as string[] for component compatibility
  let selectedWeek: number = 1;
  let selectedYear: number = new Date().getFullYear();
  let selectedTeamsArray = $selectedTeams;

  const minQueryLength: number = 2;

  // Cleanup tracking
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

    if (query.length >= minQueryLength) {
      try {
        await ensureTeamsLoaded();
        
        // Get the search result object and extract just the teams array
        const searchResult: TeamSearchResult = teamDataStore.searchTeams(query);
        searchResults = searchResult.teams; // Extract teams array
        
      } catch (error) {
        console.error('Search failed:', error);
        searchResults = [];
      }
    } else {
      searchResults = [];
    }
  }

  function selectTeam(event: Event, team: string) {
    event.preventDefault();

    selectedTeams.update((selectedTeams: string[]) => {
      if (selectedTeams.includes(team)) {
        return selectedTeams.filter((selectedTeam) => selectedTeam !== team);
      } else {
        return [...selectedTeams, team];
      }
    });

    // Force re-render
    searchResults = [...searchResults];
  }

  function handleInput() {
    debouncedSearch();
  }

  onMount(() => {
    // Subscribe to selectedTeams with cleanup tracking
    const teamsUnsub = selectedTeams.subscribe(value => {
      selectedTeamsArray = value;
    });
    
    unsubscribers.push(teamsUnsub);

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const weekParam = urlParams.get('week');
    const yearParam = urlParams.get('year');

    selectedWeek = weekParam ? parseInt(weekParam, 10) : getCurrentWeek();
    selectedYear = yearParam ? parseInt(yearParam, 10) : getCurrentYear();

    // Initial search
    searchTeams();
  });

  onDestroy(() => {
    // Clean up subscriptions
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
    
    // Clear timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  });

  // Optimized reactive statement - only updates when selectedTeams changes
  $: if (selectedTeamsArray !== $selectedTeams) {
    selectedTeamsArray = $selectedTeams;
  }
</script>

<section class="resubmit-wrapper" class:light={!$theme} class:dark={$theme}>
  <div class="container">
    <div class="resubmit-container">
      <label for="teamSearch">Search for a Different Team:</label>
      <input
        type="text"
        id="teamSearch"
        bind:value={searchQuery}
        placeholder="Enter team name (min 2 characters)"
        on:input={handleInput}
        autocomplete="off"
      />
    </div>

    <div class="resubmit-container">
      <label for="resubmit-week">Select Week:</label>
      <select id="resubmit-week" bind:value={selectedWeek}>
        {#each [...Array(14).keys()] as week}
          <option value={week + 1}>{week + 1}</option>
        {/each}
      </select>
    </div>

    <div class="resubmit-container">
      <label for="resubmit-year">Select Year:</label>
      <input
        type="number"
        id="resubmit-year"
        bind:value={selectedYear}
        min={1900}
        max={new Date().getFullYear()}
      />
    </div>

    <p id="search-query">
      You searched for:
      <span class="query-result">{searchQuery || 'Nothing yet'}</span>
    </p>

    <div class="search-results">
      {#if searchResults.length > 0}
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
      {:else if searchQuery.length > 0}
        <p class="search-hint">Type at least {minQueryLength} characters to search</p>
      {:else}
        <p class="search-prompt">Start typing to search teams...</p>
      {/if}
    </div>

    <a
      href={selectedTeamsArray.length > 0
        ? `/games?teams=${selectedTeamsArray.join(',')}&year=${selectedYear}&week=${selectedWeek}`
        : '#'}
      data-sveltekit-reload
      role="button"
    >
      <button 
        type="button" 
        class="resubmit-button" 
        disabled={selectedTeamsArray.length === 0}
      >
        Submit
      </button>
    </a>
  </div>
</section>

<style module>
  .light {
    --background-color: #f9f9f9;
    --text-color: #1a202c;
    --highlight-text-color: #18181b;
    --highlight-color: #b2e7cb;
  }

  .dark {
    --background-color: #1a202c;
    --text-color: #f9f9f9;
    --highlight-text-color: #f9f9f9;
    --highlight-color: #336699;
  }

  .resubmit-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0 1rem;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .container {
    margin-top: 2.5rem;
  }

  .resubmit-container {
    margin-bottom: 1.5rem;
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
    border: 1px solid #c3c8d0;
    border-radius: 0.25rem;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .search-results {
    min-height: 2rem;
    max-height: 8rem;
    width: 90%;
    padding: 0.5rem;
    border: 1px solid #c3c8d0;
    border-radius: 0.25rem;
    margin: 1rem 0;
    overflow-y: auto;
    background-color: var(--background-color);
  }

  .team-list-items {
    list-style-type: none;
    padding: 0.25rem 0.5rem 0.5rem 0.5rem;
  }

  .query-result {
    font-weight: bold;
  }

  .no-results,
  .search-hint,
  .search-prompt {
    font-size: 0.875rem;
    color: #666;
    text-align: center;
    padding: 0.5rem;
    font-style: italic;
  }

  #resubmit-week {
    border-radius: 0.25rem;
    padding: 3px;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  button {
    cursor: pointer;
    background: none;
    color: inherit;
    border: none;
    font: inherit;
    outline: inherit;
  }

  .resubmit-button {
    cursor: pointer;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0.25rem 0.675rem;
    background-color: var(--primary-color);
    color: #f9f9f9;
    margin-bottom: 3rem;
  }

  .resubmit-button:hover {
    opacity: 0.9;
  }

  .resubmit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  button.selected {
    background-color: var(--highlight-color);
  }

  /* Media query for mobile devices */
  @media screen and (max-width: 768px) {
    .resubmit-wrapper {
      background-color: transparent;
    }

    .team-list {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .search-results {
      margin-bottom: 1.25rem;
    }
  }
</style>