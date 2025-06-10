<!-- src/lib/components/ResubmitTeams.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { selectedTeams } from '$lib/stores/store';
	import { teamDataStore, ensureTeamsLoaded } from '$lib/stores/teamData';
	import { theme } from '$lib/stores/theme';
	import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
	import { getCurrentYear } from '$lib/utils/getCurrentYear';

	// Component state
	let searchQuery: string = '';
	let searchResults: string[] = [];
	let selectedWeek: number = 1;
	let selectedYear: number = new Date().getFullYear();
	let selectedTeamsArray: string[] = [];
	let isLoading: boolean = false;
	let searchError: string | null = null;

	const minQueryLength: number = 2;

	// Cleanup tracking
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let unsubscribers: (() => void)[] = [];

	// Simple search function
	async function searchTeams(): Promise<void> {
		const query = searchQuery.toLowerCase().trim();

		if (query.length < minQueryLength) {
			searchResults = [];
			searchError = null;
			return;
		}

		try {
			isLoading = true;
			searchError = null;

			// Ensure team data is loaded
			await ensureTeamsLoaded();

			// Get search result and extract teams array
			const searchResult = teamDataStore.searchTeams(query);
			searchResults = searchResult.teams;

			console.log(`🔍 Search for "${query}" returned ${searchResults.length} results`);
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
			searchError = 'Search failed. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Debounced search with proper cleanup
	function debouncedSearch(): void {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			searchTeams();
		}, 150);
	}

	// Handle team selection
	function selectTeam(event: Event, team: string): void {
		event.preventDefault();

		selectedTeams.update((teams: string[]) => {
			if (teams.includes(team)) {
				return teams.filter((selectedTeam) => selectedTeam !== team);
			} else {
				return [...teams, team];
			}
		});

		// Force re-render by reassigning searchResults
		searchResults = [...searchResults];
	}

	// Handle input changes
	function handleInput(): void {
		debouncedSearch();
	}

	// Handle form submission
	function handleSubmit(): void {
		if (selectedTeamsArray.length === 0) {
			alert('Please select at least one team.');
			return;
		}

		// Navigate to games page
		const teamsParam = selectedTeamsArray.join(',');
		const url = `/games?teams=${encodeURIComponent(
			teamsParam
		)}&year=${selectedYear}&week=${selectedWeek}`;
		window.location.href = url;
	}

	// Initialize component
	onMount(() => {
		console.log('🎯 ResubmitTeams component mounted');

		// Subscribe to selectedTeams store
		const teamsUnsub = selectedTeams.subscribe((value) => {
			selectedTeamsArray = value;
		});
		unsubscribers.push(teamsUnsub);

		// Get URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const weekParam = urlParams.get('week');
		const yearParam = urlParams.get('year');

		selectedWeek = weekParam ? parseInt(weekParam, 10) : getCurrentWeek();
		selectedYear = yearParam ? parseInt(yearParam, 10) : getCurrentYear();

		// Initial search if there's a query
		if (searchQuery.length >= minQueryLength) {
			searchTeams();
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		// Clean up all subscriptions
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers = [];

		// Clear timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
			searchTimeout = null;
		}
	});
</script>

<section class="resubmit-wrapper" class:light={!$theme} class:dark={$theme}>
	<div class="container">
		<h2 class="section-title">Search for Different Teams</h2>

		<!-- Search Form -->
		<form on:submit|preventDefault={handleSubmit} class="resubmit-form">
			<!-- Team Search -->
			<div class="form-group">
				<label for="teamSearch">Search for a Team:</label>
				<input
					type="text"
					id="teamSearch"
					bind:value={searchQuery}
					placeholder="Enter team name (min {minQueryLength} characters)"
					on:input={handleInput}
					autocomplete="off"
					class="search-input"
				/>
			</div>

			<!-- Week Selection -->
			<div class="form-group">
				<label for="resubmit-week">Select Week:</label>
				<select id="resubmit-week" bind:value={selectedWeek} class="select-input">
					{#each [...Array(14).keys()] as week}
						<option value={week + 1}>{week + 1}</option>
					{/each}
				</select>
			</div>

			<!-- Year Selection -->
			<div class="form-group">
				<label for="resubmit-year">Select Year:</label>
				<input
					type="number"
					id="resubmit-year"
					bind:value={selectedYear}
					min={1900}
					max={new Date().getFullYear()}
					class="year-input"
				/>
			</div>

			<!-- Search Query Display -->
			<div class="search-info">
				<p id="search-query">
					You searched for: <span class="query-result">{searchQuery || 'Nothing yet'}</span>
				</p>
			</div>

			<!-- Search Results -->
			<div class="search-results">
				{#if isLoading}
					<p class="loading-message">Searching...</p>
				{:else if searchError}
					<p class="error-message">{searchError}</p>
				{:else if searchResults.length > 0}
					<ul class="team-list">
						{#each searchResults as team (team)}
							<li class="team-list-item">
								<button
									class="team-button"
									on:mousedown={(event) => selectTeam(event, team)}
									class:selected={selectedTeamsArray.includes(team)}
									class:light={!$theme}
									class:dark={$theme}
									tabindex="0"
									type="button"
								>
									{team}
								</button>
							</li>
						{/each}
					</ul>
				{:else if searchQuery.length >= minQueryLength}
					<p class="no-results">No teams found for "{searchQuery}"</p>
				{:else if searchQuery.length > 0}
					<p class="search-hint">Type at least {minQueryLength} characters to search</p>
				{:else}
					<p class="search-prompt">Start typing to search teams...</p>
				{/if}
			</div>

			<!-- Selected Teams Display -->
			{#if selectedTeamsArray.length > 0}
				<div class="selected-teams">
					<h3>Selected Teams ({selectedTeamsArray.length}):</h3>
					<ul class="selected-list">
						{#each selectedTeamsArray as team}
							<li class="selected-item">
								<span>{team}</span>
								<button
									type="button"
									on:click={(e) => selectTeam(e, team)}
									class="remove-button"
									title="Remove {team}"
								>
									×
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Submit Button -->
			<div class="submit-section">
				<button type="submit" class="submit-button" disabled={selectedTeamsArray.length === 0}>
					View Games ({selectedTeamsArray.length} teams)
				</button>
			</div>
		</form>
	</div>
</section>

<style>
	.light {
		--bg-color: #f9f9f9;
		--text-color: #1a202c;
		--form-bg: #ffffff;
		--border-color: #d1d5db;
		--highlight-color: #b2e7cb;
		--selected-color: #3b82f6;
		--error-color: #ef4444;
		--success-color: #10b981;
	}

	.dark {
		--bg-color: #1a202c;
		--text-color: #f9f9f9;
		--form-bg: #374151;
		--border-color: #4b5563;
		--highlight-color: #336699;
		--selected-color: #60a5fa;
		--error-color: #f87171;
		--success-color: #34d399;
	}

	.resubmit-wrapper {
		background-color: var(--bg-color);
		color: var(--text-color);
		padding: 2rem 1rem;
		min-height: 100vh;
	}

	.container {
		max-width: 600px;
		margin: 0 auto;
	}

	.section-title {
		text-align: center;
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 2rem;
		color: var(--text-color);
	}

	.resubmit-form {
		background-color: var(--form-bg);
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 1px solid var(--border-color);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-color);
	}

	.search-input,
	.select-input,
	.year-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		background-color: var(--form-bg);
		color: var(--text-color);
		font-size: 0.875rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.search-input:focus,
	.select-input:focus,
	.year-input:focus {
		outline: none;
		border-color: var(--selected-color);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-info {
		margin-bottom: 1rem;
	}

	.query-result {
		font-weight: 600;
		color: var(--selected-color);
	}

	.search-results {
		min-height: 120px;
		max-height: 200px;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		margin-bottom: 1.5rem;
		overflow-y: auto;
		background-color: var(--form-bg);
	}

	.team-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.team-list-item {
		margin-bottom: 0.25rem;
	}

	.team-button {
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 0.25rem;
		background-color: transparent;
		color: var(--text-color);
		cursor: pointer;
		transition: background-color 0.2s;
		font-size: 0.875rem;
	}

	.team-button:hover {
		background-color: var(--highlight-color);
	}

	.team-button.selected {
		background-color: var(--selected-color);
		color: white;
	}

	.loading-message,
	.error-message,
	.no-results,
	.search-hint,
	.search-prompt {
		text-align: center;
		padding: 1rem;
		font-size: 0.875rem;
		color: var(--text-color);
		font-style: italic;
	}

	.error-message {
		color: var(--error-color);
	}

	.selected-teams {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background-color: rgba(59, 130, 246, 0.1);
		border-radius: 0.375rem;
		border: 1px solid var(--selected-color);
	}

	.selected-teams h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: var(--selected-color);
	}

	.selected-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.selected-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		margin-bottom: 0.25rem;
		background-color: var(--form-bg);
		border-radius: 0.25rem;
		border: 1px solid var(--border-color);
	}

	.remove-button {
		background: none;
		border: none;
		color: var(--error-color);
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: bold;
		padding: 0.25rem;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.remove-button:hover {
		background-color: rgba(239, 68, 68, 0.1);
	}

	.submit-section {
		text-align: center;
	}

	.submit-button {
		padding: 0.75rem 2rem;
		background-color: var(--selected-color);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.submit-button:disabled {
		background-color: var(--border-color);
		cursor: not-allowed;
		transform: none;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.resubmit-wrapper {
			padding: 1rem 0.5rem;
		}

		.container {
			max-width: 100%;
		}

		.resubmit-form {
			padding: 1rem;
		}

		.section-title {
			font-size: 1.25rem;
		}
	}
</style>
