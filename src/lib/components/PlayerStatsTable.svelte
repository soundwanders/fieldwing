<!-- src/lib/components/PlayerStatsTable.svelte -->
<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import type { PlayerStat } from '$lib/types/api';

  export let stats: PlayerStat[];
  export let sortable: boolean = true;

  let sortBy: keyof PlayerStat = 'player';
  let sortOrder: 'asc' | 'desc' = 'asc';

  function handleSort(column: keyof PlayerStat) {
    if (!sortable) return;
    
    if (sortBy === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortOrder = 'asc';
    }
  }

  $: sortedStats = (() => {
    if (!sortable) return stats;
    
    return [...stats].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle numeric sorting for stat values
      if (sortBy === 'stat' && !isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  function formatStatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  }
</script>

<div class="table-wrapper" class:light={!$theme} class:dark={$theme}>
  <div class="table-container">
    <table class="stats-table">
      <thead>
        <tr>
          <th>
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('player')}
                class:active={sortBy === 'player'}
              >
                Player {sortBy === 'player' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Player
            {/if}
          </th>
          <th>
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('team')}
                class:active={sortBy === 'team'}
              >
                Team {sortBy === 'team' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Team
            {/if}
          </th>
          <th>
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('conference')}
                class:active={sortBy === 'conference'}
              >
                Conference {sortBy === 'conference' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Conference
            {/if}
          </th>
          <th>
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('category')}
                class:active={sortBy === 'category'}
              >
                Category {sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Category
            {/if}
          </th>
          <th>
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('statType')}
                class:active={sortBy === 'statType'}
              >
                Stat Type {sortBy === 'statType' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Stat Type
            {/if}
          </th>
          <th class="text-right">
            {#if sortable}
              <button 
                class="sort-button" 
                on:click={() => handleSort('stat')}
                class:active={sortBy === 'stat'}
              >
                Value {sortBy === 'stat' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            {:else}
              Value
            {/if}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortedStats as stat (stat.playerId + stat.statType)}
          <tr class="stat-row">
            <td class="player-name">{stat.player}</td>
            <td>{stat.team}</td>
            <td>{stat.conference}</td>
            <td class="capitalize">{stat.category}</td>
            <td>{stat.statType}</td>
            <td class="stat-value text-right">{formatStatValue(stat.stat)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .light {
    --table-bg: #ffffff;
    --table-border: #e5e7eb;
    --header-bg: #f9fafb;
    --header-text: #374151;
    --row-hover: #f9fafb;
    --text-color: #111827;
    --primary-color: #3b82f6;
  }

  .dark {
    --table-bg: #1f2937;
    --table-border: #374151;
    --header-bg: #111827;
    --header-text: #d1d5db;
    --row-hover: #374151;
    --text-color: #f9fafb;
    --primary-color: #60a5fa;
  }

  .table-wrapper {
    background: var(--table-bg);
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .table-container {
    overflow-x: auto;
  }

  .stats-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--table-bg);
  }

  .stats-table th {
    background: var(--header-bg);
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--header-text);
    border-bottom: 1px solid var(--table-border);
    white-space: nowrap;
  }

  .stats-table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--table-border);
    color: var(--text-color);
    font-size: 0.875rem;
  }

  .stat-row:hover {
    background: var(--row-hover);
  }

  .sort-button {
    background: none;
    border: none;
    color: var(--header-text);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    transition: color 0.2s;
  }

  .sort-button:hover {
    color: var(--primary-color);
  }

  .sort-button.active {
    color: var(--primary-color);
  }

  .player-name {
    font-weight: 500;
    color: var(--primary-color);
  }

  .stat-value {
    font-weight: 600;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
  }

  .text-right {
    text-align: right;
  }

  .capitalize {
    text-transform: capitalize;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .stats-table th,
    .stats-table td {
      padding: 0.5rem;
      font-size: 0.75rem;
    }

    .sort-button {
      font-size: 0.75rem;
    }
  }
</style>