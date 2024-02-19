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
		completionAttempts: 'Completion Attempts',
		defensiveTDs: 'Defensive TDs',
		extraPoints: 'Extra Points',
		fieldGoalPct: 'Field Goal Percentage',
		fieldGoals: 'Field Goals',
		firstDowns: 'First Downs',
		fourthDownConversions: 'Fourth Down Conversions',
		fourthDownEff: 'Fourth Down Efficiency',
		fourthDowns: 'Fourth Downs',
		fumblesLost: 'Fumbles Lost',
		fumblesRecovered: 'Fumbles Recovered',
		games: 'Games',
		interceptions: 'Interceptions',
		interceptionTDs: 'Interception TDs',
		interceptionYards: 'Interception Yards',
		kickingPoints: 'Kicking Points',
		kickReturns: 'Kick Returns',
		kickReturnTDs: 'Kick Return TDs',
		kickReturnYards: 'Kick Return Yards',
		netPassingYards: 'Net Passing Yards',
		passAttempts: 'Pass Attempts',
		passCompletions: 'Pass Completions',
		passesDeflected: 'Passes Deflected',
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
		thirdDownEff: 'Third Down Efficiency',
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
	
	let pageSize: number = 16;
	let pageTitle: string = '';

	$: totalItems = teamData ? teamData.total : 0;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: currentPage = Number($page.url.searchParams.get('skip')) / pageSize || 0;

	$: year = $page.url.searchParams.get('year') || '';
	$: team = $page.url.searchParams.get('team') || '';
	$: conference = $page.url.searchParams.get('conference') || '';
	$: startWeek = $page.url.searchParams.get('startWeek') || '';
	$: endWeek = $page.url.searchParams.get('endWeek') || '';

	let sortOrder: 'asc' | 'desc' = 'desc';
	let sortBy: keyof TeamStat = 'team';

	// Ascending/Descending sort function for teamStatsData
	function sortTeamStatsData(teamStatsData: TeamStat[]): TeamStat[] {
		return teamStatsData.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
			if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function toggleSortOrder(column: keyof TeamStat) {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		sortBy = column;
		// Update the sortedTeamStatsData based on the new sort order
		sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);
	}

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

	$: sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);
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

			<div class="team-stats-container">
				<table class="team-stats-table">
					<thead>
						<tr>
							<th class="team-table-header" scope="col">
								<button on:click={() => toggleSortOrder('team')}>TEAM</button>
							</th>
							<th class="conference-table-header" scope="col">
								<button on:click={() => toggleSortOrder('conference')}>CONF.</button>
							</th>
							<th class="stat-type-table-header" scope="col">
								<button on:click={() => toggleSortOrder('statName')}>TYPE</button>
							</th>
							<th class="stat-table-header" scope="col">
								<button on:click={() => toggleSortOrder('statValue')}>STAT</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedTeamStatsData.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as teamStats}
							<tr>
								<td class="td-team">{teamStats.team}</td>
								<td class="td-conference">{teamStats.conference}</td>
								<td class="td-statName">{statTypeDisplayNames[teamStats.statName]}</td>
								<td class="td-statValue">{teamStats.statValue}</td>
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
					No team stats data available,
					<a
						class="link"
						class:light={!$theme}
						class:dark={$theme}
						href="/teams"
						role="button"
						aria-label="Return to Team Search page"
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
		--team-name-color: #005ebb;
		--table-border: #d6d6d6;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--team-name-color: #abaeff;
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

	.teams-image {
		height: auto;
		width: 4.5%;
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
		justify-content: center;
		width: 90%;
		gap: 2rem;
	}

	.team-stats-table {
		width: 66%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	.team-stats-table th,
	.team-stats-table td {
		border: 1px solid var(--table-border);
		padding: 0.5rem;
		text-align: left;
	}

	.team-stats-table th {
		background-color: var(--form-sub-background-color);
		cursor: pointer;
	}

	.team-stats-table th button {
		background: none;
		border: none;
		cursor: pointer;
		outline: none;
		font-weight: bold;
		color: var(--text-color) !important;
	}

	.team-stats-table th button:hover {
		text-decoration: underline;
	}

	.td-team {
		width: 13%;
	}

	.td-conference {
		width: 8%;
	}

	.td-statName {
		width: 13%;
	}

	.td-statValue {
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

		.teams-image {
			display: none;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
			margin-left: -1rem;
		}

		.team-stats-table th button {
			font-size: 0.675rem;
		}

		.team-stats-table {
			width: max-content;
			font-size: 0.675rem;
		}

		.team-stats-table th,
		.team-stats-table td {
			padding: 0.375rem 0.175rem;
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
