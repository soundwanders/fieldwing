<!-- MatchupSelection.svelte -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { selectedMatchupTeams } from '$lib/stores/store';
	import {
		teamDataStore,
		ensureTeamsLoaded,
		isTeamDataLoaded,
		isTeamDataLoading
	} from '$lib/stores/teamData';
	import { theme } from '$lib/stores/theme';
	import { getCurrentYear } from '$lib/utils/getCurrentYear';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

	export let divisions: string[];
	export let selectedDivision: string;

	let selectedTeamsArray = $selectedMatchupTeams;
	let teams: string[] = [];
	let minYear: string = '';
	let maxYear: string = '';
	let componentError: Error | null = null;
	let searchQuery: string = '';
	let filteredTeams: string[] = [];

	// Current year for validation
	const currentYear = getCurrentYear();
	const yearString = getCurrentYear().toString();

	// Store unsubscribers for cleanup
	let unsubscribers: (() => void)[] = [];

	// Statistics for display
	$: teamStats = {
		total: teams.length,
		selected: selectedTeamsArray.length,
		showing: filteredTeams.length
	};

	// Filter teams based on search query
	$: filteredTeams = searchQuery.trim()
		? teams
				.filter((team) => team.toLowerCase().includes(searchQuery.toLowerCase().trim()))
				.slice(0, 50) // Limit for performance
		: teams;

	// Form validation
	$: isValidForm =
		selectedTeamsArray.length === 2 && selectedTeamsArray[0] && selectedTeamsArray[1];
	$: isValidYearRange = (() => {
		if (!minYear && !maxYear) return true;
		if (minYear && !maxYear) return true;
		if (!minYear && maxYear) return true;

		const min = parseInt(minYear);
		const max = parseInt(maxYear);
		return !isNaN(min) && !isNaN(max) && min <= max;
	})();

	async function loadTeams() {
		try {
			// Ensure team data is loaded
			await ensureTeamsLoaded();

			// Get teams for selected division
			teams = teamDataStore.getTeamsByDivision(selectedDivision);

			console.log(`📋 Loaded ${teams.length} teams for division: ${selectedDivision}`);
		} catch (err) {
			console.error('Failed to load teams:', err);
			componentError = err instanceof Error ? err : new Error('Failed to load teams');
		}
	}

	// Toggle selection / deselection of teams (max 2 teams)
	const toggleSelection = (event: Event, team: string) => {
		event.preventDefault();

		selectedMatchupTeams.update((teams) => {
			if (teams.includes(team)) {
				// Remove team
				return teams.filter((t) => t !== team);
			} else {
				// Add team (max 2)
				if (teams.length < 2) {
					return [...teams, team];
				} else {
					// Replace the first team if already 2 selected
					return [teams[1], team];
				}
			}
		});
	};

	// Clear all selected teams
	const clearAllTeams = () => {
		selectedMatchupTeams.set([]);
	};

	// Swap team positions
	const swapTeams = () => {
		if (selectedTeamsArray.length === 2) {
			selectedMatchupTeams.set([selectedTeamsArray[1], selectedTeamsArray[0]]);
		}
	};

	function handleRetry() {
		componentError = null;
		teamDataStore.reset();
		loadTeams();
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
	}

	function validateData() {
		if (!selectedTeamsArray[0] || !selectedTeamsArray[1]) {
			return 'Please select both teams.';
		}

		if (selectedTeamsArray[0] === selectedTeamsArray[1]) {
			return 'Please select two different teams.';
		}

		if (minYear && maxYear && parseInt(minYear) > parseInt(maxYear)) {
			return 'Min year should be less than or equal to max year.';
		}

		return null;
	}

	function getHeadToHeadURL() {
		const validationError = validateData();
		if (validationError) {
			return '#';
		}

		const params = new URLSearchParams();
		params.set('team1', selectedTeamsArray[0]);
		params.set('team2', selectedTeamsArray[1]);
		params.set('division', selectedDivision);

		if (minYear) params.set('minYear', minYear);
		if (maxYear) params.set('maxYear', maxYear);

		return `/head-to-head?${params.toString()}`;
	}

	onMount(() => {
		// Subscribe to stores with cleanup tracking
		const selectedTeamsUnsub = selectedMatchupTeams.subscribe((value) => {
			selectedTeamsArray = value;
		});

		unsubscribers.push(selectedTeamsUnsub);

		// Load teams on mount
		if (selectedDivision) {
			loadTeams();
		}
	});

	onDestroy(() => {
		// Clean up all subscriptions
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers = [];
	});

	// Reactive statement optimization - only update when selectedMatchupTeams changes
	$: selectedTeamsArray = $selectedMatchupTeams;
</script>

<ErrorBoundary bind:error={componentError} on:retry={handleRetry}>
	<div class="matchup-select-wrapper" class:light={!$theme} class:dark={$theme}>
		<!-- Hero Section -->
		<div class="hero-section">
			<div class="hero-content">
				<div class="hero-icon-wrapper">
					<img class="hero-icon" src="/matchup.png" alt="Head to Head Matchups" />
					<h1 class="hero-title">Head-to-Head Matchups</h1>
				</div>
				<p class="hero-subtitle">Compare two teams and explore their historical rivalry</p>
			</div>
		</div>

		<!-- Main Selection Interface -->
		<div class="selection-interface">
			<!-- Left Panel: Team Selection -->
			<div class="selection-panel">
				<div class="panel-card">
					<!-- Panel Header -->
					<div class="panel-header">
						<h2 class="panel-title">
							⚔️ Team Selection
							{#if teamStats.showing > 0}
								<span class="panel-count">({teamStats.showing} teams)</span>
							{/if}
						</h2>
						<p class="panel-subtitle">
							Select exactly two teams to compare their head-to-head record
						</p>
					</div>

					<!-- Controls Section -->
					<div class="controls-section">
						<!-- Division Selector -->
						<div class="control-group">
							<label for="division-select" class="control-label"> 🏟️ Division </label>
							<select
								class="control-select"
								id="division-select"
								bind:value={selectedDivision}
								on:change={loadTeams}
								disabled={$isTeamDataLoading}
							>
								<option value="" disabled>Select Division...</option>
								{#each divisions as division}
									<option value={division}>{division}</option>
								{/each}
							</select>
						</div>

						<!-- Year Range Controls -->
						<div class="control-row">
							<div class="control-group">
								<label for="min-year" class="control-label"> 📅 Min Year </label>
								<input
									type="number"
									class="control-input"
									id="min-year"
									bind:value={minYear}
									min={1900}
									max={currentYear}
									placeholder="1900"
								/>
							</div>

							<div class="control-group">
								<label for="max-year" class="control-label"> 📅 Max Year </label>
								<input
									type="number"
									class="control-input"
									id="max-year"
									bind:value={maxYear}
									min={1900}
									max={currentYear}
									placeholder={yearString}
								/>
							</div>
						</div>

						<!-- Search Input -->
						{#if teams.length > 0}
							<div class="control-group">
								<label for="team-search" class="control-label"> 🔍 Search Teams </label>
								<input
									type="text"
									class="control-input search-input"
									id="team-search"
									bind:value={searchQuery}
									on:input={handleSearchInput}
									placeholder="Type to filter teams..."
									autocomplete="off"
								/>
								{#if searchQuery}
									<button
										class="clear-search-btn"
										on:click={() => (searchQuery = '')}
										type="button"
										aria-label="Clear search"
									>
										✕
									</button>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Teams Container -->
					<div class="teams-section">
						<div class="teams-header">
							<h3 class="teams-title">Available Teams</h3>
							<div class="teams-meta">
								{#if selectedTeamsArray.length === 2}
									<span class="selection-complete">✓ 2/2 teams selected</span>
								{:else}
									<span class="selection-incomplete"
										>{selectedTeamsArray.length}/2 teams selected</span
									>
								{/if}
							</div>
						</div>

						<div class="teams-container">
							{#if $isTeamDataLoading}
								<div class="loading-teams">
									<LoadingSpinner size="small" text="Loading teams..." />
								</div>
							{:else if filteredTeams.length > 0}
								<div class="teams-grid">
									{#each filteredTeams as team (team)}
										<button
											class="team-button"
											class:selected={selectedTeamsArray.includes(team)}
											class:disabled={selectedTeamsArray.length === 2 &&
												!selectedTeamsArray.includes(team)}
											on:click={(event) => toggleSelection(event, team)}
											type="button"
										>
											<span class="team-name">{team}</span>
											{#if selectedTeamsArray.includes(team)}
												<span class="team-selected-icon">
													{selectedTeamsArray.indexOf(team) === 0 ? '①' : '②'}
												</span>
											{/if}
										</button>
									{/each}
								</div>

								{#if searchQuery && teams.length > filteredTeams.length}
									<div class="search-info">
										<p class="search-results-text">
											Showing {filteredTeams.length} of {teams.length} teams
										</p>
									</div>
								{/if}
							{:else if searchQuery}
								<div class="empty-search">
									<div class="empty-icon">🔍</div>
									<p class="empty-message">No teams found for "{searchQuery}"</p>
									<button
										class="clear-search-btn-alt"
										on:click={() => (searchQuery = '')}
										type="button"
									>
										Clear Search
									</button>
								</div>
							{:else if teams.length === 0}
								<div class="select-division-placeholder">
									<div class="placeholder-icon">🏈</div>
									<p class="placeholder-message">Select a division to view teams</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Panel: Selected Teams & Matchup -->
			<div class="selected-panel">
				<!-- Selected Teams Card -->
				<div class="panel-card selected-teams-card">
					<!-- Selected Teams Header -->
					<div class="panel-header">
						<h2 class="panel-title">
							🥊 Matchup Preview
							{#if selectedTeamsArray.length > 0}
								<span class="panel-count">({selectedTeamsArray.length}/2)</span>
							{/if}
						</h2>
						{#if selectedTeamsArray.length > 0}
							<div class="header-actions">
								{#if selectedTeamsArray.length === 2}
									<button
										class="swap-btn"
										on:click={swapTeams}
										type="button"
										title="Swap team positions"
									>
										🔄
									</button>
								{/if}
								<button class="clear-all-btn" on:click={clearAllTeams} type="button">
									Clear All
								</button>
							</div>
						{/if}
					</div>

					<!-- Matchup Display -->
					<div class="selected-teams-container">
						{#if selectedTeamsArray.length === 0}
							<div class="empty-selected">
								<div class="empty-icon">⚔️</div>
								<h3 class="empty-title">No Teams Selected</h3>
								<p class="empty-message">Choose two teams from the left panel to compare</p>
							</div>
						{:else if selectedTeamsArray.length === 1}
							<div class="partial-selection">
								<div class="team-slot filled">
									<div class="team-number">1</div>
									<div class="team-info">
										<h4 class="team-name">{selectedTeamsArray[0]}</h4>
										<button
											class="remove-team-btn"
											on:click={(event) => toggleSelection(event, selectedTeamsArray[0])}
											type="button"
											aria-label="Remove {selectedTeamsArray[0]}"
										>
											✕
										</button>
									</div>
								</div>

								<div class="vs-divider">
									<span class="vs-text">VS</span>
								</div>

								<div class="team-slot empty">
									<div class="team-number">2</div>
									<div class="team-placeholder">
										<span class="placeholder-text">Select second team</span>
									</div>
								</div>
							</div>
						{:else}
							<div class="full-matchup">
								<div class="team-slot filled">
									<div class="team-number">1</div>
									<div class="team-info">
										<h4 class="team-name">{selectedTeamsArray[0]}</h4>
										<button
											class="remove-team-btn"
											on:click={(event) => toggleSelection(event, selectedTeamsArray[0])}
											type="button"
											aria-label="Remove {selectedTeamsArray[0]}"
										>
											✕
										</button>
									</div>
								</div>

								<div class="vs-divider active">
									<span class="vs-text">VS</span>
									<div class="rivalry-indicator">🔥</div>
								</div>

								<div class="team-slot filled">
									<div class="team-number">2</div>
									<div class="team-info">
										<h4 class="team-name">{selectedTeamsArray[1]}</h4>
										<button
											class="remove-team-btn"
											on:click={(event) => toggleSelection(event, selectedTeamsArray[1])}
											type="button"
											aria-label="Remove {selectedTeamsArray[1]}"
										>
											✕
										</button>
									</div>
								</div>
							</div>
						{/if}

						<!-- Search Parameters Summary -->
						{#if selectedTeamsArray.length === 2}
							<div class="search-summary">
								<h4 class="summary-title">📊 Search Parameters</h4>
								<div class="summary-item">
									<span class="summary-label">🏟️ Division:</span>
									<span class="summary-value">{selectedDivision}</span>
								</div>
								{#if minYear}
									<div class="summary-item">
										<span class="summary-label">📅 From Year:</span>
										<span class="summary-value">{minYear}</span>
									</div>
								{/if}
								{#if maxYear}
									<div class="summary-item">
										<span class="summary-label">📅 To Year:</span>
										<span class="summary-value">{maxYear}</span>
									</div>
								{/if}
								{#if !minYear && !maxYear}
									<div class="summary-item">
										<span class="summary-label">📅 Time Period:</span>
										<span class="summary-value">All-time</span>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<!-- Submit Card -->
				<div class="panel-card submit-card">
					<div class="submit-content">
						{#if isValidForm && isValidYearRange}
							<div class="submit-info">
								<h3 class="submit-title">🚀 Ready to Compare</h3>
								<p class="submit-description">
									View head-to-head matchup history between {selectedTeamsArray[0]} and {selectedTeamsArray[1]}
									{#if minYear || maxYear}
										{#if minYear && maxYear}
											from {minYear} to {maxYear}
										{:else if minYear}
											from {minYear} onwards
										{:else}
											through {maxYear}
										{/if}
									{/if}
								</p>
							</div>
						{:else if !isValidYearRange}
							<div class="submit-info">
								<h3 class="submit-title">⚠️ Invalid Year Range</h3>
								<p class="submit-description">Min year cannot be greater than max year</p>
							</div>
						{:else}
							<div class="submit-info">
								<h3 class="submit-title">⚔️ Select Two Teams</h3>
								<p class="submit-description">Choose two teams to compare matchup history</p>
							</div>
						{/if}

						<div class="submit-actions">
							<a
								href={isValidForm && isValidYearRange ? getHeadToHeadURL() : '#'}
								data-sveltekit-prefetch
								class="submit-link"
								class:disabled={!isValidForm || !isValidYearRange || $isTeamDataLoading}
							>
								<button
									type="button"
									class="submit-button"
									disabled={!isValidForm || !isValidYearRange || $isTeamDataLoading}
								>
									{#if $isTeamDataLoading}
										<span class="btn-spinner" />
										Loading...
									{:else if isValidForm && isValidYearRange}
										⚔️ View Head-to-Head
									{:else if !isValidYearRange}
										Fix Year Range
									{:else}
										Select Two Teams
									{/if}
								</button>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
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

	/* ========================================
	   LAYOUT & STRUCTURE
	======================================== */
	.matchup-select-wrapper {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
		padding: 1rem;
	}

	/* ========================================
	   HERO SECTION
	======================================== */
	.hero-section {
		text-align: center;
		padding: 1rem 1rem 3rem 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-content {
		animation: fadeInUp 0.6s ease-out;
	}

	.hero-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.hero-icon {
		display: inline-block;
		width: clamp(36px, 6vw, 64px);
		height: clamp(36px, 6vw, 64px);
		opacity: 0.9;
		filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.1));
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-subtitle {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: var(--text-secondary);
		margin: 1rem auto 0 auto;
		line-height: 1.5;
		max-width: 600px;
	}

	/* ========================================
	   SELECTION INTERFACE
	======================================== */
	.selection-interface {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.selected-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: min-content;
	}

	.panel-card {
		background: var(--bg-primary);
		border-radius: 1.5rem;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border-primary);
		overflow: hidden;
	}

	.panel-header {
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
		color: white;
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.panel-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.panel-count {
		font-size: 1rem;
		font-weight: 500;
		opacity: 0.9;
	}

	.panel-subtitle {
		margin: 0.5rem 0 0 0;
		opacity: 0.9;
		font-size: 0.875rem;
		grid-column: 1 / -1;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.clear-all-btn,
	.swap-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.swap-btn {
		padding: 0.5rem;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clear-all-btn:hover,
	.swap-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}

	/* ========================================
	   CONTROLS SECTION
	======================================== */
	.controls-section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.control-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}

	.control-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-select,
	.control-input {
		padding: 0.75rem 1rem;
		border: 2px solid var(--border-primary);
		border-radius: 0.75rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.875rem;
		transition: all 0.2s ease;
		outline: none;
	}

	.control-select:focus,
	.control-input:focus {
		border-color: var(--accent-orange);
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
		background: var(--bg-primary);
	}

	.control-select:disabled,
	.control-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.search-input {
		padding-right: 3rem;
	}

	.clear-search-btn {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: var(--text-secondary);
		color: white;
		border: none;
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.2s ease;
	}

	.clear-search-btn:hover {
		background: var(--accent-red);
		transform: translateY(-50%) scale(1.1);
	}

	/* ========================================
	   TEAMS SECTION
	======================================== */
	.teams-section {
		border-top: 1px solid var(--border-primary);
	}

	.teams-header {
		padding: 1.5rem 2rem 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-secondary);
	}

	.teams-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.teams-meta {
		display: flex;
		gap: 0.5rem;
	}

	.selection-complete {
		background: var(--accent-green);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.selection-incomplete {
		background: var(--accent-orange);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.teams-container {
		min-height: 400px;
		max-height: 500px;
		overflow-y: auto;
		padding: 1rem 2rem 2rem 2rem;
	}

	.teams-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.team-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--bg-secondary);
		border: 2px solid var(--border-primary);
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-primary);
		font-size: 0.875rem;
		text-align: left;
		position: relative;
		overflow: hidden;
	}

	.team-button:hover:not(.disabled) {
		border-color: var(--accent-orange);
		background: var(--bg-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.team-button.selected {
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
		border-color: var(--accent-orange);
		color: white;
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.team-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.team-button.selected::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 70%
		);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.team-name {
		font-weight: 500;
		flex: 1;
		line-height: 1.3;
	}

	.team-selected-icon {
		font-size: 1.125rem;
		margin-left: 0.5rem;
		animation: checkmark 0.3s ease-out;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes checkmark {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	/* ========================================
	   EMPTY STATES
	======================================== */
	.loading-teams,
	.empty-search,
	.select-division-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
	}

	.empty-icon,
	.placeholder-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.6;
	}

	.empty-message,
	.placeholder-message {
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
	}

	.search-info {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-primary);
		text-align: center;
	}

	.search-results-text {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin: 0;
	}

	.clear-search-btn-alt {
		background: var(--accent-orange);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.2s ease;
	}

	.clear-search-btn-alt:hover {
		background: var(--accent-red);
		transform: translateY(-1px);
	}

	/* ========================================
	   SELECTED TEAMS PANEL
	======================================== */
	.selected-teams-container {
		padding: 2rem;
		min-height: auto;
	}

	.empty-selected {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		text-align: center;
	}

	.empty-title {
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	/* ========================================
	   MATCHUP DISPLAY
	======================================== */
	.partial-selection,
	.full-matchup {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.team-slot {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 1rem;
		border: 2px solid var(--border-primary);
		transition: all 0.2s ease;
	}

	.team-slot.filled {
		background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
		border-color: var(--accent-green);
		color: white;
	}

	.team-slot.empty {
		background: var(--bg-secondary);
		border-color: var(--border-primary);
		border-style: dashed;
	}

	.team-number {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.125rem;
		flex-shrink: 0;
	}

	.team-slot.empty .team-number {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.team-info {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.team-info .team-name {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: white;
	}

	.team-placeholder {
		flex: 1;
	}

	.placeholder-text {
		color: var(--text-secondary);
		font-style: italic;
		font-size: 1rem;
	}

	.remove-team-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s ease;
		margin-left: 0.5rem;
	}

	.remove-team-btn:hover {
		background: var(--accent-red);
		transform: scale(1.1);
	}

	.vs-divider {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 0;
		position: relative;
	}

	.vs-text {
		background: var(--bg-primary);
		color: var(--text-secondary);
		padding: 0.5rem 1rem;
		border-radius: 1rem;
		font-weight: 700;
		font-size: 1.125rem;
		border: 2px solid var(--border-primary);
		transition: all 0.2s ease;
	}

	.vs-divider.active .vs-text {
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
		color: white;
		border-color: var(--accent-orange);
		box-shadow: var(--shadow-md);
	}

	.rivalry-indicator {
		margin-top: 0.5rem;
		font-size: 1.5rem;
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	/* ========================================
	   SEARCH SUMMARY
	======================================== */
	.search-summary {
		background: var(--bg-secondary);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid var(--border-primary);
	}

	.summary-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border-primary);
	}

	.summary-item:last-child {
		border-bottom: none;
	}

	.summary-label {
		font-weight: 500;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.summary-value {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.selected-teams-card {
		flex: 1;
	}

	/* ========================================
	   SUBMIT CARD
	======================================== */
	.submit-card {
		background: var(--bg-primary);
		border-radius: 1.5rem;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border-primary);
		overflow: hidden;
	}

	.submit-content {
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.submit-info {
		flex: 1;
		min-width: 200px;
	}

	.submit-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
	}

	.submit-description {
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
		font-size: 0.875rem;
	}

	.submit-actions {
		flex-shrink: 0;
	}

	.submit-link {
		text-decoration: none;
	}

	.submit-link.disabled {
		pointer-events: none;
	}

	.submit-button {
		background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
		color: white;
		border: none;
		padding: 0.875rem 1.5rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		white-space: nowrap;
	}

	.submit-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	.submit-button:hover:not(:disabled)::before {
		left: 100%;
	}

	.submit-button:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg), 0 10px 20px rgba(249, 115, 22, 0.3);
	}

	.submit-button:disabled {
		background: var(--text-secondary);
		cursor: not-allowed;
		transform: none;
		box-shadow: var(--shadow-sm);
	}

	.btn-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ========================================
	   ANIMATIONS
	======================================== */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ========================================
	   RESPONSIVE DESIGN
	======================================== */

	/* Tablets */
	@media (max-width: 1024px) {
		.selection-interface {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.selected-panel {
			height: 100%;
			order: -1;
		}

		.selected-panel {
			gap: 1rem;
		}

		.teams-container {
			max-height: 400px;
		}
	}

	/* Mobile Phones */
	@media (max-width: 768px) {
		.matchup-select-wrapper {
			padding: 0.75rem;
		}

		.selection-interface {
			gap: 1.5rem;
			padding: 0;
		}

		.panel-card {
			margin: 0;
			border-radius: 1rem;
		}

		.hero-section {
			padding: 1.5rem 0.5rem 2rem 0.5rem;
		}

		.panel-header {
			padding: 1.25rem;
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.panel-title {
			font-size: 1.25rem;
		}

		.controls-section {
			padding: 1.25rem;
		}

		.control-row {
			grid-template-columns: 1fr;
		}

		.teams-header {
			padding: 1rem 1.25rem;
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}

		.teams-container {
			padding: 1rem 1.25rem 1.25rem 1.25rem;
			min-height: 300px;
			max-height: 350px;
		}

		.teams-grid {
			grid-template-columns: 1fr;
		}

		.selected-teams-container {
			padding: 1.25rem;
			min-height: 300px;
		}

		.submit-content {
			padding: 1.25rem;
			flex-direction: column;
			text-align: center;
			align-items: center;
		}

		.submit-button {
			width: 100%;
			justify-content: center;
			max-width: 250px;
		}

		.partial-selection,
		.full-matchup {
			gap: 0.75rem;
		}

		.team-slot {
			padding: 1rem;
		}

		.team-info .team-name {
			font-size: 1rem;
		}
	}

	/* Small Mobile */
	@media (max-width: 480px) {
		.matchup-select-wrapper {
			padding: 0.5rem;
		}

		.selection-interface {
			gap: 1rem;
			padding: 0;
		}

		.hero-section {
			padding: 1rem 0.25rem 1.5rem 0.25rem;
		}

		.hero-title {
			font-size: 1.75rem;
		}

		.hero-subtitle {
			font-size: 0.875rem;
		}

		.panel-header {
			padding: 1rem;
		}

		.controls-section {
			padding: 1rem;
		}

		.teams-header {
			padding: 0.75rem 1rem;
		}

		.teams-container {
			padding: 0.75rem 1rem 1rem 1rem;
		}

		.selected-teams-container {
			padding: 1rem;
		}

		.submit-content {
			padding: 1rem;
			align-items: center;
		}

		.submit-button {
			width: min-content;
			justify-content: center;
			max-width: 200px;
			padding: 0.875rem 1.5rem;
			font-size: 0.875rem;
		}

		.panel-card {
			border-radius: 0.75rem;
		}

		.team-slot {
			padding: 0.75rem;
		}

		.team-number {
			width: 2rem;
			height: 2rem;
			font-size: 1rem;
		}
	}

	/* ========================================
	   ACCESSIBILITY & FOCUS STATES
	======================================== */
	.team-button:focus,
	.control-select:focus,
	.control-input:focus,
	.submit-button:focus,
	.clear-all-btn:focus,
	.swap-btn:focus,
	.remove-team-btn:focus,
	.clear-search-btn:focus,
	.clear-search-btn-alt:focus {
		outline: 2px solid var(--accent-orange);
		outline-offset: 2px;
	}

	/* Reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.team-button,
		.control-select,
		.control-input,
		.submit-button {
			border-width: 2px;
		}
	}
</style>
