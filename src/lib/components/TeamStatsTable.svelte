<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import type { TeamStat } from '$lib/types/api';

	export let stats: TeamStat[];
	export let sortable: boolean = true;

	let sortBy: keyof TeamStat = 'team';
	let sortOrder: 'asc' | 'desc' = 'asc';

	function handleSort(column: keyof TeamStat) {
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
			if (sortBy === 'statValue' && !isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
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

	// Group stats by team for better display
	$: groupedStats = (() => {
		const grouped = new Map<string, TeamStat[]>();
		sortedStats.forEach((stat) => {
			const key = `${stat.team}-${stat.conference}`;
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(stat);
		});
		return grouped;
	})();
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
								on:click={() => handleSort('statName')}
								class:active={sortBy === 'statName'}
							>
								Statistic {sortBy === 'statName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Statistic
						{/if}
					</th>
					<th class="text-right">
						{#if sortable}
							<button
								class="sort-button"
								on:click={() => handleSort('statValue')}
								class:active={sortBy === 'statValue'}
							>
								Value {sortBy === 'statValue' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Value
						{/if}
					</th>
				</tr>
			</thead>
			<tbody>
				{#each Array.from(groupedStats.entries()) as [teamKey, teamStats]}
					{@const [teamName, conference] = teamKey.split('-')}
					{#each teamStats as stat, index (stat.team + stat.statName)}
						<tr class="stat-row" class:team-header={index === 0}>
							<td class="team-name" class:grouped={index > 0}>
								{#if index === 0}
									{stat.team}
								{:else}
									<span class="indent">↳</span>
								{/if}
							</td>
							<td class:grouped={index > 0}>
								{#if index === 0}
									{stat.conference}
								{/if}
							</td>
							<td class="stat-name">{stat.statName}</td>
							<td class="stat-value text-right">{formatStatValue(stat.statValue)}</td>
						</tr>
					{/each}
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
		--secondary-text: #6b7280;
		--grouped-bg: #f8fafc;
	}

	.dark {
		--table-bg: #1f2937;
		--table-border: #374151;
		--header-bg: #111827;
		--header-text: #d1d5db;
		--row-hover: #374151;
		--text-color: #f9fafb;
		--primary-color: #60a5fa;
		--secondary-text: #9ca3af;
		--grouped-bg: #374151;
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
		position: sticky;
		top: 0;
		z-index: 10;
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

	.stat-row.team-header {
		border-top: 2px solid var(--primary-color);
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

	.team-name {
		font-weight: 600;
		color: var(--primary-color);
	}

	.team-name.grouped {
		color: var(--secondary-text);
		font-weight: 400;
		background: var(--grouped-bg);
	}

	.grouped {
		background: var(--grouped-bg);
		font-size: 0.8rem;
	}

	.indent {
		margin-right: 0.5rem;
		color: var(--secondary-text);
	}

	.stat-name {
		font-weight: 500;
	}

	.stat-value {
		font-weight: 600;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		color: var(--text-color);
	}

	.text-right {
		text-align: right;
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

		.grouped {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.stats-table th,
		.stats-table td {
			padding: 0.375rem;
			font-size: 0.7rem;
		}

		.team-name,
		.stat-name,
		.stat-value {
			font-size: 0.7rem;
		}
	}
</style>
