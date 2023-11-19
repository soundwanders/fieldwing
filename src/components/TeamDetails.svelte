<!-- TeamDetails.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { selectedTeams } from '$lib/stores/store';

  let team: string | undefined;
  let games: any[] | undefined;

  onMount(() => {
    // Fetch data for selected teams
    selectedTeams.subscribe(($selectedTeams) => {
      const teamsToFetch = $selectedTeams.join(',');
      fetch(`/teams/${teamsToFetch}`).then(async (response) => {
        const data = await response.json();
        team = data.team;
        games = data.games;
      });
    });
  });
</script>


<section class="team-details">
  <h1>{team}</h1>
  {#if games && games.length > 0}
    <ul class="games-list">
      {#each games as game}
        <li class="game-item">
          <p class="game-detail">Date: {game.date}</p>
          <p class="game-detail">Result: {game.result}</p>
          <!-- Add other game details here as needed -->
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-games">No games found for {team}.</p>
  {/if}
</section>

<style>
  .team-details {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .games-list {
    list-style: none;
    padding: 0;
  }

  .game-item {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .game-detail {
    margin: 0;
  }

  .no-games {
    font-style: italic;
  }

  /* Media query for smaller screens */
  @media screen and (max-width: 600px) {
    .team-details {
      padding: 10px;
    }
  }
</style>