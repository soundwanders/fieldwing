<!-- src/routes/team-stats/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { capitalizeFirstChar } from '$lib/utils/capitalizeFirstChar';
	import { onMount } from 'svelte';
	import TeamStatsWidget from '$lib/components/TeamStatsWidget.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import '../../styles/main.css';

	export let data: {
		teamData?: {
			teamStatsData: TeamStat[];
			total: number;
		};
		searchParams?: any;
		error?: string;
	};

	// Safely extract data with proper fallbacks
	$: teamData = data?.teamData || { teamStatsData: [], total: 0 };
	$: searchParams = data?.searchParams || {};

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

	let isLoading = true;
	let pageError: Error | null = null;
	let pageSize: number = 18;
	let pageTitle: string = '';

	$: totalItems = teamData ? teamData.total : 0;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: currentPage = (() => {
		if (selectedStat !== '') return 0;
		const skipParam = searchParams?.skip || $page.url.searchParams.get('skip') || '0';
		return Math.floor(parseInt(skipParam) / pageSize) || 0;
	})();

	$: year = searchParams?.year || $page.url.searchParams.get('year') || '';
	$: team = searchParams?.team || $page.url.searchParams.get('team') || '';
	$: conference = searchParams?.conference || $page.url.searchParams.get('conference') || '';
	$: startWeek = searchParams?.startWeek || $page.url.searchParams.get('startWeek') || '';
	$: endWeek = searchParams?.endWeek || $page.url.searchParams.get('endWeek') || '';

	let sortOrder: 'asc' | 'desc' = 'desc';
	let sortBy: keyof TeamStat = 'team';
	let selectedStat: string | number = '';

	// Data checks
	$: hasTeamData =
		teamData?.teamStatsData &&
		Array.isArray(teamData.teamStatsData) &&
		teamData.teamStatsData.length > 0;
	$: totalStats = teamData?.teamStatsData?.length || 0;
	$: hasSearchParams = searchParams?.year || false;

	// Ascending/Descending sort function for teamStatsData
	function sortTeamStatsData(teamStatsData: TeamStat[]): TeamStat[] {
		if (!teamStatsData) return [];

		return teamStatsData.sort((a, b) => {
			const valueA = a[selectedStat as keyof TeamStat];
			const valueB = b[selectedStat as keyof TeamStat];

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
		sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);
	}

	$: sortedTeamStatsData = sortTeamStatsData(teamData?.teamStatsData || []);

	let filteredTeamStatsData: TeamStat[] = [];

	$: filteredTeamStatsData =
		selectedStat === ''
			? teamData?.teamStatsData?.slice() || []
			: teamData?.teamStatsData?.filter(
					(stat: { statName: string | number }) => stat.statName === selectedStat
			  ) || [];

	$: displayedStats = filteredTeamStatsData.slice(
		currentPage * pageSize,
		(currentPage + 1) * pageSize
	);

	function handleRetry() {
		pageError = null;
		window.location.reload();
	}

	function formatStatValue(value: any): string {
		if (value === null || value === undefined || value === '') return '0';
		const stringValue = String(value);
		if (stringValue.includes(':')) return stringValue;
		if (stringValue.includes('%')) return stringValue;
		const num = parseFloat(stringValue);
		if (!isNaN(num) && num >= 1000) {
			return num.toLocaleString();
		}
		return stringValue;
	}

	function getStatCategory(statName: string): string {
		const offensiveStats = [
			'passingTDs',
			'rushingTDs',
			'totalYards',
			'netPassingYards',
			'rushingYards',
			'firstDowns'
		];
		const defensiveStats = ['sacks', 'tackles', 'tacklesForLoss', 'interceptions', 'qbHurries'];
		const specialTeamsStats = ['kickReturns', 'kickReturnTDs', 'puntReturns', 'puntReturnTDs'];

		if (offensiveStats.includes(statName)) return 'offense';
		if (defensiveStats.includes(statName)) return 'defense';
		if (specialTeamsStats.includes(statName)) return 'special-teams';
		return 'general';
	}

	onMount(() => {
		let formattedTeamName = team ? capitalizeFirstChar(team) : '';
		let formattedConference = conference ? `${conference.toUpperCase()}` : '';

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

		const timer = setTimeout(() => {
			isLoading = false;
		}, 300);

		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<title>Team Statistics - Fieldwing</title>
	<meta
		name="description"
		content="View comprehensive college football team statistics and analytics."
	/>
</svelte:head>

<ErrorBoundary bind:error={pageError} on:retry={handleRetry}>
	<div class="wrapper">
		{#if isLoading}
			<LoadingSpinner size="large" text="Loading team statistics..." fullScreen={true} />
		{:else}
			<div class="stats-container" class:light={!$theme} class:dark={$theme}>
				<section class="stats-section">
					<!-- Header Section -->
					<div class="header-section">
						<div class="header-content">
							<img class="header-icon" src="/teams.png" alt="Team Statistics" aria-hidden="true" />

							{#if hasTeamData}
								<h1 class="page-title">
									{pageTitle || 'Team Statistics'}
								</h1>
								<p class="page-subtitle">Comprehensive team performance analytics and statistics</p>

								<!-- Statistics Summary -->
								<div class="stats-bar">
									<div class="stat-item">
										<span class="stat-number">{totalStats}</span>
										<span class="stat-label">Stat{totalStats !== 1 ? 's' : ''} Available</span>
									</div>
									<div class="stat-item">
										<span class="stat-number">{filteredTeamStatsData.length}</span>
										<span class="stat-label">Currently Showing</span>
									</div>
									{#if selectedStat}
										<div class="stat-item accent">
											<span class="stat-number"
												>{statTypeDisplayNames[selectedStat] || selectedStat}</span
											>
											<span class="stat-label">Filter Active</span>
										</div>
									{/if}
								</div>
							{:else}
								<h1 class="page-title">Team Statistics</h1>
								<p class="page-subtitle">No team statistics data available</p>
							{/if}
						</div>
					</div>

					{#if hasTeamData}
						<!-- Controls Section -->
						<div class="controls-section">
							<div class="sorting-controls">
								<div class="control-group">
									<label for="statSelect" class="control-label"> 📊 Filter by Statistic: </label>
									<select
										id="statSelect"
										bind:value={selectedStat}
										on:change={toggleSortOrder}
										class="control-select"
									>
										<option value="">All Statistics</option>
										{#each Object.entries(statTypeDisplayNames) as [stat, displayName]}
											<option value={stat}>{displayName}</option>
										{/each}
									</select>
								</div>

								<div class="sort-indicator">
									{#if selectedStat}
										<span class="sort-badge">
											{sortOrder === 'asc' ? '↑' : '↓'}
											{sortOrder === 'asc' ? 'Ascending' : 'Descending'}
										</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Stats Grid -->
						<div class="stats-grid">
							{#each displayedStats as teamStat (teamStat.team + teamStat.statName)}
								<article class="stat-card" class:light={!$theme} class:dark={$theme}>
									<!-- Card Header -->
									<div class="card-header">
										<div class="team-info">
											<h3 class="team-name">{teamStat.team}</h3>
											<div class="team-meta">
												<span class="conference-badge">{teamStat.conference}</span>
												{#if teamStat.startWeek && teamStat.endWeek}
													<span class="week-range">
														Week {teamStat.startWeek}
														{#if teamStat.startWeek !== teamStat.endWeek}
															- {teamStat.endWeek}
														{/if}
													</span>
												{/if}
											</div>
										</div>
										<div class="stat-category {getStatCategory(teamStat.statName)}">
											{#if getStatCategory(teamStat.statName) === 'offense'}
												⚡
											{:else if getStatCategory(teamStat.statName) === 'defense'}
												🛡️
											{:else if getStatCategory(teamStat.statName) === 'special-teams'}
												🏈
											{:else}
												📈
											{/if}
										</div>
									</div>

									<!-- Card Body -->
									<div class="card-body">
										<div class="stat-info">
											<h4 class="stat-name">
												{statTypeDisplayNames[teamStat.statName] || teamStat.statName}
											</h4>
											<div class="stat-value">{formatStatValue(teamStat.statValue)}</div>
										</div>
									</div>

									<!-- Card Footer -->
									<div class="card-footer">
										<div class="stat-details">
											<span class="detail-label">Category:</span>
											<span class="detail-value">
												{capitalizeFirstChar(getStatCategory(teamStat.statName).replace('-', ' '))}
											</span>
										</div>
									</div>
								</article>
							{/each}
						</div>

						<!-- Pagination -->
						{#if totalPages > 1}
							<div class="pagination-section">
								<nav class="pagination" aria-label="Team statistics pagination">
									{#if currentPage > 0}
										<a
											href="?year={encodeURIComponent(year)}&team={encodeURIComponent(
												team
											)}&conference={encodeURIComponent(conference)}&startWeek={encodeURIComponent(
												startWeek
											)}&endWeek={encodeURIComponent(endWeek)}&limit={pageSize}&skip={pageSize *
												(currentPage - 1)}"
											class="pagination-item prev"
											aria-label="Previous page"
										>
											← Previous
										</a>
									{/if}

									{#each Array(Math.min(totalPages, 5)) as _, idx}
										{@const pageNum = Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + idx}
										{#if pageNum < totalPages}
											<a
												href="?year={encodeURIComponent(year)}&team={encodeURIComponent(
													team
												)}&conference={encodeURIComponent(
													conference
												)}&startWeek={encodeURIComponent(startWeek)}&endWeek={encodeURIComponent(
													endWeek
												)}&limit={pageSize}&skip={pageSize * pageNum}"
												class="pagination-item {currentPage === pageNum ? 'active' : ''}"
												aria-label="Page {pageNum + 1}"
											>
												{pageNum + 1}
											</a>
										{/if}
									{/each}

									{#if currentPage < totalPages - 1}
										<a
											href="?year={encodeURIComponent(year)}&team={encodeURIComponent(
												team
											)}&conference={encodeURIComponent(conference)}&startWeek={encodeURIComponent(
												startWeek
											)}&endWeek={encodeURIComponent(endWeek)}&limit={pageSize}&skip={pageSize *
												(currentPage + 1)}"
											class="pagination-item next"
											aria-label="Next page"
										>
											Next →
										</a>
									{/if}
								</nav>

								<div class="pagination-info">
									Showing {currentPage * pageSize + 1} - {Math.min(
										(currentPage + 1) * pageSize,
										filteredTeamStatsData.length
									)}
									of {filteredTeamStatsData.length} statistics
								</div>
							</div>
						{/if}
					{:else}
						<!-- Empty State -->
						<div class="empty-state">
							<div class="empty-content">
								{#if hasSearchParams}
									<h3>📊 No Results Found</h3>
									<p>No team statistics found for your search criteria.</p>
									<div class="search-criteria-display">
										<strong>Your search:</strong>
										{year}
										{#if team}• {team}{/if}
										{#if conference}• {conference}{/if}
										{#if startWeek}• Week {startWeek}{#if endWeek && endWeek !== startWeek}
												to {endWeek}{/if}{/if}
									</div>
									<p class="retry-suggestion">Try adjusting your search parameters below.</p>
								{:else}
									<h3>📊 Ready to Search</h3>
									<p>Enter search criteria below to view team statistics.</p>
									<p class="help-text">
										Start by entering a year and optionally filter by team, conference, or weeks.
									</p>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Team Search Section -->
					<section class="search-section">
						<TeamStatsWidget />
					</section>
				</section>
			</div>
		{/if}
	</div>
</ErrorBoundary>

<style>
	/* ========================================
    CSS VARIABLES & THEME COLORS
  ======================================== */
	.light {
		--bg-primary: #ffffff;
		--bg-secondary: #f8fafc;
		--bg-tertiary: #f1f5f9;
		--text-primary: #1e293b;
		--text-secondary: #64748b;
		--text-accent: #dc2626;
		--border-primary: #e2e8f0;
		--border-secondary: #cbd5e1;
		--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
		--accent-blue: #3b82f6;
		--accent-green: #10b981;
		--accent-orange: #f59e0b;
		--accent-red: #ef4444;
		--accent-purple: #8b5cf6;
	}

	.dark {
		--bg-primary: #1e293b;
		--bg-secondary: #334155;
		--bg-tertiary: #475569;
		--text-primary: #f1f5f9;
		--text-secondary: #cbd5e1;
		--text-accent: #f87171;
		--border-primary: #475569;
		--border-secondary: #64748b;
		--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
		--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
		--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
		--accent-blue: #60a5fa;
		--accent-green: #34d399;
		--accent-orange: #fbbf24;
		--accent-red: #f87171;
		--accent-purple: #a78bfa;
	}

	/* ========================================
    LAYOUT & STRUCTURE
  ======================================== */
	.wrapper {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		width: 100%;
	}

	.stats-container {
		width: min(95%, 55vw);
		max-width: 1000px;
		min-width: 320px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		box-sizing: border-box;
	}

	.stats-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* ========================================
    HEADER SECTION
  ======================================== */
	.header-section {
		text-align: center;
		padding: 1rem 0;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.header-icon {
		width: 64px;
		height: 64px;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		line-height: 1.2;
		word-wrap: break-word;
		hyphens: auto;
	}

	.page-subtitle {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin: 0 0 2rem 0;
		line-height: 1.4;
	}

	/* ========================================
    STATISTICS BAR
  ======================================== */
	.stats-bar {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 1.5rem 0;
		flex-wrap: wrap;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--bg-primary);
		border-radius: 0.75rem;
		box-shadow: var(--shadow-sm);
		min-width: 80px;
		flex: 1;
		max-width: 120px;
	}

	.stat-item.accent {
		background: var(--accent-blue);
		color: white;
	}

	.stat-number {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-accent);
	}

	.stat-item.accent .stat-number {
		color: white;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
		text-align: center;
		line-height: 1.2;
	}

	.stat-item.accent .stat-label {
		color: white;
		opacity: 0.9;
	}

	/* ========================================
    CONTROLS SECTION - CENTERED & COMPACT
  ======================================== */
	.controls-section {
		background: var(--bg-primary);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		border: 1px solid var(--border-primary);
		width: fit-content;
		max-width: 100%;
		margin: 0 auto;
		display: flex;
		justify-content: center;
	}

	.sorting-controls {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		white-space: nowrap;
	}

	.control-label {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.control-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-secondary);
		border-radius: 0.5rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
	}

	.control-select:focus {
		outline: none;
		border-color: var(--accent-blue);
		box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
	}

	.sort-indicator {
		display: flex;
		align-items: center;
	}

	.sort-badge {
		background: var(--accent-green);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	/* ========================================
    STATS GRID WITH PROPER SPACING
  ======================================== */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
		width: 100%;
		padding: 0 1rem;
	}

	/* ========================================
    STAT CARDS
  ======================================== */
	.stat-card {
		background: var(--bg-primary);
		border-radius: 1rem;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1px solid var(--border-primary);
		width: 100%;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg), 0 20px 25px -5px rgb(0 0 0 / 0.1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-primary);
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.team-info {
		flex: 1;
		min-width: 0;
	}

	.team-name {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		line-height: 1.2;
		word-wrap: break-word;
		hyphens: auto;
	}

	.team-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.conference-badge {
		background: var(--accent-blue);
		color: white;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.week-range {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.stat-category {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		font-size: 1rem;
		background: var(--bg-tertiary);
		flex-shrink: 0;
	}

	.stat-category.offense {
		background: var(--accent-orange);
	}

	.stat-category.defense {
		background: var(--accent-red);
	}

	.stat-category.special-teams {
		background: var(--accent-purple);
	}

	.card-body {
		padding: 1rem;
	}

	.stat-info {
		text-align: center;
	}

	.stat-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
		word-wrap: break-word;
		hyphens: auto;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-accent);
		line-height: 1;
	}

	.card-footer {
		padding: 0.75rem 1rem;
		background: var(--bg-tertiary);
		border-top: 1px solid var(--border-primary);
	}

	.stat-details {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	.detail-label {
		color: var(--text-secondary);
		font-weight: 500;
	}

	.detail-value {
		color: var(--text-primary);
		font-weight: 600;
	}

	/* ========================================
    PAGINATION
  ======================================== */
	.pagination-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
		padding: 0 1rem;
	}

	.pagination {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.pagination-item {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		text-decoration: none;
		border: 1px solid var(--border-primary);
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.pagination-item:hover {
		background: var(--bg-secondary);
		transform: translateY(-1px);
	}

	.pagination-item.active {
		background: var(--accent-blue);
		color: white;
		border-color: var(--accent-blue);
	}

	.pagination-item.prev,
	.pagination-item.next {
		font-weight: 600;
	}

	.pagination-info {
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-align: center;
	}

	/* ========================================
    EMPTY STATE
  ======================================== */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
	}

	.empty-content h3 {
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
	}

	.empty-content p {
		color: var(--text-secondary);
		font-size: 1rem;
		margin: 0 0 1rem 0;
	}

	.search-criteria-display {
		background: var(--bg-secondary);
		padding: 1rem;
		border-radius: 0.5rem;
		margin: 1rem 0;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.retry-suggestion {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0.5rem 0 0 0;
		font-style: italic;
	}

	.help-text {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0.5rem 0 0 0;
		opacity: 0.8;
	}

	.search-section {
		margin-top: 2rem;
		padding: 0 1rem;
	}

	/* ========================================
    MOBILE RESPONSIVE (≤768px)
  ======================================== */
	@media (max-width: 768px) {
		.stats-container {
			width: 95%;
			max-width: none;
			padding: 1rem;
		}

		.page-title {
			font-size: 1.75rem;
		}

		.page-subtitle {
			font-size: 1rem;
		}

		.header-icon {
			width: 48px;
			height: 48px;
		}

		.controls-section {
			width: 100%;
			margin: 0;
			padding: 1rem;
		}

		.sorting-controls {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.control-group {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.control-label {
			text-align: center;
			white-space: normal;
		}

		.control-select {
			width: 100%;
			min-width: unset;
			font-size: 16px; /* Prevent iOS zoom */
		}

		.sort-indicator {
			justify-content: center;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 0;
		}

		.stats-bar {
			gap: 0.5rem;
			margin: 1rem 0;
		}

		.stat-item {
			padding: 0.5rem;
			min-width: 70px;
			max-width: none;
			flex: 1;
		}

		.stat-number {
			font-size: 1rem;
		}

		.stat-label {
			font-size: 0.7rem;
		}

		.card-header {
			padding: 0.75rem;
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.team-info {
			text-align: center;
		}

		.team-name {
			font-size: 0.9rem;
		}

		.team-meta {
			justify-content: center;
			font-size: 0.65rem;
		}

		.stat-category {
			align-self: center;
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.875rem;
		}

		.card-body {
			padding: 0.75rem;
		}

		.stat-name {
			font-size: 0.8rem;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.card-footer {
			padding: 0.5rem 0.75rem;
		}

		.stat-details {
			font-size: 0.7rem;
		}

		.pagination-section {
			padding: 0;
		}

		.pagination {
			justify-content: center;
			gap: 0.25rem;
		}

		.pagination-item {
			padding: 0.375rem 0.5rem;
			font-size: 0.75rem;
		}

		.pagination-info {
			font-size: 0.75rem;
			padding: 0 1rem;
			text-align: center;
		}

		.empty-state {
			padding: 2rem 1rem;
		}

		.search-section {
			margin-top: 1.5rem;
			padding: 0;
		}
	}

	/* ========================================
    EXTRA SMALL MOBILE (≤480px)
  ======================================== */
	@media (max-width: 480px) {
		.stats-container {
			padding: 0.5rem;
		}

		.page-title {
			font-size: 1.5rem;
			line-height: 1.3;
		}

		.page-subtitle {
			font-size: 0.875rem;
			line-height: 1.4;
		}

		.controls-section {
			padding: 0.75rem;
		}

		.stat-card {
			border-radius: 0.75rem;
		}

		.card-header {
			padding: 0.5rem;
		}

		.card-body {
			padding: 0.5rem;
		}

		.team-name {
			font-size: 0.8rem;
		}

		.stat-value {
			font-size: 1.25rem;
		}

		.stat-item {
			padding: 0.375rem;
			min-width: 60px;
		}

		.stat-number {
			font-size: 0.875rem;
		}

		.stat-label {
			font-size: 0.65rem;
		}
	}

	/* ========================================
    TABLET (769px - 1024px)
  ======================================== */
	@media (min-width: 769px) and (max-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}

		.controls-section {
			max-width: 600px;
		}
	}

	/* ========================================
    LARGE DESKTOP (≥1025px)
  ======================================== */
	@media (min-width: 1025px) {
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.controls-section {
			max-width: 700px;
		}
	}

	/* ========================================
    UTILITY CLASSES
  ======================================== */
	.team-name,
	.page-title,
	.page-subtitle,
	.stat-name,
	.detail-value {
		overflow-wrap: break-word;
		word-break: break-word;
		hyphens: auto;
	}

	.wrapper,
	.stats-container,
	.stats-section,
	.stats-grid,
	.stat-card {
		max-width: 100%;
		overflow-x: hidden;
	}
</style>
