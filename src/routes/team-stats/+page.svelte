<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { capitalizeFirstChar } from '$lib/utils/capitalizeFirstChar';
	import { onMount } from 'svelte';
	import TeamStatsWidget from '../../components/TeamStatsWidget.svelte';
	import '../../styles/main.css';

	export let data: { teamData?: any };
	const { teamData } = data;

	const statTypeDisplayNames: Record<string, string> = {
		firstDowns: 'First Downs',
		fourthDownConversions: 'Fourth Down Conversions',
		fourthDowns: 'Fourth Downs',
		fumblesLost: 'Fumbles Lost',
		fumblesRecovered: 'Fumbles Recovered',
		games: 'Games',
		interceptions: 'Interceptions',
		interceptionTDs: 'Interception TDs',
		interceptionYards: 'Interception Yards',
		kickReturns: 'Kick Returns',
		kickReturnTDs: 'Kick Return TDs',
		kickReturnYards: 'Kick Return Yards',
		netPassingYards: 'Net Passing Yards',
		passAttempts: 'Pass Attempts',
		passCompletions: 'Pass Completions',
		passesIntercepted: 'Passes Intercepted',
		passingTDs: 'Passing TDs',
		penalties: 'Penalties',
		penaltyYards: 'Penalty Yards',
		possessionTime: 'Possession Time',
		puntReturns: 'Punt Returns',
		puntReturnTDs: 'Punt Return TDs',
		puntReturnYards: 'Punt Return Yards',
		qbHurries: 'QB Hurries',
		rushingAttempts: 'Rushing Attempts',
		rushingTDs: 'Rushing TDs',
		rushingYards: 'Rushing Yards',
		sacks: 'Sacks',
		tackles: 'Tackles',
		tacklesForLoss: 'Tackles for Loss',
		thirdDowns: 'Third Downs',
		thirdDownConversions: 'Third Down Conversions',
		totalFumbles: 'Total Fumbles',
		totalPenaltiesYards: 'Total Penalty Yards',
		totalYards: 'Total Yards',
		turnovers: 'Turnovers',
		yardsPerPass: 'Yards Per Pass',
		yardsPerRushAttempt: 'Yards Per Rush Attempt'
	};

	// Define types for team stats
	interface TeamStat {
		team: string;
		conference: string;
		startWeek: number;
		endWeek: number;
		statName: string;
		statValue: string;
	}

	// Define types for team data
	interface TeamData {
		teamStatsData: TeamStat[];
	}

	let pageSize: number = 18;
	let pageTitle: string = '';

	$: totalItems = teamData ? teamData.total : 0;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: currentPage = selectedStat === '' ? Number($page.url.searchParams.get('skip')) / pageSize : 0;

	$: year = $page.url.searchParams.get('year') || '';
	$: team = $page.url.searchParams.get('team') || '';
	$: conference = $page.url.searchParams.get('conference') || '';
	$: startWeek = $page.url.searchParams.get('startWeek') || '';
	$: endWeek = $page.url.searchParams.get('endWeek') || '';

	let sortOrder: 'asc' | 'desc' = 'desc';
	let sortBy: keyof TeamStat = 'team';
	let selectedStat: string | number = '';

	// Ascending/Descending sort function for teamStatsData
	function sortTeamStatsData(teamStatsData: TeamStat[]): TeamStat[] {
		return teamStatsData.sort((a, b) => {
			const valueA = a[selectedStat as keyof TeamStat];
			const valueB = b[selectedStat as keyof TeamStat];

			// Convert the values to strings before comparison
			const stringA = String(valueA);
			const stringB = String(valueB);

			if (stringA < stringB) return sortOrder === 'asc' ? -1 : 1;
			if (stringA > stringB) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function toggleSortOrder(event: Event & { currentTarget: HTMLSelectElement }) {
		const column = event.currentTarget.value;
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		selectedStat = column;
		sortBy = column as keyof TeamStat;

		// Update the sortedTeamStatsData based on the new sort order
		sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);
		console.log('Sorted Data:', sortedTeamStatsData);
	}

	$: sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);

	let filteredTeamStatsData: TeamStat[] = [];

	$: filteredTeamStatsData =
		selectedStat === ''
			? teamData?.teamStatsData.slice()
			: teamData?.teamStatsData.filter(
					(stat: { statName: string | number }) => stat.statName === selectedStat
			  );

	onMount(() => {
		let formattedTeamName = team ? capitalizeFirstChar(team) : '';
		let formattedConference = conference ? `${conference.toUpperCase()}` : '';
		// Build the title based on the presence of each parameter
		if (team && !conference) {
			pageTitle += `${formattedTeamName}`;
		} else if (!team && conference) {
			pageTitle += `${formattedConference}`;
		} else if (team && conference) {
			pageTitle += `${formattedTeamName} - ${formattedConference}`;
		}

		if (year) pageTitle += ` - ${year}`;
		if (startWeek) pageTitle += ` - Week ${startWeek}`;
		if (endWeek) pageTitle += ` to ${endWeek}`;
	});
</script>

<div class="stats-wrapper" class:light={!$theme} class:dark={$theme}>
	<section class="stats-section">
		{#if sortedTeamStatsData && sortedTeamStatsData.length > 0}
			<div class="header-image-wrapper">
				<img class="teams-image" src="/teams.png" alt="Team Stats" aria-hidden="true" />
				<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
					{pageTitle}
				</h1>
			</div>

			<div class="stat-search-widget">
				<TeamStatsWidget />
			</div>

			<div class="sorting-controls" class:light={!$theme} class:dark={$theme}>
				<label for="sortSelect">Sort By:</label>
				<select id="statSelect" bind:value={selectedStat} on:change={toggleSortOrder}>
					<option value="">All Stats</option>
					{#each Object.entries(statTypeDisplayNames) as [stat, displayName]}
						<option value={stat}>{displayName}</option>
					{/each}
				</select>
			</div>

			<div class="team-stats-container">
				{#each filteredTeamStatsData.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as teamStats}
					<div class="team-stat-card">
						<div class="card-header">
							<h3 class="card-team">
								{teamStats.team}
							</h3>
							<p class="card-conference">
								{teamStats.conference}
							</p>
						</div>
						<div class="card-body">
							<p class="card-stat-name">
								{statTypeDisplayNames[teamStats.statName]}
							</p>
							<p class="card-stat-value">
								{teamStats.statValue}
							</p>
						</div>
					</div>
				{/each}
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
					No team stats data available,
					<a
						class="link"
						class:light={!$theme}
						class:dark={$theme}
						href="/teams"
						role="button"
						aria-label="Return to Team Search page"
					>
						click here to try a different search,
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
		--stat-name-color: #005ebb;
		--table-border: #d6d6d6;
		--subtle-text-color: #777;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--stat-name-color: #bfc1ff;
		--table-border: #444e64;
		--subtle-text-color: #777;
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

	.sorting-controls {
		margin-bottom: 1.5rem;
	}

	label {
		margin-right: 0.75rem;
		font-weight: bold;
	}

	select {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
		background-color: var(--background-color);
		color: var(--text-color);
		cursor: pointer;
	}

	.header-image-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2rem;
	}

	.teams-image {
		height: auto;
		width: 4.675%;
		margin-right: 0.75rem;
		margin-bottom: 1rem;
	}

	.main-title {
		max-inline-size: 50ch;
		text-wrap: balance;
		text-align: center;
		font-size: 2.25rem;
		line-height: 2.5rem;
	}

	.team-stats-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 1rem;
		width: 90%;
	}

	.team-stat-card {
		background-color: var(--background-color);
		border: 1px solid var(--table-border);
		border-radius: 8px;
		padding: 1.5rem;
		width: calc(16.666% - 1rem);
		box-sizing: border-box;
		transition: transform 0.3s ease, background-color 0.3s ease;
		overflow: hidden;
	}

	.team-stat-card:hover {
		transform: scale(1.03);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.card-header h3 {
		margin: 0;
		font-size: 0.75rem;
		font-weight: bold;
		color: var(--subtle-text-color);
		transition: color 0.3s ease;
	}

	.card-header p {
		margin: 0;
		font-size: 0.75rem;
		color: var(--subtle-text-color);
	}

	.card-body {
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--stat-name-color);
	}

	.card-stat-value {
		display: inline;
		font-size: 3rem;
		font-weight: bold;
		color: var(--text-color);
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

		.teams-image {
			display: none;
		}

		.team-stat-card {
			padding: 1rem;
			width: 100%;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
			margin-left: -1rem;
		}

		.sorting-controls {
			margin: 0.5rem 0 1rem 1rem;
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
