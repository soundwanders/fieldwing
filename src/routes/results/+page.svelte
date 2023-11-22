<!-- +page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  export let data: { gameResults?: any[] };
  const { gameResults } = data;

  console.log('+page gameResults const', gameResults);
</script>

<main>
  <h1>Your Favorite Team Data</h1>

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

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    text-align: center;
  }

  .game-result {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .game-info {
    margin-bottom: 5px;
  }
</style>
