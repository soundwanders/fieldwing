<!-- src/routes/player-stats/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { capitalizeFirstChar } from '$lib/utils/capitalizeFirstChar';
	import { onMount } from 'svelte';
	import '../../styles/main.css';

	export let data: { playerData?: any };
	const { playerData } = data;

	// Define types for player stats
	interface PlayerStat {
		playerId: string;
		player: string;
		team: string;
		conference: string;
		startWeek: number;
		endWeek: number;
		seasonType: string;
		category: string;
		statType: string;
		stat: string;
	}

	// Define types for player data
	interface PlayerData {
		playerStatsData: PlayerStat[];
	}

	let pageSize: number = 16;
	let pageTitle: string = '';

	$: totalItems = playerData ? playerData.total : 0;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: currentPage = Number($page.url.searchParams.get('skip')) / pageSize || 0;

	$: year = $page.url.searchParams.get('year') || '';
	$: team = $page.url.searchParams.get('team') || '';
	$: conference = $page.url.searchParams.get('conference') || '';
	$: startWeek = $page.url.searchParams.get('startWeek') || '';
	$: endWeek = $page.url.searchParams.get('endWeek') || '';
	$: seasonType = $page.url.searchParams.get('seasonType') || '';
	$: category = $page.url.searchParams.get('category') || '';

	let sortOrder: 'asc' | 'desc' = 'desc';
	let sortBy: keyof PlayerStat = 'player';

	function toggleSortOrder(column: keyof PlayerStat) {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		sortBy = column;
		// Update the sortedPlayerStatsData based on the new sort order and column
		sortedPlayerStatsData = sortPlayerStatsData(playerData?.playerStatsData || []);
	}

	// Sort function for playerStatsData
	function sortPlayerStatsData(playerStatsData: PlayerStat[]): PlayerStat[] {
		return playerStatsData.sort((a, b) => {
			// Always sort 'stat' from high to low
			if (sortBy === 'stat') {
				return parseFloat(b.stat) - parseFloat(a.stat);
			}

			// Sort other columns based on the current sorting order
			if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
			if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	onMount(() => {
		let formattedTeamName = capitalizeFirstChar(team);
		let formattedseasonType = capitalizeFirstChar(seasonType);
		let formattedCategory = capitalizeFirstChar(category);
		let formattedConference = conference.toUpperCase();

		// Build the title based on the presence of each parameter
		if (team) pageTitle += `${formattedTeamName}`;
		if (conference) pageTitle += ` - ${formattedConference}`;
		if (year) pageTitle += ` - ${year}`;
		if (startWeek) pageTitle += ` - Week ${startWeek}`;
		if (endWeek) pageTitle += ` to ${endWeek}`;
		if (seasonType) pageTitle += ` - ${formattedseasonType}`;
		if (category) pageTitle += ` - ${formattedCategory}`;
	});

	$: {
		console.log('totalItems:', totalItems);
		console.log('totalPages:', totalPages);
		console.log('pageTitle:', pageTitle);
	}

	$: sortedPlayerStatsData = sortPlayerStatsData(playerData?.playerStatsData || []);
</script>

<div class="stats-wrapper" class:light={!$theme} class:dark={$theme}>
	<section class="stats-section">
		{#if sortedPlayerStatsData && sortedPlayerStatsData.length > 0}
			<div class="header-image-wrapper">
				<img class="players-image" src="/players.png" alt="Player Stats" />
				<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
					{pageTitle}
				</h1>
			</div>

			<div class="player-stats-container">
				<table class="player-stats-table">
					<thead>
						<tr>
							<th><button on:click={() => toggleSortOrder('player')}>Player</button></th>
							<th><button on:click={() => toggleSortOrder('team')}>Team</button></th>
							<th><button on:click={() => toggleSortOrder('conference')}>Conference</button></th>
							<th><button on:click={() => toggleSortOrder('category')}>Category</button></th>
							<th><button on:click={() => toggleSortOrder('statType')}>Stat Type</button></th>
							<th><button on:click={() => toggleSortOrder('stat')}>Stat</button></th>
						</tr>
					</thead>
					<tbody>
						{#each sortedPlayerStatsData.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as playerStats}
							<tr>
								<td class="td-player">{playerStats.player}</td>
								<td class="td-team">{playerStats.team}</td>
								<td class="td-conference">{playerStats.conference}</td>
								<td class="td-category">{capitalizeFirstChar(playerStats.category)}</td>
								<td class="td-statType">{playerStats.statType}</td>
								<td class="td-stat">{playerStats.stat}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Add pagination controls using $page -->
			<div class="pagination" class:light={!$theme} class:dark={$theme}>
				{#each Array(totalPages) as _, idx}
					<a
						href="?limit={pageSize}&skip={pageSize * idx}"
						class="pagination-item {currentPage === idx ? 'active' : ''}"
					>
						{idx + 1}
					</a>
				{/each}
			</div>
		{:else}
			<p class="no-data-message">No player stats data available.</p>
		{/if}
	</section>
</div>

<style module>
	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
		--teams-color: #bb0000;
		--player-name-color: #005ebb;
		--table-border: #d6d6d6;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--teams-color: #ff9195;
		--player-name-color: #abaeff;
		--table-border: #444e64;
	}

	.stats-wrapper {
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: baseline;
		justify-content: center;
		background-color: var(--background-color);
		background-image: var(--background-image);
		margin: 0;
		padding: 0;
	}

	.stats-section {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100vw;
		color: var(--text-color);
	}

	.header-image-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2rem;
	}

	.players-image {
		height: auto;
		width: 4.5%;
		margin-right: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.main-title {
		max-inline-size: 50ch;
		text-wrap: balance;
		text-align: center;
		font-size: 2.25rem;
		line-height: 2.5rem;
	}

	.player-stats-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90%;
		gap: 2rem;
	}

	.player-stats-table {
		width: 66%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	.player-stats-table th,
	.player-stats-table td {
		border: 1px solid var(--table-border);
		padding: 0.5rem;
		text-align: left;
	}

	.player-stats-table th {
		background-color: #f2f2f2;
		cursor: pointer;
	}

	.player-stats-table th button {
		background: none;
		border: none;
		cursor: pointer;
		outline: none;
		font-weight: bold;
	}

	.player-stats-table th button:hover {
		text-decoration: underline;
	}

	.td-player {
		width: 15%;
	}

	.td-team {
		width: 13%;
	}

	.td-conference {
		width: 8%;
	}

	.td-category {
		width: 13%;
	}

	.td-statType {
		width: 13%;
	}

	.td-stat {
		width: 13%;
	}

	.no-data-message {
		font-size: 1.2rem;
		line-height: 1.5rem;
		color: var(--text-color);
	}

	.pagination {
		display: flex;
		width: 80%;
		list-style: none;
		padding: 0;
		margin: 2rem 0;
		overflow-x: auto;
	}

	.pagination a {
		color: var(--text-color);
		text-decoration: none;
	}

	.pagination-item {
		margin: 0 5px;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		background-color: var(--background-color);
		transition: background-color 0.3s ease;
	}

	.pagination-item.active {
		background-color: #0051a8;
		color: #fff;
	}

	.pagination-item:hover {
		background-color: #555;
	}

	@media (max-width: 768px) {
		.stats-wrapper {
			min-height: 100%;
			width: 100%;
			margin: 0;
			padding: 0;
		}

		.stats-section {
			flex-direction: column;
			align-items: center;
			gap: 2.5rem;
			min-height: 100%;
			width: 90%;
			margin-top: 0.25rem;
		}

		.header-image-wrapper {
			width: 90%;
			margin-bottom: 1rem;
		}

		.players-image {
			height: auto;
			width: 18%;
			margin-right: 0.5rem;
			margin-bottom: 1.25rem;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
		}

		.player-stats-table {
			width: 90%;
		}

		.pagination {
			margin: 1rem 0 4rem 0;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
