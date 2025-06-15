<<<<<<< HEAD
=======
<!-- TeamStatsTable.svelte -->
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
		sortedStats.forEach(stat => {
=======
		sortedStats.forEach((stat) => {
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
					<th>
=======
					<th class="team-col">
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
					<th>
=======
					<th class="conference-col">
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
						{#if sortable}
							<button
								class="sort-button"
								on:click={() => handleSort('conference')}
								class:active={sortBy === 'conference'}
							>
<<<<<<< HEAD
								Conference {sortBy === 'conference' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Conference
						{/if}
					</th>
					<th>
=======
								Conf {sortBy === 'conference' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
							</button>
						{:else}
							Conf
						{/if}
					</th>
					<th class="stat-name-col">
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
					<th class="text-right">
=======
					<th class="value-col text-right">
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
							<td class="team-name" class:grouped={index > 0}>
=======
							<td class="team-name team-col" class:grouped={index > 0}>
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
								{#if index === 0}
									{stat.team}
								{:else}
									<span class="indent">↳</span>
								{/if}
							</td>
<<<<<<< HEAD
							<td class:grouped={index > 0}>
=======
							<td class="conference-col" class:grouped={index > 0}>
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
								{#if index === 0}
									{stat.conference}
								{/if}
							</td>
<<<<<<< HEAD
							<td class="stat-name">{stat.statName}</td>
							<td class="stat-value text-right">{formatStatValue(stat.statValue)}</td>
=======
							<td class="stat-name stat-name-col">{stat.statName}</td>
							<td class="stat-value value-col text-right">{formatStatValue(stat.statValue)}</td>
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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
<<<<<<< HEAD
=======
		width: 100%;
		margin: 0;
		padding: 0;
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	}

	.table-container {
		overflow-x: auto;
<<<<<<< HEAD
=======
		width: 100%;
		margin: 0;
		padding: 0;
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--table-bg);
<<<<<<< HEAD
=======
		table-layout: fixed;
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	}

	.stats-table th {
		background: var(--header-bg);
<<<<<<< HEAD
		padding: 0.75rem;
=======
		padding: 0.75rem 0.5rem;
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--header-text);
		border-bottom: 1px solid var(--table-border);
		white-space: nowrap;
		position: sticky;
		top: 0;
		z-index: 10;
<<<<<<< HEAD
	}

	.stats-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--table-border);
		color: var(--text-color);
		font-size: 0.875rem;
=======
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
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
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

<<<<<<< HEAD
	/* Responsive */
	@media (max-width: 768px) {
		.stats-table th,
		.stats-table td {
			padding: 0.5rem;
			font-size: 0.75rem;
		}

		.sort-button {
			font-size: 0.75rem;
=======
	/* Column width definitions for desktop */
	.team-col { width: 25%; }
	.conference-col { width: 20%; }
	.stat-name-col { width: 35%; }
	.value-col { width: 20%; }

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
		.team-col { 
			width: 25%; 
			min-width: 80px;
		}
		.conference-col { 
			width: 15%; 
			min-width: 50px;
		}
		.stat-name-col { 
			width: 40%; 
			min-width: 100px;
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

		.team-name {
			font-weight: 600;
			font-size: 0.75rem;
			line-height: 1.2;
		}

		.stat-value {
			font-weight: 700;
			font-size: 0.8rem;
			color: var(--primary-color);
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
		}

		.grouped {
			font-size: 0.7rem;
		}
<<<<<<< HEAD
	}

	@media (max-width: 480px) {
		.stats-table th,
		.stats-table td {
			padding: 0.375rem;
			font-size: 0.7rem;
=======

		.indent {
			margin-right: 0.25rem;
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
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
		}

		.team-name,
		.stat-name,
		.stat-value {
			font-size: 0.7rem;
		}
<<<<<<< HEAD
=======

		.grouped {
			font-size: 0.65rem;
		}

		/* Adjust column widths for very small screens */
		.team-col {
			width: 23%;
			min-width: 70px;
		}
		.conference-col {
			width: 12%;
			min-width: 40px;
		}
		.stat-name-col {
			width: 42%;
			min-width: 90px;
		}
		.value-col {
			width: 23%;
			min-width: 55px;
		}
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	}
</style>