<!-- Selector.svelte -->

<script lang="ts">
  import { selectedTeams } from '$lib/stores/store';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';

  export let leagues: string[];
  export let selectedLeague: string;

  let selectedTeamsArray = $selectedTeams;
	let teams: string[] = [];

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

  const toggleSelection = (team: string) => {
    if (selectedTeamsArray.includes(team)) {
      selectedTeams.update((teams) => teams.filter((t) => t !== team));
    } else {
      selectedTeams.update((teams) => [...teams, team]);
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
      <h2>Select Your Teams</h2>

      <div class="select-container">
				<select 
					id="league-select" 
					bind:value={selectedLeague} 
					on:change={loadTeams}
				>
					<option value="" disabled>Select a Conference</option>
					{#each leagues as league}
						<option value={league}>{league}</option>
					{/each}
				</select>
				

				<div class="teams-container" class:light={!$theme} class:dark={$theme}>
					<ul>
						{#if teams.length > 0}
							{#each teams as team}
								<li>
									<button
										on:mousedown={() => toggleSelection(team)}
                    class="teams-button"
										class:selected={$selectedTeams.includes(team)}
										tabindex="0"
									>
										{team}
									</button>
								</li>
							{/each}
						{:else}
							<p id="select-conference">
								🏈 Select a conference to view teams
							</p>
						{/if}
					</ul>
				</div>
				
      </div>
    </form>

    <div class="selected-teams" class:light={!$theme} class:dark={$theme}>
      <h2>Selected Teams</h2>
      <ul>
        {#each selectedTeamsArray as selectedTeam}
          <li class="selected-teams-list-items">
            <button on:click={() => toggleSelection(selectedTeam)}>
              {selectedTeam}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style>
  /* Root Color Variables */
  :root {
    --primary-color: #4299e1;
		--highlight-color: #80ffc0;
    --highlight-color-dark: #008241;
  }

  .select-section {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    width: 100%;
    min-height: 70vh;
    padding: 0.5rem 2.5rem;
  }

  /* Form Styles */
  .selector-form {
    width: 100%;
    max-width: 20rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 1.5rem;
    background-color: var(--form-background-color);
    color: var(--form-text-color);
    border: 1px solid #d1d5db;
  }

  .selector-form h2 {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-color);
  }

  /* Select Container Styles */
  .select-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  /* Select Element Styles */
  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    background-color: var(--form-background-color);
    color: var(--form-text-color);
  }

  /* Teams Container Styles */
  .teams-container {
		min-height: 200px;
    max-height: 200px;
    width: 100%;
    padding: 0.3rem;
    border-radius: 0.25rem;
    overflow-y: auto;
  }

  .teams-container ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .teams-container li {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #d1d5db;
    font-weight: bold;
  }

  .teams-container button {
    cursor: pointer;
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    background-color: inherit;
    border: none;
    color: inherit;
    transition: background-color 0.2s ease-in-out;
  }

  .teams-container button.selected {
    background-color: var(--highlight-color);
  }

  .teams-container.dark button.selected {
    background-color: var(--highlight-color-dark);
  }

  .teams-container.dark button:hover {
    background-color: var(--highlight-color-dark);
  }

	/* Selected Teams Styles */
	.selected-teams {
		width: 100%;
		max-width: 20rem;
		min-height: 200px;
    max-height: 200px;
    background-color: var(--form-background-color);
    color: var(--form-text-color);
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		margin: 2rem 0 4rem 0;
    overflow-y: auto;
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

	.selected-teams li {
		padding: 0.2rem 0.5rem;
		border-bottom: 1px solid #d1d5db;
	}
	
  .selected-teams li:last-child {
    border-bottom: none;
  }

	.selected-teams button {
		cursor: pointer;
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		background-color: inherit;
		border: none;
		color: inherit;
		transition: background-color 0.2s ease-in-out;
	}

	.selected-teams li:hover {
		background-color: var(--highlight-color);
  }

	.selected-teams.dark li:hover {
    background-color: var(--highlight-color-dark);
  }

  .teams-button {
    padding: 0 2px;
  }

	#select-conference {
		padding: 0 0.25rem;
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
		.select-section {
			width: 100%;
			margin: 0 auto;
		}
	}
</style>
