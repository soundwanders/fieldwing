<!-- +page.svelte -->
<script lang="ts">
  import { selectedTeams } from '$lib/stores/store';
  import { theme } from '$lib/stores/theme';
	import ResubmitSearch from '../../components/ResubmitSearch.svelte';
	import '../../styles/main.css';

  export let data: { gameResults?: any[] };

  let teamNames: string;
  $: teamNames = $selectedTeams.join(', ');

  const { gameResults } = data;

  console.log('gameResults', gameResults);
</script>

<section class="wrapper">
  <section class="results-section">
    <div class="results-container">
      <h1>This Week's Results for 
        <span class="team-names" class:light={!$theme} class:dark={$theme}>
          {teamNames}
        </span>
      </h1>

      {#if gameResults}
        <div class="game-results-container">
          {#each gameResults as { team, data } (team)}
            {#each data as gameResult (gameResult.id)}
            <div class="game-results" class:light={!$theme} class:dark={$theme}>
              <h2>Week {gameResult.week} - {gameResult.season_type}</h2>
              <p class="game-info">Start Date: {gameResult.start_date}</p>
              <p class="game-info">Venue: {gameResult.venue}</p>
              <p class="game-info">Home Team: {gameResult.home_team}</p>
              <p class="game-info">Away Team: {gameResult.away_team}</p>
              <p class="game-info">Conference Game: {gameResult.conference_game ? 'Yes' : 'No'}</p>
              <p class="game-info">Completed: {gameResult.completed ? 'Yes' : 'No'}</p>
              <p class="game-info">Home Points: {gameResult.home_points}</p>
              <p class="game-info">Away Points: {gameResult.away_points}</p>
              <!-- Add more fields as needed -->
            </div>
            {/each}
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <section class="search-section">
    <ResubmitSearch />
  </section>
</section>

<style>
  :root {
		--teams-color: #bb0000;
    --teams-color-dark: #ff9195;
  }

  h1 {
    font-size: 2.25rem;
    line-height: 2.5rem;
    margin-bottom: 2rem;
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
    width: 100vw;
    height: 100vh;
  }

  .results-section {
    display: flex;
    justify-content: center;
    width: 100vw;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .results-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100%;
  }

  .game-results-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .game-results {
    width: 42%;
    text-align: center;
		max-width: 20rem;
    padding: 1rem;
    margin: 2rem 3rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
    margin-bottom: 1.25rem;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .team-names {
    color: var(--teams-color);
  }

  .team-names.dark {
    color: var(--teams-color-dark);
  }

  .game-info {
    margin-bottom: 5px;
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
	@media (max-width: 768px) {
    .wrapper {
      width: 100%;
      height: 100%;
    }

    .results-section {
			width: 100%;
			margin: 0 auto;
    }

		.results-container {
			width: 100%;
		}

    .game-results {
      width: 100%;
      margin: 1.5rem;
    }

    h1 {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    h2 {
      font-size: 1.125rem;
      line-height: 1.5rem;
    }
    .game-info {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
</style>
