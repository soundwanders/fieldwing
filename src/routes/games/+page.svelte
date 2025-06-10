<!-- src/routes/games/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { formatStartDate } from '$lib/utils/formatStartDate';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  import ResubmitTeams from '$lib/components/ResubmitTeams.svelte';
  import '../../styles/main.css';

  // Type the data prop properly
  export let data: {
    gameResults?: Array<{
      team: string;
      data: any[];
      error: string | null;
    }>;
    teams?: string[];
    year?: string;
    week?: string;
    error?: string;
  };

  let isLoading = true;
  let pageError: Error | null = null;

  // Extract data with proper error handling
  $: gameResults = data?.gameResults || [];
  $: teams = data?.teams || [];
  $: year = data?.year || new Date().getFullYear().toString();
  $: week = data?.week || '1';

  // Create formatted teams display
  $: formattedTeams = Array.isArray(teams) ? teams.join(', ') : 'No Teams Selected';
  $: teamTitleList = formattedTeams;

  // Data availability checks
  $: hasSuccessfulApiCalls = gameResults.some(result => result.error === null);
  $: hasGamesData = gameResults.some(result => result.error === null && result.data.length > 0);
  $: hasAnyResults = gameResults.length > 0;
  $: hasApiErrors = gameResults.some(result => result.error !== null);

  // Get the first successful game for header info
  $: firstGame = (() => {
    const result = gameResults.find(result => result.error === null && result.data.length > 0);
    if (!result) return null;
    
    const game = result.data[0];
    if (!game) return null;
    
    // Normalize the property names for consistent access
    return {
      ...game,
      home_team: game.homeTeam || game.home_team,
      away_team: game.awayTeam || game.away_team,
      season_type: game.seasonType || game.season_type,
      start_date: game.startDate || game.start_date,
      home_points: game.homePoints ?? game.home_points,
      away_points: game.awayPoints ?? game.away_points,
      conference_game: game.conferenceGame ?? game.conference_game
    };
  })();

  // Statistics
  $: totalGames = gameResults.reduce((sum, result) => 
    result.error === null ? sum + result.data.length : sum, 0);
  $: successfulTeams = gameResults.filter(r => r.error === null).length;
  $: failedTeams = gameResults.filter(r => r.error !== null).length;

  // Helper functions
  function capitalizeFirstChar(str: string | undefined | null): string {
    if (!str || typeof str !== 'string') {
      return 'Regular';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function handleRetry() {
    pageError = null;
    window.location.reload();
  }

  function checkForDataErrors() {
    if (data?.error) {
      pageError = new Error(data.error);
      return;
    }

    if (teams.length > 0 && gameResults.length === 0) {
      pageError = new Error('No game data was returned for the selected teams');
      return;
    }

    if (gameResults.length > 0 && !hasSuccessfulApiCalls) {
      const errors = gameResults
        .filter(r => r.error)
        .map(r => r.error)
        .filter(e => e)
        .join('; ');
      pageError = new Error(`Failed to load games for all teams: ${errors || 'Unknown API error'}`);
      return;
    }

    pageError = null;
  }

  function getGameWinner(game: any): string | null {
    const homePoints = game.homePoints ?? game.home_points ?? 0;
    const awayPoints = game.awayPoints ?? game.away_points ?? 0;
    const homeTeam = game.homeTeam || game.home_team;
    const awayTeam = game.awayTeam || game.away_team;
    
    if (!game.completed) return null;
    if (homePoints > awayPoints) return homeTeam;
    if (awayPoints > homePoints) return awayTeam;
    return 'Tie';
  }

  function getGameMargin(game: any): number {
    const homePoints = game.homePoints ?? game.home_points ?? 0;
    const awayPoints = game.awayPoints ?? game.away_points ?? 0;
    return Math.abs(homePoints - awayPoints);
  }

  onMount(() => {
    checkForDataErrors();

    const timer = setTimeout(() => {
      isLoading = false;
    }, 300);

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>Game Results - Fieldwing</title>
  <meta name="description" content="View college football game results and scores for your favorite teams." />
</svelte:head>

<ErrorBoundary bind:error={pageError} on:retry={handleRetry}>
  <div class="wrapper">
    {#if isLoading}
      <LoadingSpinner 
        size="large" 
        text="Loading game results..." 
        fullScreen={true}
      />
    {:else}
      <div class="results-container" class:light={!$theme} class:dark={$theme}>
        <section class="results-section">
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-content">
              <img class="header-icon" src="/gameresults.png" alt="Game Results" aria-hidden="true" />
              
              {#if hasGamesData && firstGame}
                <h1 class="page-title">
                  Week {firstGame.week}, {firstGame.season} Results
                </h1>
                <h2 class="team-subtitle">
                  {teamTitleList}
                </h2>
              {:else if hasSuccessfulApiCalls}
                <h1 class="page-title">
                  Week {week}, {year} Results
                </h1>
                <h2 class="team-subtitle">
                  {teamTitleList}
                </h2>
                {#if totalGames === 0}
                  <div class="info-banner">
                    <div class="info-content">
                      <p class="info-primary">✅ Successfully connected to data source</p>
                      <p class="info-secondary">📅 No games scheduled for these teams in Week {week} of {year}</p>
                      {#if parseInt(year) > new Date().getFullYear()}
                        <p class="info-secondary">⏭️ Future seasons may not have scheduled games yet</p>
                      {/if}
                    </div>
                  </div>
                {/if}
              {:else if teams.length > 0}
                <h1 class="page-title">
                  Week {week}, {year} Results
                </h1>
                <h2 class="team-subtitle">
                  {teamTitleList}
                </h2>
                <div class="error-banner">
                  <p>❌ Failed to load game data</p>
                </div>
              {:else}
                <h1 class="page-title">Game Results</h1>
                <p class="no-selection">Please select teams to view their game results</p>
              {/if}
              
              <!-- Statistics Summary -->
              {#if hasAnyResults && totalGames > 0}
                <div class="stats-bar">
                  <div class="stat-item">
                    <span class="stat-number">{totalGames}</span>
                    <span class="stat-label">Game{totalGames !== 1 ? 's' : ''} Found</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{successfulTeams}</span>
                    <span class="stat-label">Team{successfulTeams !== 1 ? 's' : ''} Loaded</span>
                  </div>
                  {#if failedTeams > 0}
                    <div class="stat-item warning">
                      <span class="stat-number">{failedTeams}</span>
                      <span class="stat-label">Failed</span>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <!-- Games Display -->
          {#if hasAnyResults}
            <div class="games-grid">
              {#each gameResults as { team, data, error } (team)}
                {#if error}
                  <div class="error-card">
                    <div class="error-header">
                      <h3>❌ Error loading {team}</h3>
                    </div>
                    <p class="error-message">{error}</p>
                  </div>
                {:else if data && data.length > 0}
                  {#each data as gameResult (gameResult.id || `${gameResult.homeTeam || gameResult.home_team}-${gameResult.awayTeam || gameResult.away_team}-${gameResult.week}`)}
                    {#if gameResult && (gameResult.homeTeam || gameResult.home_team || gameResult.awayTeam || gameResult.away_team)}
                      <article class="game-card" class:light={!$theme} class:dark={$theme}>
                        <!-- Game Header -->
                        <div class="game-header">
                          <div class="game-meta">
                            <span class="week-badge">Week {gameResult.week || 'N/A'}</span>
                            <span class="season-type">{capitalizeFirstChar(gameResult.seasonType || gameResult.season_type)}</span>
                          </div>
                          {#if gameResult.completed}
                            <div class="status-badge final">FINAL</div>
                          {:else}
                            <div class="status-badge scheduled">SCHEDULED</div>
                          {/if}
                        </div>

                        <!-- Matchup - Mobile-First Design -->
                        <div class="matchup">
                          <!-- Mobile Layout: Completely Vertical -->
                          <div class="mobile-matchup">
                            <!-- Away Team -->
                            <div class="mobile-team away-team">
                              <div class="mobile-team-header">
                                <h3 class="mobile-team-name">{gameResult.awayTeam || gameResult.away_team || 'Unknown'}</h3>
                                <div class="mobile-score away-score">
                                  {gameResult.awayPoints ?? gameResult.away_points ?? 0}
                                </div>
                              </div>
                              <div class="mobile-team-meta">
                                <span class="mobile-location">Away</span>
                                {#if gameResult.awayConference}
                                  <span class="mobile-conference">{gameResult.awayConference}</span>
                                {/if}
                              </div>
                            </div>

                            <!-- VS Section -->
                            <div class="mobile-vs-section">
                              <span class="mobile-vs-text">VS</span>
                              {#if gameResult.completed && getGameWinner(gameResult)}
                                {@const winner = getGameWinner(gameResult)}
                                {@const margin = getGameMargin(gameResult)}
                                <div class="mobile-game-result">
                                  {#if winner === 'Tie'}
                                    <span class="mobile-result-text">Tie Game</span>
                                  {:else}
                                    <span class="mobile-result-text">{winner} wins</span>
                                    {#if margin > 0}
                                      <span class="mobile-margin">by {margin}</span>
                                    {/if}
                                  {/if}
                                </div>
                              {/if}
                            </div>

                            <!-- Home Team -->
                            <div class="mobile-team home-team">
                              <div class="mobile-team-header">
                                <h3 class="mobile-team-name">{gameResult.homeTeam || gameResult.home_team || 'Unknown'}</h3>
                                <div class="mobile-score home-score">
                                  {gameResult.homePoints ?? gameResult.home_points ?? 0}
                                </div>
                              </div>
                              <div class="mobile-team-meta">
                                <span class="mobile-location">Home</span>
                                {#if gameResult.homeConference}
                                  <span class="mobile-conference">{gameResult.homeConference}</span>
                                {/if}
                              </div>
                            </div>
                          </div>

                          <!-- Desktop Layout: Keep Original -->
                          <div class="desktop-matchup">
                            <div class="team-section away">
                              <div class="team-info">
                                <h3 class="team-name">{gameResult.awayTeam || gameResult.away_team || 'Unknown'}</h3>
                                <div class="team-meta">
                                  {#if gameResult.awayConference}
                                    <span class="conference">{gameResult.awayConference}</span>
                                  {/if}
                                  <span class="location">Away</span>
                                </div>
                              </div>
                              <div class="score">
                                {gameResult.awayPoints ?? gameResult.away_points ?? 0}
                              </div>
                            </div>

                            <div class="vs-section">
                              <span class="vs-text">vs</span>
                              {#if gameResult.completed && getGameWinner(gameResult)}
                                {@const winner = getGameWinner(gameResult)}
                                {@const margin = getGameMargin(gameResult)}
                                <div class="game-summary">
                                  {#if winner === 'Tie'}
                                    <span class="result-text">Tie Game</span>
                                  {:else}
                                    <span class="result-text">{winner} wins</span>
                                    {#if margin > 0}
                                      <span class="margin">by {margin}</span>
                                    {/if}
                                  {/if}
                                </div>
                              {/if}
                            </div>

                            <div class="team-section home">
                              <div class="team-info">
                                <h3 class="team-name">{gameResult.homeTeam || gameResult.home_team || 'Unknown'}</h3>
                                <div class="team-meta">
                                  {#if gameResult.homeConference}
                                    <span class="conference">{gameResult.homeConference}</span>
                                  {/if}
                                  <span class="location">Home</span>
                                </div>
                              </div>
                              <div class="score">
                                {gameResult.homePoints ?? gameResult.home_points ?? 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Game Details -->
                        <div class="game-details">
                          <div class="detail-row">
                            <span class="detail-label">📅</span>
                            <span class="detail-value">
                              {gameResult.startDate || gameResult.start_date ? 
                                formatStartDate(gameResult.startDate || gameResult.start_date) : 
                                'Date TBD'}
                            </span>
                          </div>
                          
                          <div class="detail-row">
                            <span class="detail-label">🏟️</span>
                            <span class="detail-value">{gameResult.venue || 'Venue TBD'}</span>
                          </div>

                          {#if gameResult.attendance}
                            <div class="detail-row">
                              <span class="detail-label">👥</span>
                              <span class="detail-value">{gameResult.attendance.toLocaleString()} attendance</span>
                            </div>
                          {/if}

                          {#if gameResult.notes}
                            <div class="detail-row">
                              <span class="detail-label">📝</span>
                              <span class="detail-value">{gameResult.notes}</span>
                            </div>
                          {/if}

                          <div class="detail-row">
                            <span class="detail-label">🏆</span>
                            <span class="detail-value">
                              {(gameResult.conferenceGame ?? gameResult.conference_game) ? 'Conference Game' : 'Non-Conference Game'}
                            </span>
                          </div>
                        </div>
                      </article>
                    {/if}
                  {/each}
                {:else}
                  <div class="no-games-card">
                    <div class="no-games-content">
                      <h3>📅 {team}</h3>
                      <p>No games found for Week {week} of {year}</p>
                      <small>This team may have had a bye week or the game data is unavailable.</small>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <div class="empty-state">
              <div class="empty-content">
                <h3>🏈 No Game Data Available</h3>
                <p>Please select teams from the game results page to view their games.</p>
              </div>
            </div>
          {/if}
        </section>
      </div>

      <!-- Team Search Section -->
      <section class="search-section">
        <ResubmitTeams />
      </section>
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
}

/* ========================================
   LAYOUT & STRUCTURE
======================================== */
.wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.results-container {
  width: min(33vw, 1000px);
  margin: 0 auto;
  padding: 2rem 1rem;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ========================================
   HEADER SECTION
======================================== */
.header-section {
  text-align: center;
  padding: 2rem 0;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
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
}

.team-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-accent);
  margin: 0 0 2rem 0;
  line-height: 1.3;
}

.no-selection {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 1rem 0;
}

/* ========================================
   BANNERS & NOTIFICATIONS
======================================== */
.info-banner {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: var(--shadow-md);
}

.info-content {
  color: white;
  text-align: center;
}

.info-primary {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.info-secondary {
  margin: 0.25rem 0;
  opacity: 0.9;
}

.error-banner {
  background: var(--accent-red);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  box-shadow: var(--shadow-md);
}

/* ========================================
   STATISTICS BAR
======================================== */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  min-width: 100px;
}

.stat-item.warning {
  background: var(--accent-orange);
  color: white;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-accent);
}

.stat-item.warning .stat-number {
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.stat-item.warning .stat-label {
  color: white;
  opacity: 0.9;
}

/* ========================================
   GAMES GRID & GAME CARDS
======================================== */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
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
  box-shadow: var(--shadow-lg), 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* ========================================
   GAME HEADER
======================================== */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.game-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.final {
  background: var(--accent-green);
  color: white;
}

.status-badge.scheduled {
  background: var(--accent-orange);
  color: white;
}

/* ========================================
   MOBILE MATCHUP LAYOUT (DEFAULT)
======================================== */
.matchup {
  padding: 1rem;
}

.mobile-matchup {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.desktop-matchup {
  display: none;
}

.mobile-team {
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
}

.mobile-team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.mobile-team-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
}

.mobile-score {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-accent);
  min-width: 50px;
  text-align: right;
  flex-shrink: 0;
}

.mobile-team-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.mobile-location {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
}

.mobile-conference {
  background: var(--accent-blue);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
}

.mobile-vs-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.5rem 0;
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
}

.mobile-vs-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.mobile-game-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.mobile-result-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-accent);
  text-align: center;
}

.mobile-margin {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

/* ========================================
   GAME DETAILS
======================================== */
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

.detail-label {
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex: 1;
}

/* ========================================
   ERROR & EMPTY STATES
======================================== */
.error-card,
.no-games-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.error-card {
  border-color: var(--accent-red);
}

.error-header {
  background: var(--accent-red);
  color: white;
  padding: 1rem 1.5rem;
}

.error-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.error-message {
  padding: 1.5rem;
  color: var(--text-secondary);
  margin: 0;
}

.no-games-content {
  padding: 2rem 1.5rem;
  text-align: center;
}

.no-games-content h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.no-games-content p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.no-games-content small {
  color: var(--text-secondary);
  opacity: 0.8;
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.empty-content p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0;
}

.search-section {
  margin-top: 3rem;
}

/* ========================================
   EXTRA SMALL PHONES (≤360px)
======================================== */

@media (max-width: 360px) {
  .matchup {
    padding: 0.75rem;
  }

  .mobile-team {
    padding: 0.5rem;
  }

  .mobile-team-name {
    font-size: 0.8rem;
  }

  .mobile-score {
    font-size: 1.25rem;
    min-width: 45px;
  }

  .mobile-team-meta {
    font-size: 0.65rem;
  }

  .mobile-vs-text {
    font-size: 0.75rem;
  }

  .mobile-result-text {
    font-size: 0.7rem;
  }

  .mobile-margin {
    font-size: 0.6rem;
  }
}

/* ========================================
   MOBILE PHONES (≤768px)
======================================== */
@media (max-width: 768px) {
  .results-container {
    width: 100%;
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .team-subtitle {
    font-size: 1.125rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .game-card {
    border-radius: 0.75rem;
  }

  .matchup {
    gap: 0.75rem;
  }

  .game-details {
    padding: 1rem;
  }

  .detail-row {
    padding: 0.375rem 0;
  }

  .mobile-matchup {
    display: none;
  }

  .desktop-matchup {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: center;
  }

  .matchup {
    padding: 2rem 1.5rem;
  }
}

/* ========================================
   TABLET & DESKTOP (≥769px)
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
  }

  .wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  }

  .results-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .results-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Header Styles */
  .header-section {
    text-align: center;
    padding: 2rem 0;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
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
  }

  .team-subtitle {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-accent);
    margin: 0 0 2rem 0;
    line-height: 1.3;
  }

  .no-selection {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin: 1rem 0;
  }

  /* Info/Error Banners */
  .info-banner {
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: var(--shadow-md);
  }

  .info-content {
    color: white;
    text-align: center;
  }

  .info-primary {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .info-secondary {
    margin: 0.25rem 0;
    opacity: 0.9;
  }

  .error-banner {
    background: var(--accent-red);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    box-shadow: var(--shadow-md);
  }

  /* Statistics Bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin: 1.5rem 0;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: var(--bg-primary);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-sm);
    min-width: 100px;
  }

  .stat-item.warning {
    background: var(--accent-orange);
    color: white;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-accent);
  }

  .stat-item.warning .stat-number {
    color: white;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .stat-item.warning .stat-label {
    color: white;
    opacity: 0.9;
  }

  /* Games Grid */
  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  /* Game Card */
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
    box-shadow: var(--shadow-lg), 0 20px 25px -5px rgb(0 0 0 / 0.1);
  }

  /* Game Header */
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
  }

  .game-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
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

  .status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.final {
    background: var(--accent-green);
    color: white;
  }

  .status-badge.scheduled {
    background: var(--accent-orange);
    color: white;
  }

  /* Matchup */
  .matchup {
    padding: 2rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: center;
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
    font-size: 1.875rem;
    word-wrap: break-word;
    hyphens: auto;
  }

  .team-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .team-section.away .team-meta {
    justify-content: flex-end;
  }

  .conference {
    background: var(--bg-tertiary);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }

  .location {
    font-weight: 500;
    opacity: 0.8;
  }

  .score {
    font-size: 2.875rem;
    font-weight: 800;
    color: var(--text-accent);
    min-width: 80px;
    text-align: center;
  }

  .vs-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1rem;
  }

  .vs-text {
    font-size: 1.125rem;
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

  .result-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-accent);
  }

  .margin {
    font-size: 0.75rem;
    color: var(--text-secondary);
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

  .detail-label {
    font-size: 1rem;
    width: 1.5rem;
    text-align: center;
  }

  .detail-value {
    font-size: 0.875rem;
    color: var(--text-secondary);
    flex: 1;
  }

  /* Error/Empty States */
  .error-card,
  .no-games-card {
    background: var(--bg-primary);
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid var(--border-primary);
  }

  .error-card {
    border-color: var(--accent-red);
  }

  .error-header {
    background: var(--accent-red);
    color: white;
    padding: 1rem 1.5rem;
  }

  .error-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .error-message {
    padding: 1.5rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .no-games-content {
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .no-games-content h3 {
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
  }

  .no-games-content p {
    color: var(--text-secondary);
    margin: 0 0 0.5rem 0;
  }

  .no-games-content small {
    color: var(--text-secondary);
    opacity: 0.8;
    font-size: 0.75rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-content h3 {
    color: var(--text-primary);
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .empty-content p {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0;
  }

  .search-section {
    margin-top: 3rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .results-container {
      padding: 1rem 0.5rem;
    }

    .page-title {
      font-size: 1.75rem;
    }

    .team-subtitle {
      font-size: 1.125rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .game-card {
      border-radius: 0.75rem;
    }

    .matchup {
      padding: 1.5rem 1rem;
      gap: 0.75rem;
    }

    .score {
      font-size: 1.75rem;
      margin: 0.5rem 0;
    }

    .vs-text {
      font-size: 1rem;
    }

    .game-details {
      padding: 1rem;
    }

    .detail-row {
      padding: 0.375rem 0;
    }
  }
</style>