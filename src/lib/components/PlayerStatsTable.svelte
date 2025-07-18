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
		if (!sortable || !stats || stats.length === 0) return stats || [];

		return [...stats].sort((a, b) => {
			let aVal = a[sortBy];
			let bVal = b[sortBy];

			// Handle numeric sorting for stat values
			if (sortBy === 'stat') {
				// Convert to numbers for proper numeric sorting
				const aNum = parseFloat(String(aVal).replace(/,/g, ''));
				const bNum = parseFloat(String(bVal).replace(/,/g, ''));

				if (!isNaN(aNum) && !isNaN(bNum)) {
					aVal = aNum;
					bVal = bNum;
				}
			}

			// Handle null/undefined values
			if (aVal === undefined && bVal === undefined) return 0;
			if (aVal === undefined || aVal === null) return 1;
			if (bVal === undefined || bVal === null) return -1;

			// Convert to strings for comparison if not numbers
			if (typeof aVal !== 'number' && typeof bVal !== 'number') {
				aVal = String(aVal).toLowerCase();
				bVal = String(bVal).toLowerCase();
			}

			// Compare values
			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	})();

	function formatStatValue(value: any): string {
		if (value === null || value === undefined) return '-';
		if (typeof value === 'number') {
			// Format large numbers with commas
			return value.toLocaleString();
		}
		// Handle string numbers
		const strValue = String(value);
		const numValue = parseFloat(strValue);
		if (!isNaN(numValue) && numValue > 999) {
			return numValue.toLocaleString();
		}
		return strValue;
	}

	function formatCategoryName(category: string): string {
		if (!category) return '';

		// Handle camelCase categories
		const formatted = category
			.replace(/([A-Z])/g, ' $1') // Add space before capital letters
			.replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
			.trim();

		return formatted;
	}

	function getSortIcon(column: keyof PlayerStat): string {
		if (!sortable || sortBy !== column) return '';
		return sortOrder === 'asc' ? '↑' : '↓';
	}
</script>

<div class="table-wrapper" class:light={!$theme} class:dark={$theme}>
	{#if !stats || stats.length === 0}
		<div class="empty-table">
			<div class="empty-icon">📊</div>
			<p class="empty-message">No player statistics to display</p>
		</div>
	{:else}
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
									type="button"
								>
									Player {getSortIcon('player')}
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
									type="button"
								>
									Team {getSortIcon('team')}
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
									type="button"
								>
									Conf {getSortIcon('conference')}
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
									type="button"
								>
									Category {getSortIcon('category')}
								</button>
							{:else}
								Category
							{/if}
						</th>
						<th class="stat-type-col">
							{#if sortable}
								<button
									class="sort-button"
									on:click={() => handleSort('statType')}
									class:active={sortBy === 'statType'}
									type="button"
								>
									Stat Type {getSortIcon('statType')}
								</button>
							{:else}
								Stat Type
							{/if}
						</th>
						<th class="value-col text-right">
							{#if sortable}
								<button
									class="sort-button text-right"
									on:click={() => handleSort('stat')}
									class:active={sortBy === 'stat'}
									type="button"
								>
									Value {getSortIcon('stat')}
								</button>
							{:else}
								Value
							{/if}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedStats as stat, index (stat.playerId ? `${stat.playerId}-${stat.statType}-${index}` : `${stat.player}-${stat.statType}-${index}`)}
						<tr class="stat-row">
							<td class="player-name player-col" title={stat.player || 'Unknown Player'}>
								{stat.player || 'Unknown Player'}
							</td>
							<td class="team-col" title={stat.team || 'Unknown Team'}>
								{stat.team || 'Unknown Team'}
							</td>
							<td class="conference-col" title={stat.conference || 'Unknown Conference'}>
								{stat.conference || 'N/A'}
							</td>
							<td class="category-col">
								<span class="category-badge">
									{formatCategoryName(stat.category || 'Other')}
								</span>
							</td>
							<td class="stat-type-col" title={stat.statType || 'Unknown Stat'}>
								{stat.statType || 'Unknown Stat'}
							</td>
							<td
								class="stat-value value-col text-right"
								title="Value: {formatStatValue(stat.stat)}"
							>
								{formatStatValue(stat.stat)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
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
		--secondary-color: #64748b;
		--category-bg: #eff6ff;
		--category-text: #1e40af;
	}

	.dark {
		--table-bg: #1f2937;
		--table-border: #374151;
		--header-bg: #111827;
		--header-text: #d1d5db;
		--row-hover: #374151;
		--text-color: #f9fafb;
		--primary-color: #60a5fa;
		--secondary-color: #9ca3af;
		--category-bg: #1e3a8a;
		--category-text: #bfdbfe;
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

	.empty-table {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		text-align: center;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.6;
	}

	.empty-message {
		color: var(--secondary-color);
		margin: 0;
		font-size: 1rem;
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
		table-layout: auto;
		min-width: 800px;
	}

	.stats-table th {
		background: var(--header-bg);
		padding: 0.75rem 0.5rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--header-text);
		border-bottom: 2px solid var(--table-border);
		white-space: nowrap;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.stats-table td {
		padding: 0.75rem 0.5rem;
		border-bottom: 1px solid var(--table-border);
		color: var(--text-color);
		font-size: 0.875rem;
		vertical-align: top;
	}

	.stat-row {
		transition: background-color 0.15s ease;
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

	.sort-button.text-right {
		justify-content: flex-end;
		text-align: right;
	}

	.sort-button:hover {
		color: var(--primary-color);
	}

	.sort-button.active {
		color: var(--primary-color);
	}

	.player-name {
		font-weight: 600;
		color: var(--primary-color);
	}

	.stat-value {
		font-weight: 600;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		color: var(--primary-color);
	}

	.category-badge {
		display: inline-block;
		background: var(--category-bg);
		color: var(--category-text);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.text-right {
		text-align: right;
	}

	/* Column width definitions for desktop */
	.player-col {
		width: 25%;
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
		width: 20%;
	}
	.value-col {
		width: 13%;
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
			min-width: 700px;
		}

		.stats-table th {
			padding: 0.5rem 0.25rem;
			font-size: 0.75rem;
		}

		.stats-table td {
			padding: 0.5rem 0.25rem;
			font-size: 0.75rem;
		}

		.sort-button {
			font-size: 0.75rem;
			gap: 0.125rem;
		}

		.player-name {
			font-size: 0.75rem;
			line-height: 1.2;
		}

		.stat-value {
			font-size: 0.8rem;
		}

		.category-badge {
			font-size: 0.625rem;
			padding: 0.125rem 0.375rem;
		}

		.empty-table {
			padding: 2rem 1rem;
		}

		.empty-icon {
			font-size: 2rem;
		}

		.empty-message {
			font-size: 0.875rem;
		}
	}

	/* Extra small mobile */
	@media (max-width: 480px) {
		.stats-table th,
		.stats-table td {
			padding: 0.375rem 0.125rem;
			font-size: 0.7rem;
		}

		.stats-table {
			min-width: 600px;
		}

		.player-name,
		.stat-value {
			font-size: 0.7rem;
		}

		.category-badge {
			font-size: 0.6rem;
			padding: 0.1rem 0.3rem;
		}
	}

	/* Accessibility improvements */
	.sort-button:focus {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	/* Print styles */
	@media print {
		.table-wrapper {
			box-shadow: none;
			border: 1px solid #000;
		}

		.stat-row:hover {
			background: transparent;
		}

		.sort-button {
			color: #000;
		}
	}
</style>
