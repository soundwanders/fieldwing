<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { capitalizeFirstChar } from '$lib/utils/capitalizeFirstChar';
	import StatSearchWidget from '../../components/StatSearchWidget.svelte';
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

	// Ascending/Descending Sort function for playerStatsData
	function sortPlayerStatsData(playerStatsData: PlayerStat[]): PlayerStat[] {
		return playerStatsData.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
			if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function toggleSortOrder(column: keyof PlayerStat) {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		sortBy = column;
		// Update the sortedPlayerStatsData based on the new sort order and column
		sortedPlayerStatsData = sortPlayerStatsData(playerData?.playerStatsData || []);
	}

	onMount(() => {
		let formattedTeamName = team ? capitalizeFirstChar(team) : '';
		let formattedConference = conference ? `${conference.toUpperCase()}` : '';
		let formattedseasonType = capitalizeFirstChar(seasonType);
		let formattedCategory = capitalizeFirstChar(category);

		// Build the title based on the presence of each parameter
		if (team && !conference) { pageTitle += `${formattedTeamName}`; }

		else if (!team && conference) { pageTitle += `${formattedConference}`; }

		else if (team && conference) { pageTitle += `${formattedTeamName} - ${formattedConference}`; }

		if (year) pageTitle += ` - ${year}`;
		if (startWeek) pageTitle += ` - Week ${startWeek}`;
		if (endWeek) pageTitle += ` to ${endWeek}`;
		if (seasonType) pageTitle += ` - ${formattedseasonType}`;
		if (category) pageTitle += ` - ${formattedCategory}`;
	});

	$: sortedPlayerStatsData = sortPlayerStatsData(playerData?.playerStatsData || []);
</script>

<div class="stats-wrapper" class:light={!$theme} class:dark={$theme}>
	<section class="stats-section">
		{#if sortedPlayerStatsData && sortedPlayerStatsData.length > 0}
			<div class="header-image-wrapper">
				<img class="players-image" src="/players.png" alt="Player Stats" aria-hidden="true" />
				<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
					{pageTitle}
				</h1>
			</div>

			<div class="stat-search-widget">
				<StatSearchWidget />
			</div>

			<div class="player-stats-container">
				<table class="player-stats-table">
					<thead>
						<tr>
							<th class="player-table-header" scope="col">
								<button on:click={() => toggleSortOrder('player')}>PLAYER</button>
							</th>
							<th class="team-table-header" scope="col">
								<button on:click={() => toggleSortOrder('team')}>TEAM</button>
							</th>
							<th class="conference-table-header" scope="col">
								<button on:click={() => toggleSortOrder('conference')}>CONF.</button>
							</th>
							<th class="category-table-header" scope="col">
								<button on:click={() => toggleSortOrder('category')}>CATEGORY</button>
							</th>
							<th class="stat-type-table-header" scope="col">
								<button on:click={() => toggleSortOrder('statType')}>TYPE</button>
							</th>
							<th class="stat-table-header" scope="col">
								<button on:click={() => toggleSortOrder('stat')}>Stat</button>
							</th>
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
			<div class="pagination" class:light={!$theme} class:dark={$theme} role="navigation">
				{#each Array(totalPages) as _, idx}
					<a
						href="?limit={pageSize}&skip={pageSize * idx}"
						class="pagination-item {currentPage === idx ? 'active' : ''}"
						aria-label="Page number {currentPage}"
					>
						{idx + 1}
					</a>
				{/each}
			</div>
		{:else}
			<div class="error-wrapper">
				<p class="no-data-message">
					No player stats data available,
					<a
						class="link"
						class:light={!$theme}
						class:dark={$theme}
						href="/players"
						role="button"
						aria-label="Return to Player Stat Search page"
					>
						click here to try a different search!
					</a>
					or
					<a
						class="link"
						class:light={!$theme}
						class:dark={$theme}
						href="/"
						role="button"
						aria-label="Return to Home page"
					>
						return to the home page.
					</a>
				</p>
			</div>
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
		background-color: var(--form-sub-background-color);
		cursor: pointer;
	}

	.player-stats-table th button {
		background: none;
		border: none;
		cursor: pointer;
		outline: none;
		font-weight: bold;
		color: var(--text-color) !important;
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

	.error-wrapper {
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: baseline;
		justify-content: center;
		background-color: var(--background-color);
		background-image: none;
		margin: 0;
		padding: 0;
	}

	.no-data-message {
		font-size: 1.125rem;
		line-height: 1.75rem;
		color: var(--text-color);
		background-color: var(--background-color);
		background-image: none;
	}

	.pagination {
		display: flex;
		max-width: 80%;
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
		margin: 0 0.3rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.25rem;
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
			gap: 0;
			min-height: 100%;
			width: 90%;
			margin-top: 0.25rem;
		}

		.header-image-wrapper {
			width: 90%;
			margin-bottom: 1rem;
		}

		.players-image {
			display: none;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
			margin-left: -1rem;
		}

		.player-stats-table th button {
			font-size: 0.675rem;
		}

		.player-stats-table {
			width: max-content;
			font-size: 0.675rem;
		}

		.player-stats-table th,
		.player-stats-table td {
			padding: 0.375rem 0.175rem;
		}

		/* .conference-table-header, .td-conference {
			display: none;
		} */
	
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
