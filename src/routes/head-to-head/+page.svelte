<!-- src/routes/head-to-head/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { formatStartDate } from '$lib/utils/formatStartDate';
	import MatchupSelection from '$lib/components/MatchupSelection.svelte';
	import ExportButton from '$lib/components/ExportButton.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { goto } from '$app/navigation';
	import type { MatchupGame } from '$lib/types/api';
	import { convertMatchupGamesToExportFormat } from '$lib/utils/matchupExport';
	import '../../styles/main.css';

	export let data: {
		matchupData?: any;
		searchParams?: any;
		error?: string;
	};

	let pageError: Error | null = null;
	let isLoading = true;

	// Extract data with proper handling
	$: matchupData = data?.matchupData;
	$: searchParams = data?.searchParams || {};

	let divisions = ['All', 'FBS', 'FCS'];
	let selectedDivision: string = '';

	// Get years from search params with proper fallbacks
	$: minYear = searchParams?.minYear;
	$: maxYear = searchParams?.maxYear;
	$: team1 = searchParams?.team1 || matchupData?.team1;
	$: team2 = searchParams?.team2 || matchupData?.team2;
	// Set selectedDivision reactively to avoid SSR issues
	$: if (searchParams?.division) {
		selectedDivision = searchParams.division;
	}

	// Helper function to normalize team names for comparison
	function normalizeTeamName(teamName: string): string {
		return teamName?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
	}

	// Helper function to check if two team names match (with fuzzy matching)
	function teamsMatch(teamA: string, teamB: string): boolean {
		if (!teamA || !teamB) return false;

		const normalA = normalizeTeamName(teamA);
		const normalB = normalizeTeamName(teamB);

		// Exact match
		if (normalA === normalB) return true;

		// Check if one contains the other (for cases like "Alabama" vs "Alabama Crimson Tide")
		if (normalA.includes(normalB) || normalB.includes(normalA)) return true;

		return false;
	}

	// Centralized winner calculation function
	function getGameWinner(game: MatchupGame): {
		winner: string;
		margin: number;
		isDominant: boolean;
	} {
		const homeScore = game.homeScore || 0;
		const awayScore = game.awayScore || 0;
		const margin = Math.abs(homeScore - awayScore);

		let winner = 'Tie';
		if (homeScore > awayScore) winner = game.homeTeam;
		else if (awayScore > homeScore) winner = game.awayTeam;

		return {
			winner,
			margin,
			isDominant: margin >= 21 // 3+ touchdown margin
		};
	}

	// Filter games by year range if specified
	$: filteredGames = (() => {
		if (!matchupData?.games) return [];

		let games = matchupData.games;

		// Filter by year range if provided
		if (minYear || maxYear) {
			games = games.filter((game: MatchupGame) => {
				const gameYear = game.season;
				const minYearNum = minYear ? parseInt(minYear) : 0;
				const maxYearNum = maxYear ? parseInt(maxYear) : 9999;

				return gameYear >= minYearNum && gameYear <= maxYearNum;
			});
		}

		// Sort by most recent first
		return games.sort((a: MatchupGame, b: MatchupGame) => b.season - a.season);
	})();

	// USING CALCULATED WINNERS FOR CONSISTENCY
	$: totalGames = filteredGames.length;
	$: team1Wins = filteredGames.filter((game: MatchupGame) => {
		const result = getGameWinner(game);
		return teamsMatch(result.winner, team1);
	}).length;
	$: team2Wins = filteredGames.filter((game: MatchupGame) => {
		const result = getGameWinner(game);
		return teamsMatch(result.winner, team2);
	}).length;
	$: ties = filteredGames.filter((game: MatchupGame) => {
		const result = getGameWinner(game);
		return result.winner === 'Tie';
	}).length;

	// Years covered
	$: yearsRange = (() => {
		if (filteredGames.length === 0) return { start: 'Unknown', end: 'Unknown' };

		const years = filteredGames.map((game: MatchupGame) => game.season);
		const startYear = Math.min(...years);
		const endYear = Math.max(...years);

		return {
			start: startYear.toString(),
			end: startYear === endYear ? startYear.toString() : endYear.toString()
		};
	})();

	// Export data - convert MatchupGame format to standard Game format for export
	$: exportData = convertMatchupGamesToExportFormat(filteredGames);
	// Export filename
	$: exportFilename = (() => {
		const t1 = team1?.replace(/\s+/g, '-') || 'team1';
		const t2 = team2?.replace(/\s+/g, '-') || 'team2';
		let filename = `${t1}-vs-${t2}-matchup`;
		if (minYear && maxYear) {
			filename += `-${minYear}-${maxYear}`;
		} else if (minYear) {
			filename += `-${minYear}+`;
		} else if (maxYear) {
			filename += `-through-${maxYear}`;
		}
		return filename;
	})();

	// Handle navigation and errors
	function checkNavigation() {
		if (!data || !data.matchupData) {
			goto('/matchups');
		}
	}

	function handleRetry() {
		pageError = null;
		window.location.reload();
	}

	function getGameEra(year: number): string {
		if (year >= 2014) return '🏆 College Football Playoff Era';
		if (year >= 1998) return '🎯 BCS Era';
		if (year >= 1992) return '🏟️ Bowl Alliance Era';
		return '📺 Traditional Bowl Era';
	}

	onMount(() => {
		checkNavigation();
		// Set selectedDivision after mount to avoid SSR issues
		if (searchParams?.division) {
			selectedDivision = searchParams.division;
		}
		const timer = setTimeout(() => {
			isLoading = false;
		}, 300);

		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<title>Head-to-Head: {team1} vs {team2} - Fieldwing</title>
	<meta
		name="description"
		content="View historical head-to-head matchup results between {team1} and {team2}."
	/>
</svelte:head>

<ErrorBoundary bind:error={pageError} on:retry={handleRetry}>
	<div class="wrapper">
		{#if isLoading}
			<LoadingSpinner size="large" text="Loading matchup data..." fullScreen={true} />
		{:else}
			<div class="results-container" class:light={!$theme} class:dark={$theme}>
				<section class="results-section">
					{#if matchupData && filteredGames && filteredGames.length > 0}
						<!-- Header Section -->
						<div class="header-section">
							<div class="header-content">
								<img class="header-icon" src="/h2h.png" alt="Head to Head Matchups" />

								<h1 class="page-title">
									{team1} vs {team2}
								</h1>

								<h2 class="matchup-subtitle">
									{#if minYear && maxYear && minYear !== maxYear}
										📅 {minYear} - {maxYear} ({totalGames} games)
									{:else if minYear || maxYear}
										📅 {minYear || maxYear} ({totalGames} games)
									{:else}
										📅 {yearsRange.start} - {yearsRange.end} ({totalGames} games)
									{/if}
								</h2>

								<!-- Series Statistics -->
								<div class="series-stats">
									<div class="stat-card team1-card">
										<div class="stat-number">{team1Wins}</div>
										<div class="stat-label">{team1} Wins</div>
									</div>
									<div class="stat-card series-card">
										<div class="series-record">
											{team1Wins}-{team2Wins}{ties > 0 ? `-${ties}` : ''}
										</div>
										<div class="stat-label">Series Record</div>
										{#if ties > 0}
											<div class="ties-note">{ties} tie{ties !== 1 ? 's' : ''}</div>
										{/if}
									</div>
									<div class="stat-card team2-card">
										<div class="stat-number">{team2Wins}</div>
										<div class="stat-label">{team2} Wins</div>
									</div>
								</div>

								<!-- Export Button -->
								{#if totalGames > 0}
									<div class="export-section">
										<ExportButton
											data={exportData}
											type="games"
											variant="outline"
											size="medium"
											filename={exportFilename}
											showCount={true}
										/>
									</div>
								{/if}
							</div>
						</div>

						<!-- Games Grid -->
						<div class="games-grid">
							{#each filteredGames as game, index (game.season + '-' + game.week + '-' + index)}
								{@const gameResult = getGameWinner(game)}
								{@const isRecent = game.season >= new Date().getFullYear() - 5}

								<article
									class="game-card"
									class:light={!$theme}
									class:dark={$theme}
									class:recent={isRecent}
								>
									<!-- Game Header -->
									<div class="game-header">
										<div class="game-meta">
											<span class="season-badge">{game.season}</span>
											{#if game.week}
												<span class="week-badge">Week {game.week}</span>
											{/if}
											<span class="season-type">{game.seasonType || 'Regular'}</span>
										</div>

										<div class="game-era">
											{getGameEra(game.season)}
										</div>
									</div>

									<!-- Matchup Score -->
									<div class="matchup-display">
										<div class="team-section away">
											<div class="team-info">
												<h3 class="team-name" class:winner={gameResult.winner === game.awayTeam}>
													{game.awayTeam}
												</h3>
												<span class="location-badge">Away</span>
											</div>
											<div class="score" class:winner={gameResult.winner === game.awayTeam}>
												{game.awayScore}
											</div>
										</div>

										<div class="vs-section">
											<span class="vs-text">vs</span>
											{#if gameResult.winner !== 'Tie'}
												<div class="game-summary">
													<span class="winner-text">🏆 {gameResult.winner}</span>
													{#if gameResult.margin > 0}
														<span class="margin" class:dominant={gameResult.isDominant}>
															by {gameResult.margin}
															{#if gameResult.isDominant}🔥{/if}
														</span>
													{/if}
												</div>
											{:else}
												<div class="game-summary">
													<span class="tie-text">🤝 Tie Game</span>
												</div>
											{/if}
										</div>

										<div class="team-section home">
											<div class="team-info">
												<h3 class="team-name" class:winner={gameResult.winner === game.homeTeam}>
													{game.homeTeam}
												</h3>
												<span class="location-badge">Home</span>
											</div>
											<div class="score" class:winner={gameResult.winner === game.homeTeam}>
												{game.homeScore}
											</div>
										</div>
									</div>

									<!-- Game Details -->
									<div class="game-details">
										<div class="detail-row">
											<span class="detail-label">📅</span>
											<span class="detail-value">
												{formatStartDate(game.date)}
											</span>
										</div>
										<div class="detail-row">
											<span class="detail-label">🏟️</span>
											<span class="detail-value">
												{game.venue || 'Unknown Venue'}
												{#if game.neutralSite}
													<span class="neutral-badge">Neutral Site</span>
												{/if}
											</span>
										</div>

										{#if gameResult.isDominant}
											<div class="detail-row highlight">
												<span class="detail-label">💥</span>
												<span class="detail-value"
													>Dominant Victory ({gameResult.margin}+ point margin)</span
												>
											</div>
										{/if}
									</div>
								</article>
							{/each}
						</div>
					{:else}
						<!-- No Data State -->
						<div class="no-data-section">
							<div class="no-data-content">
								<div class="no-data-icon">🏈</div>
								<h2 class="no-data-title">No Matchup Data Found</h2>
								<p class="no-data-message">
									{#if team1 && team2}
										No head-to-head games found between {team1} and {team2}
										{#if minYear || maxYear}
											for the specified time period
										{/if}.
									{:else}
										Sorry, it seems like there is no head-to-head matchup data available for those
										two teams.
									{/if}
								</p>
								<p class="no-data-suggestion">
									Try adjusting your search criteria or select different teams.
								</p>
							</div>
						</div>

						<!-- Team Selection -->
						<div class="selection-section">
							<MatchupSelection {divisions} {selectedDivision} />
						</div>
					{/if}
				</section>
			</div>
		{/if}
	</div>
</ErrorBoundary>

<style>
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

	/* Layout */
	.wrapper {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
	}

	.results-container {
		width: 100%;
		margin: 0 auto;
		padding: 1rem;
	}

	.results-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Header Section */
	.header-section {
		text-align: center;
		padding: 2rem 0;
	}

	.header-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.header-icon {
		width: clamp(48px, 8vw, 80px);
		height: clamp(48px, 8vw, 80px);
		margin-bottom: 1.5rem;
		opacity: 0.9;
	}

	.page-title {
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		line-height: 1.2;
		word-wrap: break-word;
		hyphens: auto;
	}

	.matchup-subtitle {
		font-size: clamp(1.125rem, 3vw, 1.5rem);
		font-weight: 600;
		color: var(--text-accent);
		margin: 0 0 2rem 0;
		line-height: 1.3;
	}

	/* Series Statistics */
	.series-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.stat-card {
		background: var(--bg-primary);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		border: 1px solid var(--border-primary);
		text-align: center;
		transition: transform 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.team1-card {
		border-top: 4px solid var(--accent-blue);
	}

	.team2-card {
		border-top: 4px solid var(--accent-orange);
	}

	.series-card {
		border-top: 4px solid var(--accent-purple);
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--text-accent);
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.series-record {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-accent);
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ties-note {
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
		opacity: 0.8;
	}

	/* Export Section */
	.export-section {
		margin: 2rem 0;
		display: flex;
		justify-content: center;
	}

	/* Games Grid */
	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.game-card {
		background: var(--bg-primary);
		border-radius: 1rem;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1px solid var(--border-primary);
	}

	.game-card:hover {
		transform: translateY(-4px);
		box-shadow:
			var(--shadow-lg),
			0 20px 25px -5px rgb(0 0 0 / 0.1);
	}

	.game-card.recent {
		border-left: 4px solid var(--accent-green);
	}

	/* Game Header */
	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-primary);
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.game-meta {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.season-badge {
		background: var(--accent-purple);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.week-badge {
		background: var(--accent-blue);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.season-type {
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.game-era {
		font-size: 0.75rem;
		color: var(--text-secondary);
		opacity: 0.8;
		text-align: right;
	}

	/* Matchup Display */
	.matchup-display {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1.5rem;
		align-items: center;
		padding: 2rem;
	}

	.team-section {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.team-section.away {
		justify-content: flex-end;
		text-align: right;
	}

	.team-section.home {
		justify-content: flex-start;
		text-align: left;
	}

	.team-info {
		flex: 1;
	}

	.team-name {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		line-height: 1.2;
		word-wrap: break-word;
		hyphens: auto;
	}

	.team-name.winner {
		color: var(--accent-green);
	}

	.location-badge {
		background: var(--bg-tertiary);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.score {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--text-accent);
		min-width: 80px;
		text-align: center;
	}

	.score.winner {
		color: var(--accent-green);
	}

	.vs-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 0 1rem;
	}

	.vs-text {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.game-summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.winner-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent-green);
	}

	.tie-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent-orange);
	}

	.margin {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.margin.dominant {
		color: var(--accent-red);
		font-weight: 600;
	}

	/* Game Details */
	.game-details {
		padding: 1.5rem;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-primary);
	}

	.detail-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border-primary);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-row.highlight {
		background: rgba(239, 68, 68, 0.1);
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin: 0.5rem 0;
		border: 1px solid var(--accent-red);
	}

	.detail-label {
		font-size: 1rem;
		width: 1.5rem;
		text-align: center;
		flex-shrink: 0;
	}

	.detail-value {
		font-size: 0.875rem;
		color: var(--text-secondary);
		flex: 1;
		line-height: 1.4;
	}

	.neutral-badge {
		background: var(--accent-orange);
		color: white;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		margin-left: 0.5rem;
	}

	/* No Data Section */
	.no-data-section {
		text-align: center;
		padding: 4rem 2rem;
	}

	.no-data-content {
		max-width: 600px;
		margin: 0 auto;
	}

	.no-data-icon {
		font-size: 4rem;
		margin-bottom: 2rem;
		opacity: 0.6;
	}

	.no-data-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.no-data-message {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.no-data-suggestion {
		font-size: 1rem;
		color: var(--text-secondary);
		opacity: 0.8;
		margin: 0;
	}

	.selection-section {
		margin-top: 3rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.results-container {
			padding: 0.5rem;
		}

		.header-section {
			padding: 1rem 0;
		}

		.series-stats {
			grid-template-columns: 1fr;
			gap: 1rem;
			margin: 1.5rem 0;
		}

		.stat-card {
			padding: 1rem;
		}

		.stat-number,
		.series-record {
			font-size: 2rem;
		}

		.games-grid {
			margin-top: 1rem;
			gap: 1rem;
		}

		.matchup-display {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1.5rem;
		}

		.team-section {
			justify-content: center;
			text-align: center;
		}

		.vs-section {
			order: -1;
			padding: 0;
		}

		.game-header {
			padding: 1rem;
			flex-direction: column;
			gap: 0.75rem;
		}

		.game-era {
			text-align: center;
		}

		.game-details {
			padding: 1rem;
		}
	}

	@media (max-width: 480px) {
		.header-icon {
			width: 40px;
			height: 40px;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.matchup-subtitle {
			font-size: 1rem;
		}

		.score {
			font-size: 2rem;
		}

		.team-name {
			font-size: 1rem;
		}

		.stat-number,
		.series-record {
			font-size: 1.5rem;
		}
	}

	@media (min-width: 1025px) {
		.results-container {
			max-width: 1400px;
			padding: 2rem 1rem;
		}

		.games-grid {
			grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		}
	}
</style>
