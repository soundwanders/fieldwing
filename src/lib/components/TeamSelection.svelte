<!-- TeamSelection.svelte -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { selectedTeams, selectedWeek } from '$lib/stores/store';
  import { teamDataStore, ensureTeamsLoaded, isTeamDataLoaded, isTeamDataLoading } from '$lib/stores/teamData';
  import { theme } from '$lib/stores/theme';
  import { getCurrentYear } from '$lib/utils/getCurrentYear';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

  export let divisions: string[];
  export let selectedDivision: string;

  let selectedTeamsArray = $selectedTeams;
  let teams: string[] = [];
  let selectedYear: number = new Date().getFullYear();
  let componentError: Error | null = null;

  // Current year placeholder for select-year input element
  const currentYear = getCurrentYear();
  const yearString = getCurrentYear().toString();

  // Store unsubscribers for cleanup
  let unsubscribers: (() => void)[] = [];

  async function loadTeams() {
    try {
      // Ensure team data is loaded
      await ensureTeamsLoaded();
      
      // Get teams for selected division
      teams = teamDataStore.getTeamsByDivision(selectedDivision);
      $selectedWeek = 1;
      
      console.log(`📋 Loaded ${teams.length} teams for division: ${selectedDivision}`);
    } catch (err) {
      console.error('Failed to load teams:', err);
      componentError = err instanceof Error ? err : new Error('Failed to load teams');
    }
  }

  // Toggle selection / deselection of teams
  const toggleSelection = (event: Event, team: string) => {
    event.preventDefault();

    if (selectedTeamsArray.includes(team)) {
      selectedTeams.update((teams) => teams.filter((t) => t !== team));
    } else {
      selectedTeams.update((teams) => [...teams, team]);
    }
  };

  function handleRetry() {
    componentError = null;
    teamDataStore.reset();
    loadTeams();
  }

  onMount(() => {
    // Subscribe to stores with cleanup tracking
    const selectedTeamsUnsub = selectedTeams.subscribe(value => {
      selectedTeamsArray = value;
    });
    
    unsubscribers.push(selectedTeamsUnsub);
    
    // Load teams on mount
    loadTeams();
  });

  onDestroy(() => {
    // Clean up all subscriptions
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
  });

  // Reactive statement optimization - only update when selectedTeams changes
  $: selectedTeamsArray = $selectedTeams;
</script>

<ErrorBoundary bind:error={componentError} on:retry={handleRetry}>
  <div class="team-select-wrapper" class:light={!$theme} class:dark={$theme}>
    <section class="selection-section">
      <article class="team-selection-form">
        <form class="selector-form" class:light={!$theme} class:dark={$theme}>
          <h2>Select Your Teams</h2>

          <div class="selector-container">
            <div class="team-selector-wrapper">
              <label for="division-select">Select a Division:</label>
              <select
                class="divisions-dropdown"
                id="division-select"
                class:light={!$theme}
                class:dark={$theme}
                bind:value={selectedDivision}
                on:change={loadTeams}
                disabled={$isTeamDataLoading}
              >
                <option value="" disabled>...</option>
                {#each divisions as division}
                  <option value={division}>{division}</option>
                {/each}
              </select>
            </div>

            <div class="team-selector-wrapper">
              <label for="select-week">Select Week:</label>
              <select
                class="weeks-dropdown"
                id="select-week"
                class:light={!$theme}
                class:dark={$theme}
                bind:value={$selectedWeek}
              >
                {#each [...Array(14).keys()] as week}
                  <option value={week + 1}>{week + 1}</option>
                {/each}
              </select>
            </div>

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
              {#if $isTeamDataLoading}
                <div class="loading-teams">
                  <LoadingSpinner size="small" text="Loading teams..." />
                </div>
              {:else if teams.length > 0}
                <ul>
                  {#each teams as team (team)}
                    <li class="teams-container-list-item">
                      <button
                        on:mousedown={(event) => {
                          event.preventDefault();
                          toggleSelection(event, team);
                        }}
                        class="teams-button"
                        class:light={!$theme}
                        class:dark={$theme}
                        class:selected={selectedTeamsArray.includes(team)}
                        tabindex="0"
                        type="button"
                      >
                        {team}
                      </button>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="select-division-placeholder">🏈 Select a division to view teams</p>
              {/if}
            </div>
          </div>
        </form>
      </article>

      <article class="selected-teams" class:light={!$theme} class:dark={$theme}>
        <h2>Selected Teams</h2>
        <ul>
          {#each selectedTeamsArray.filter(Boolean) as selectedTeam (selectedTeam)}
            <li class="selected-teams-list-items">
              <button
                on:mousedown={(event) => {
                  event.preventDefault();
                  toggleSelection(event, selectedTeam);
                }}
                type="button"
              >
                {selectedTeam}
              </button>
            </li>
          {/each}
        </ul>
      </article>
    </section>
  </div>

  <section class="submit-section" class:light={!$theme} class:dark={$theme}>
    <div class="button-container">
      <a
        href={selectedTeamsArray.length > 0
          ? `/games?teams=${selectedTeamsArray.join(',')}&year=${selectedYear}&week=${$selectedWeek}`
          : '#'}
        data-sveltekit-prefetch
      >
        <button 
          type="button" 
          class="submit-button" 
          disabled={selectedTeamsArray.length === 0 || $isTeamDataLoading}
        >
          {#if $isTeamDataLoading}
            Loading...
          {:else}
            Submit
          {/if}
        </button>
      </a>
    </div>
  </section>
</ErrorBoundary>

<style module>
	.light {
		--text-color: #1a202c;
		--highlight-text-color: #18181b;
		--highlight-color: #b2e7cb;
		--button-disabled-background-color: #7c7c7c;
		--button-disabled-hover-color: #5f5f5f;
	}

	.dark {
		--text-color: #f9f9f9;
		--highlight-text-color: #f9f9f9;
		--highlight-color: #336699;
		--button-disabled-background-color: #707070;
		--button-disabled-hover-color: #5c5c5c;
	}

	.team-select-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		width: 100vw;
		height: 100%;
		color: var(--text-color);
		transition: background-color 0.2s ease;
	}

	.selection-section {
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

	.divisions-dropdown,
	.weeks-dropdown,
	.year-input {
		background-color: var(--form-sub-background-color);
	}

	/* Teams Container Select Elements */
	#division-select,
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

	.select-division-placeholder {
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
		padding-bottom: 5rem;
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

  .teams-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button:disabled {
    background-color: var(--button-disabled-background-color);
    cursor: not-allowed;
  }

	.loading-teams {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
  }
	
  .light {
    --text-color: #1a202c;
    --highlight-text-color: #18181b;
    --highlight-color: #b2e7cb;
    --button-disabled-background-color: #7c7c7c;
    --button-disabled-hover-color: #5f5f5f;
  }

  .dark {
    --text-color: #f9f9f9;
    --highlight-text-color: #f9f9f9;
    --highlight-color: #336699;
    --button-disabled-background-color: #707070;
    --button-disabled-hover-color: #5c5c5c;
  }

	/* Media query for mobile devices */
	@media screen and (max-width: 768px) {
		.selection-section {
			flex-direction: column;
			align-items: center;
			gap: 2.5rem;
			width: 90%;
			min-height: 100%;
			margin-top: 0.25rem;
		}

		.team-select-wrapper {
			width: 100%;
			margin: 0 auto;
		}

		h2 {
			margin-top: 0;
		}

		/* Team Selection Form */
		.selector-form {
			width: fit-content;
			max-width: 90%;
			border: 1px solid #c3c8d0;
			border-radius: 0.375rem;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
			padding: 1.5rem;
			background-color: var(--form-background-color);
			color: var(--form-text-color);
			transition: background-color 0.2s ease;
		}

		.team-selector-wrapper {
			align-self: end;
		}

		#select-year {
			max-width: 4rem;
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
