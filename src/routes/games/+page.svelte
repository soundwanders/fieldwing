<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { formatStartDate } from '$lib/utils/formatStartDate';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  import ResubmitTeams from '$lib/components/ResubmitTeams.svelte';
  import '../../styles/main.css';

  export let data: { gameResults?: any[]; teams?: string[]; error?: string };

  let isLoading = true;
  let pageError = null;

  const { gameResults } = data;

  $: formattedTeams = Array.isArray(data.teams) ? data.teams.join(', ') : data.teams;
  $: teamTitleList = `${formattedTeams || 'No Teams Selected'}`;

  function capitalizeFirstChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function handleRetry() {
    pageError = null;
    window.location.reload();
  }

  onMount(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      isLoading = false;
    }, 300);

    // Check for data errors
    if (data?.error) {
      pageError = new Error(data.error);
      isLoading = false;
    }

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>Game Results - Fieldwing</title>
</svelte:head>

<ErrorBoundary bind:error={pageError} on:retry={handleRetry}>
  <div class="wrapper">
    {#if isLoading}
      <LoadingSpinner 
        size="large" 
        text="Loading game results..." 
        fullScreen={true}
      />
    {:else}
      <div class="results-container" class:light={!$theme} class:dark={$theme}>
        <section class="results-section">
          <div class="header-image-container">
            {#if gameResults && gameResults[0]?.data[0]}
              <img class="games-image" src="/gameresults.png" alt="Game Results" aria-hidden="true" />
              <h1>
                Week {gameResults[0].data[0].week}, {gameResults[0].data[0].season} Results for
                <span class="header-teams" class:light={!$theme} class:dark={$theme}>
                  {teamTitleList}
                </span>
              </h1>
            {:else}
              <h1>Game Results</h1>
              <p class="no-results">No game results found for the selected criteria.</p>
            {/if}
          </div>

          {#if gameResults && gameResults.length > 0}
            {#each gameResults as { team, data, error } (team)}
              {#if error}
                <div class="error-card">
                  <h3>Error loading {team}</h3>
                  <p>{error}</p>
                </div>
              {:else if data && data.length > 0}
                {#each data as gameResult (gameResult.id)}
                  <div class="game-results-container">
                    <section class="game-results" class:light={!$theme} class:dark={$theme}>
                      <h2 class="team-names" class:light={!$theme} class:dark={$theme}>
                        {gameResult.home_team} vs {gameResult.away_team}
                      </h2>

                      <p id="week-subtitle">
                        Week {gameResult.week} - {capitalizeFirstChar(gameResult.season_type)} Season
                      </p>

                      <article class="scoreboard">
                        <div class="team-score">
                          <p class="team-name">{gameResult.home_team}</p>
                          <p class="points">{gameResult.home_points || 0}</p>
                        </div>
                        <div class="team-score">
                          <p class="team-name">{gameResult.away_team}</p>
                          <p class="points">{gameResult.away_points || 0}</p>
                        </div>
                      </article>

                      <p class="game-info">
                        Date: {formatStartDate(gameResult.start_date)}
                      </p>
                      <p class="game-info">
                        Venue: {gameResult.venue || 'TBD'}
                      </p>
                      <p class="game-info">
                        Conference Game: {gameResult.conference_game ? 'Yes' : 'No'}
                      </p>
                      <p class="game-info">
                        Completed: {gameResult.completed ? 'Yes' : 'No'}
                      </p>
                    </section>
                  </div>
                {/each}
              {:else}
                <div class="no-games-card">
                  <h3>{team}</h3>
                  <p>No games found for this team in the selected week.</p>
                </div>
              {/if}
            {/each}
          {/if}
        </section>
      </div>

      <section class="search-section">
        <ResubmitTeams />
      </section>
    {/if}
  </div>
</ErrorBoundary>

<style module>
  .light {
    --background-color: #f9f9f9;
    --text-color: #1a202c;
    --teams-color: #bb0000;
  }

  .dark {
    --background-color: #1a202c;
    --text-color: #f9f9f9;
    --teams-color: #ff9195;
  }

  h1 {
    max-inline-size: 50ch;
    text-wrap: balance;
    font-size: 2.25rem;
    line-height: 2.5rem;
    text-align: center;
  }

  h2 {
    font-size: 1.5rem;
    line-height: 2rem;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-thickness: 1px;
  }

  .wrapper {
    height: 100vh;
    width: 100vw;
    background-color: var(--background-color);
    background-image: var(--background-image);
  }

  .results-container {
    display: flex;
    justify-content: center;
    width: 100vw;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .header-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .games-image {
    height: auto;
    width: 3.5%;
    margin-right: 0.75rem;
  }

  .results-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .game-results-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 2rem;
  }

  .game-results-container:nth-child(2) {
    margin-top: 0;
  }

  .game-results {
    width: max-content;
    text-align: center;
    padding: 0.5rem 2rem 1.5rem 2rem;
    margin: 1.5rem 3rem;
    margin-bottom: 1.25rem;
    border: 1px solid #c3c8d0;
    border-radius: 5px;
    box-sizing: border-box;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: var(--background-color);
    color: var(--text-color);
    transition: transform 0.2s ease;
  }

  .team-names {
    font-size: 1.75rem;
    font-weight: bold;
    text-decoration: none;
    margin-top: -1.5rem;
    margin-bottom: 0.5rem;
    background-color: var(--background-color);
    color: var(--teams-color);
    z-index: 10;
  }

  .game-info {
    margin-bottom: 0.25rem;
  }

  .game-info:first-of-type {
    margin-top: -0.125rem;
  }

  .scoreboard {
    display: flex;
    justify-content: space-evenly;
    align-content: end;
    margin: 0.5rem auto;
  }

  .team-score {
    text-align: center;
  }

  .team-name {
    font-weight: bold;
  }

  #week-subtitle {
    margin-top: 1.75rem;
    font-size: 1rem;
    line-height: 1.25rem;
  }

  .points {
    font-size: 2rem;
    line-height: 2.25rem;
    margin-top: 0.25rem;
  }

  .error-card,
  .no-games-card {
    background-color: var(--background-color);
    border: 1px solid #ef4444;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1rem;
    text-align: center;
  }

  .no-games-card {
    border-color: #f59e0b;
  }

  .no-results {
    color: var(--text-color);
    font-size: 1.125rem;
    margin-top: 1rem;
  }

  /* Media query for mobile devices */
  @media (max-width: 768px) {
    .wrapper {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .results-container {
      width: 100%;
      margin: 0 auto;
    }

    .results-section {
      width: 100%;
    }

    .header-image-container {
      width: 90%;
      margin-bottom: 0.5rem;
    }

    .games-image {
      display: none;
    }

    .game-results {
      width: 100%;
      margin: 1.5rem;
    }

    .game-results:first-of-type {
      margin-top: 0;
      margin-bottom: 2.5rem;
    }

    h1 {
      margin-bottom: 2.5rem;
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    h2 {
      font-size: 1.125rem;
      line-height: 1.5rem;
    }

    #week-subtitle {
      font-size: 0.875rem;
      line-height: 1rem;
    }

    .team-names {
      font-size: 1.25rem;
      line-height: 1.5rem;
    }

    .game-info {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
</style>