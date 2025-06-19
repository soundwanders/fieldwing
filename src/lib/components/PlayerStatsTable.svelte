<!-- PlayerStatsTable.svelte -->
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
					<th class="player-col">
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
					<th class="team-col">
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
					<th class="conference-col">
						{#if sortable}
							<button
								class="sort-button"
								on:click={() => handleSort('conference')}
								class:active={sortBy === 'conference'}
							>
								Conf {sortBy === 'conference' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Conf
						{/if}
					</th>
					<th class="category-col">
						{#if sortable}
							<button
								class="sort-button"
								on:click={() => handleSort('category')}
								class:active={sortBy === 'category'}
							>
								Cat {sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Cat
						{/if}
					</th>
					<th class="stat-type-col">
						{#if sortable}
							<button
								class="sort-button"
								on:click={() => handleSort('statType')}
								class:active={sortBy === 'statType'}
							>
								Stat {sortBy === 'statType' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Stat
						{/if}
					</th>
					<th class="value-col text-right">
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
						<td class="player-name player-col">{stat.player}</td>
						<td class="team-col">{stat.team}</td>
						<td class="conference-col">{stat.conference}</td>
						<td class="category-col capitalize">{stat.category}</td>
						<td class="stat-type-col">{stat.statType}</td>
						<td class="stat-value value-col text-right">{formatStatValue(stat.stat)}</td>
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
		width: 100%;
		margin: 0;
		padding: 0;
	}

	.table-container {
		overflow-x: auto;
		width: 100%;
		margin: 0;
		padding: 0;
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--table-bg);
		table-layout: fixed;
	}

	.stats-table th {
		background: var(--header-bg);
		padding: 0.75rem 0.5rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--header-text);
		border-bottom: 1px solid var(--table-border);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stats-table td {
		padding: 0.75rem 0.5rem;
		border-bottom: 1px solid var(--table-border);
		color: var(--text-color);
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		width: 100%;
		text-align: left;
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

	/* Column width definitions for desktop */
	.player-col {
		width: 20%;
	}
	.team-col {
		width: 15%;
	}
	.conference-col {
		width: 12%;
	}
	.category-col {
		width: 15%;
	}
	.stat-type-col {
		width: 18%;
	}
	.value-col {
		width: 20%;
	}

	/* Mobile responsive fixes */
	@media (max-width: 768px) {
		.table-wrapper {
			margin: 0;
			padding: 0;
			border-radius: 0.25rem;
		}

		.table-container {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		.stats-table {
			min-width: 100%;
			table-layout: auto;
		}

		.stats-table th {
			padding: 0.4rem 0.25rem;
			font-size: 0.7rem;
			vertical-align: top;
		}

		.stats-table td {
			padding: 0.4rem 0.25rem;
			font-size: 0.75rem;
			vertical-align: top;
			word-wrap: break-word;
			white-space: normal;
		}

		/* Optimize column widths for mobile */
		.player-col {
			width: 25%;
			min-width: 80px;
		}
		.team-col {
			width: 20%;
			min-width: 60px;
		}
		.conference-col {
			width: 15%;
			min-width: 45px;
		}
		.category-col {
			width: 15%;
			min-width: 50px;
		}
		.stat-type-col {
			width: 25%;
			min-width: 70px;
		}
		.value-col {
			width: 20%;
			min-width: 60px;
			text-align: right;
		}

		.sort-button {
			font-size: 0.7rem;
			padding: 0.2rem 0;
			gap: 0.1rem;
		}

		.player-name {
			font-weight: 600;
			font-size: 0.75rem;
			line-height: 1.2;
		}

		.stat-value {
			font-weight: 700;
			font-size: 0.8rem;
			color: var(--primary-color);
		}

		/* Hide sort arrows on mobile to save space */
		.sort-button:after {
			display: none;
		}
	}

	/* Extra small mobile */
	@media (max-width: 480px) {
		.stats-table th {
			font-size: 0.65rem;
			padding: 0.3rem 0.15rem;
		}

		.stats-table td {
			font-size: 0.7rem;
			padding: 0.3rem 0.15rem;
		}

		.player-name,
		.stat-value {
			font-size: 0.7rem;
		}

		.conference-col {
			width: 12%;
			min-width: 35px;
		}

		.value-col {
			width: 22%;
		}
	}
</style>
