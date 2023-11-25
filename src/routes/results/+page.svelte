<!-- +page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { theme } from '$lib/stores/theme';

  let teamNames = $page.data.teams.join(', ');
  console.log ('teamnames', teamNames);

  export let data: { gameResults?: any[] };
  const { gameResults } = data;

  console.log('gameResults CFBD API data', gameResults);
</script>

<section class="results-container">
  <main>
    <h1>This Week's Results for 
      <span class="team-names" class:light={!$theme} class:dark={$theme}>
        {teamNames}
      </span>
    </h1>

    {#if gameResults}
      {#each gameResults as gameResult (gameResult.id)}
        <div class="game-result">
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
    {/if}
  </main>
</section>

<style>
  main {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .results-container {
    max-width: 800px;
  }
  
  .team-names {
    color: var(--teams-color);
  }

  .team-names.dark {
    color: var(--teams-color-dark);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    text-align: center;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .game-result {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .game-info {
    margin-bottom: 5px;
  }

  :root {
		--teams-color: #bb0000;
    --teams-color-dark: #ff7377;
  }
</style>
