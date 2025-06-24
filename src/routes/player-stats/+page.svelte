<!-- src/routes/player-stats/+page.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import ExportButton from '$lib/components/ExportButton.svelte';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import type { PlayerStat, Player } from '$lib/types/api';

	export let data: {
		searchParams?: Record<string, string>;
	} = {};

	// Component state
	let playerStats: PlayerStat[] = [];
	let isLoading = false;
	let error: string | null = null;
	let totalResults = 0;
	let isInitialized = false;
	let searchInfo: any = null; // For displaying search metadata

	// Player search state
	let playerSearchQuery = '';
	let playerSearchResults: Player[] = [];
	let isSearchingPlayers = false;
	let playerSearchError: string | null = null;
	let showPlayerSearch = false;
	let selectedPlayer: Player | null = null;

	// Pagination
	const pageSize = 50; // Use larger page size for better performance
	let currentPage = 0;
	
	// Debug flag to help identify reactive issues
	let isUserTyping = false;
	let typingTimeout: ReturnType<typeof setTimeout>;

	// Form state - using the exact same pattern as team stats
	let searchParams = {
		year: '',
		team: '',
		conference: '',
		startWeek: '',
		endWeek: '',
		category: '',
		seasonType: 'regular',
		playerName: '' // New field for player-specific searches
	};

	// Form validation
	let formErrors: Record<string, string> = {};

	// Category options - matching CFBD API exactly
	const categories = [
		{ value: '', label: 'All Categories' },
		{ value: 'passing', label: 'Passing' },
		{ value: 'rushing', label: 'Rushing' },
		{ value: 'receiving', label: 'Receiving' },
		{ value: 'fumbles', label: 'Fumbles' },
		{ value: 'defense', label: 'Defense' },
		{ value: 'kicking', label: 'Kicking' },
		{ value: 'punting', label: 'Punting' },
		{ value: 'kickReturns', label: 'Kick Returns' },
		{ value: 'puntReturns', label: 'Punt Returns' },
		{ value: 'interceptions', label: 'Interceptions' }
	];

	// Season type options
	const seasonTypes = [
		{ value: 'regular', label: 'Regular Season' },
		{ value: 'postseason', label: 'Postseason' },
		{ value: 'both', label: 'Both' }
	];

	// Reactive variables for export functionality
	$: hasResults = playerStats.length > 0;
	$: exportData = playerStats;
	$: exportFilename = (() => {
		let filename = `player-stats`;
		if (searchParams.playerName) filename += `-${searchParams.playerName.replace(/\s+/g, '-')}`;
		if (searchParams.year) filename += `-${searchParams.year}`;
		if (searchParams.team) filename += `-${searchParams.team.replace(/\s+/g, '-')}`;
		if (searchParams.conference) filename += `-${searchParams.conference}`;
		if (searchParams.category) filename += `-${searchParams.category}`;
		if (searchParams.seasonType && searchParams.seasonType !== 'regular')
			filename += `-${searchParams.seasonType}`;
		if (searchParams.startWeek && searchParams.endWeek) {
			filename += `-weeks-${searchParams.startWeek}-${searchParams.endWeek}`;
		} else if (searchParams.startWeek) {
			filename += `-week-${searchParams.startWeek}+`;
		} else if (searchParams.endWeek) {
			filename += `-week-1-${searchParams.endWeek}`;
		}
		return filename;
	})();

	// Initialize from URL parameters on mount
	function initializeFromUrl(): void {
		if (typeof window === 'undefined') return;

		const urlParams = new URLSearchParams(window.location.search);

		// Only initialize if searchParams are currently empty (prevent overriding user input)
		const isCurrentlyEmpty = !searchParams.year && !searchParams.team && !searchParams.playerName;
		
		if (isCurrentlyEmpty) {
			// Initialize search params from URL or data - don't default year to current year
			searchParams = {
				year: urlParams.get('year') || data.searchParams?.year || '',
				team: urlParams.get('team') || data.searchParams?.team || '',
				conference: urlParams.get('conference') || data.searchParams?.conference || '',
				startWeek: urlParams.get('startWeek') || data.searchParams?.startWeek || '',
				endWeek: urlParams.get('endWeek') || data.searchParams?.endWeek || '',
				category: urlParams.get('category') || data.searchParams?.category || '',
				seasonType: urlParams.get('seasonType') || data.searchParams?.seasonType || 'regular',
				playerName: urlParams.get('playerName') || data.searchParams?.playerName || ''
			};
			
			console.log('🔄 Initialized searchParams from URL:', searchParams);
		} else {
			console.log('⏭️ Skipping URL initialization - user has input data');
		}

		// Get current page
		const skip = Number(urlParams.get('skip')) || 0;
		currentPage = Math.floor(skip / pageSize);

		// If we have meaningful search parameters, do initial search
		const hasValidSearchCriteria = (searchParams.year && isValidYear(searchParams.year)) || 
										(searchParams.playerName && searchParams.playerName.trim());
		
		if (hasValidSearchCriteria) {
			fetchPlayerStats();
		}
	}

	// Form validation function
	function validateForm(): boolean {
		formErrors = {};

		const isPlayerSpecificSearch = searchParams.playerName && searchParams.playerName.trim();
		
		// Year is only required if NOT searching for a specific player
		if (!searchParams.year && !isPlayerSpecificSearch) {
			formErrors.year = 'Year is required when not searching for a specific player';
			return false;
		}

		// If year is provided, validate it
		if (searchParams.year) {
			const year = parseInt(searchParams.year);
			const currentYear = new Date().getFullYear();
			if (isNaN(year) || year < 1900 || year > currentYear + 1) {
				formErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
				return false;
			}
		}

		// Validate week ranges
		if (searchParams.startWeek) {
			const week = parseInt(searchParams.startWeek);
			if (isNaN(week) || week < 1 || week > 20) {
				formErrors.startWeek = 'Start week must be between 1 and 20';
				return false;
			}
		}

		if (searchParams.endWeek) {
			const week = parseInt(searchParams.endWeek);
			if (isNaN(week) || week < 1 || week > 20) {
				formErrors.endWeek = 'End week must be between 1 and 20';
				return false;
			}
		}

		if (searchParams.startWeek && searchParams.endWeek) {
			const start = parseInt(searchParams.startWeek);
			const end = parseInt(searchParams.endWeek);
			if (start > end) {
				formErrors.endWeek = 'End week must be greater than or equal to start week';
				return false;
			}
		}

		return true;
	}

	// Helper function to check if year is valid
	function isValidYear(year: string): boolean {
		const yearNum = parseInt(year);
		const currentYear = new Date().getFullYear();
		return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1;
	}

	// Player search functionality
	async function searchPlayers(): Promise<void> {
	if (!playerSearchQuery || playerSearchQuery.trim().length < 2) {
		playerSearchResults = [];
		return;
	}

	isSearchingPlayers = true;
	playerSearchError = null;

	try {
		const params = new URLSearchParams();
		params.set('searchTerm', playerSearchQuery.trim()); 

		// Add optional filters if available
		if (searchParams?.team && searchParams.team.trim()) {
			params.set('team', searchParams.team.trim());
		}

		if (searchParams?.year && String(searchParams.year).trim()) {
			params.set('year', String(searchParams.year).trim());
		}

		const response = await fetch(`/api/player-search?${params.toString()}`);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Network error' }));
			throw new Error(errorData.error || `HTTP ${response.status}`);
		}

		const result = await response.json();
		
		if (result.success && Array.isArray(result.data)) {
			playerSearchResults = result.data;
			if (playerSearchResults.length === 0) {
				playerSearchError = `No players found matching "${playerSearchQuery}"`;
			}
		} else {
			throw new Error(result.error || 'Invalid response format');
		}
	} catch (err) {
		console.error('❌ Player search error:', err);
		playerSearchError = err instanceof Error ? err.message : 'Failed to search players';
		playerSearchResults = [];
	} finally {
		isSearchingPlayers = false;
	}
}

	// Handle player selection
	function selectPlayer(player: Player): void {
		selectedPlayer = player;
		searchParams.team = player.team;
		searchParams.playerName = player.name;
		showPlayerSearch = false;
		playerSearchQuery = player.name;
		
		console.log(`🎯 Selected player: ${player.name} from ${player.team}`);
		console.log(`📝 Updated searchParams:`, searchParams);
		
		// Automatically trigger search when player is selected
		setTimeout(() => {
			handleSearch();
		}, 100);
	}

	// Clear player selection
	function clearPlayerSelection(): void {
		selectedPlayer = null;
		searchParams.playerName = '';
		playerSearchQuery = '';
		playerSearchResults = [];
		showPlayerSearch = false;
		
		console.log('🧹 Cleared player selection, updated searchParams:', searchParams);
	}

	// Debounced player search 
	let playerSearchTimeout: ReturnType<typeof setTimeout>;
	function handlePlayerSearchInput(event: Event | CustomEvent<{ value: string }>): void {
		let newValue: string;
		
		// Handle both direct input events and FormField custom events
		if (event instanceof CustomEvent && event.detail && typeof event.detail.value === 'string') {
			// Custom event from FormField component
			newValue = event.detail.value;
		} else if (event.target && 'value' in event.target) {
			// Direct input event
			newValue = (event.target as HTMLInputElement).value;
		} else {
			console.warn('Unexpected event type in handlePlayerSearchInput:', event);
			return;
		}
		
		playerSearchQuery = newValue;
		
		// Clear previous timeout
		if (playerSearchTimeout) {
			clearTimeout(playerSearchTimeout);
		}
		
		// Debounce search
		if (playerSearchQuery.trim().length >= 2) {
			showPlayerSearch = true;
			playerSearchTimeout = setTimeout(() => {
				searchPlayers();
			}, 300);
		} else {
			showPlayerSearch = false;
			playerSearchResults = [];
		}
	}

	async function fetchPlayerStats(): Promise<void> {
		if (!validateForm()) {
			playerStats = [];
			totalResults = 0;
			return;
		}

		isLoading = true;
		error = null;
		searchInfo = null;

		try {
			const params = new URLSearchParams();
			
			// Add year only if provided
			if (searchParams.year && String(searchParams.year).trim()) {
				params.set('year', searchParams.year);
			}

			// Add player name if searching for specific player
			if (searchParams.playerName && searchParams.playerName.trim()) {
				params.set('playerName', searchParams.playerName.trim());
			}

			// Optional filters - only add if they have values
			if (searchParams.team && searchParams.team.trim()) {
				// Use statsNameTrim to normalize team names
				const normalizedTeam = statsNameTrim(searchParams.team.trim());
				if (normalizedTeam) {
					params.set('team', normalizedTeam);
				}
			}
			
			if (searchParams.conference && searchParams.conference.trim()) {
				params.set('conference', searchParams.conference.trim());
			}
			
			if (searchParams.startWeek && searchParams.startWeek.trim()) {
				params.set('startWeek', searchParams.startWeek.trim());
			}
			
			if (searchParams.endWeek && searchParams.endWeek.trim()) {
				params.set('endWeek', searchParams.endWeek.trim());
			}
			
			if (searchParams.category && searchParams.category.trim()) {
				params.set('category', searchParams.category.trim());
			}
			
			if (searchParams.seasonType && searchParams.seasonType !== 'regular') {
				params.set('seasonType', searchParams.seasonType);
			}

			// Add pagination
			params.set('limit', pageSize.toString());
			params.set('skip', (currentPage * pageSize).toString());

			console.log('🔍 Fetching player stats with params:', params.toString());
			
			const response = await fetch(`/api/player-stats?${params.toString()}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Network error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();
			console.log('📦 Player stats API response:', result);

			if (result.success && Array.isArray(result.data)) {
				playerStats = result.data;
				totalResults = result.total || result.data.length;
				searchInfo = result.searchInfo || null;

				if (playerStats.length === 0) {
					error = 'No player statistics found for your search criteria. Try adjusting your filters or searching for a different player.';
				} else {
					error = null;
				}
			} else {
				throw new Error(result.error || 'Invalid response format from API');
			}
		} catch (err) {
			console.error('❌ Player stats fetch error:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch player stats';
			playerStats = [];
			totalResults = 0;
			searchInfo = null;
		} finally {
			isLoading = false;
		}
	}

	// Handle form field changes
	function handleFieldChange(event: CustomEvent<{ value: string | number }> | Event, field: string): void {
		let newValue: string | number;
		
		// Set typing flag to prevent reactive interference
		isUserTyping = true;
		clearTimeout(typingTimeout);
		typingTimeout = setTimeout(() => {
			isUserTyping = false;
		}, 1000);
		
		// Handle different event types
		if (event instanceof CustomEvent && event.detail && 'value' in event.detail) {
			// Custom event from FormField component
			newValue = event.detail.value;
		} else if (event.target && 'value' in event.target) {
			// Direct input event
			newValue = (event.target as HTMLInputElement).value;
		} else {
			console.warn('Unexpected event type in handleFieldChange:', event, 'for field:', field);
			isUserTyping = false;
			return;
		}

		// Convert to string for consistency
		const stringValue = String(newValue);
		
		console.log(`📝 Field change: ${field} = "${stringValue}"`);
		
		searchParams = {
			...searchParams,
			[field]: stringValue
		};

		// Clear errors for this field
		if (formErrors[field]) {
			const newErrors = { ...formErrors };
			delete newErrors[field];
			formErrors = newErrors;
		}
		
		console.log('📋 Updated searchParams:', searchParams);
	}

	// Handle form submission - update URL and fetch
	function handleSearch(): void {
		if (!validateForm()) {
			return;
		}

		// Reset to first page on new search
		currentPage = 0;

		// Update URL
		updateUrl();
		
		// Fetch data
		fetchPlayerStats();
	}

	// Update URL with current search parameters
	function updateUrl(): void {
		if (typeof window === 'undefined') return;

		const url = new URL(window.location.href);
		
		// Clear existing search params
		url.searchParams.forEach((_, key) => {
			url.searchParams.delete(key);
		});

		// Add current search params
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value && value !== '' && value !== 'regular') {
				url.searchParams.set(key, String(value));
			}
		});

		// Add pagination if not on first page
		if (currentPage > 0) {
			url.searchParams.set('skip', (currentPage * pageSize).toString());
		}

		// Update URL without reload
		goto(url.pathname + url.search, { replaceState: true, noScroll: true });
	}

	// Handle page changes
	function handlePageChange(newPage: number): void {
		currentPage = newPage;
		updateUrl();
		fetchPlayerStats();
	}

	// Handle clearing search
	function clearSearch(): void {
		searchParams = {
			year: '',
			team: '',
			conference: '',
			startWeek: '',
			endWeek: '',
			category: '',
			seasonType: 'regular',
			playerName: ''
		};
		formErrors = {};
		currentPage = 0;
		playerStats = [];
		totalResults = 0;
		error = null;
		searchInfo = null;
		clearPlayerSelection();
		updateUrl();
	}

	// Initialize on mount
	onMount(() => {
		initializeFromUrl();
		isInitialized = true;
	});

	// Cleanup
	onDestroy(() => {
		// Any cleanup needed
	});

	// Watch for URL changes (back/forward navigation)
	$: if (isInitialized && $page.url && !isUserTyping) {
		// Only re-initialize if URL changed externally AND we're not currently in the middle of user input
		const urlParams = new URLSearchParams($page.url.searchParams);
		const urlYear = urlParams.get('year') || '';
		const urlPlayerName = urlParams.get('playerName') || '';
		const urlTeam = urlParams.get('team') || '';
		const urlCategory = urlParams.get('category') || '';
		
		// Check if this is a significant URL change (not just user typing)
		const isSignificantChange = (
			(urlYear !== searchParams.year && urlYear !== '') ||
			(urlPlayerName !== searchParams.playerName && urlPlayerName !== '') ||
			(urlTeam !== searchParams.team && urlTeam !== '') ||
			(urlCategory !== searchParams.category && urlCategory !== '')
		);
		
		// Only reinitialize for significant changes (like back/forward navigation)
		if (isSignificantChange) {
			console.log('🔄 Significant URL change detected, reinitializing...');
			initializeFromUrl();
		}
	}
</script>

<svelte:head>
	<title>Player Statistics - Fieldwing</title>
	<meta
		name="description"
		content="Search college football player statistics by year, team, conference, week range, and statistical category."
	/>
</svelte:head>

<div class="wrapper" class:light={!$theme} class:dark={$theme}>
	<div class="container">
		<!-- Header Section -->
		<div class="header-section">
			<div class="header-content">
				<img class="header-icon" src="/playerstats.png" alt="Player Stats" />
				<h1 class="page-title">Player Statistics</h1>
				<p class="page-subtitle">
					Search player stats across college football
				</p>
			</div>
		</div>

		<!-- Search Form -->
		<div class="search-section">
			<div class="search-card">
				<div class="search-header">
					<h2 class="search-title">🔍 Search Player Stats</h2>
					<p class="search-subtitle">
						Search by player name (like "Bo Jackson") or filter by year and other criteria
					</p>
				</div>

				<form on:submit|preventDefault={handleSearch} class="search-form">
					<div class="form-grid">
						<!-- Player Name Search -->
						<div class="player-search-container">
							<FormField
								label="🔍 Search by Player Name"
								type="text"
								value={playerSearchQuery}
								placeholder="e.g., Bo Jackson, Cam Newton, Ricky Williams"
								on:change={handlePlayerSearchInput}
							/>
							
							{#if selectedPlayer}
								<div class="selected-player-badge">
									<div class="selected-player-info">
										<span class="selected-player-name">{selectedPlayer.name}</span>
										<span class="selected-player-details">
											{selectedPlayer.position} • {selectedPlayer.team}
										</span>
									</div>
									<button
										type="button"
										class="clear-player-btn"
										on:click={clearPlayerSelection}
										title="Clear player selection"
									>
										✕
									</button>
								</div>
							{/if}

							{#if showPlayerSearch && (isSearchingPlayers || playerSearchResults.length > 0 || playerSearchError)}
								<div class="player-search-dropdown">
									{#if isSearchingPlayers}
										<div class="player-search-loading">
											<LoadingSpinner size="small" text="Searching players..." />
										</div>
									{:else if playerSearchError}
										<div class="player-search-error">
											<span class="error-icon">❌</span>
											{playerSearchError}
										</div>
									{:else if playerSearchResults.length > 0}
										<div class="player-search-results">
											<div class="player-search-header">
												Found {playerSearchResults.length} player{playerSearchResults.length !== 1 ? 's' : ''}:
											</div>
											{#each playerSearchResults.slice(0, 10) as player}
												<button
													type="button"
													class="player-result-item"
													on:click={() => selectPlayer(player)}
												>
													<div class="player-result-info">
														<span class="player-result-name">{player.name}</span>
														<span class="player-result-details">
															{player.position} • {player.team}
															{#if player.jersey} • #{player.jersey}{/if}
														</span>
													</div>
												</button>
											{/each}
											{#if playerSearchResults.length > 10}
												<div class="player-search-footer">
													Showing first 10 results. Refine your search for better results.
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Year (Optional when searching by player) -->
						<FormField
							label={searchParams.playerName ? "Year (Optional)" : "Year *"}
							type="number"
							value={searchParams.year}
							required={!searchParams.playerName}
							error={formErrors.year}
							placeholder={searchParams.playerName ? "All years" : new Date().getFullYear().toString()}
							min="1900"
							max={new Date().getFullYear() + 1}
							on:change={(e) => handleFieldChange(e, 'year')}
							on:input={(e) => handleFieldChange(e, 'year')}
						/>

						<!-- Category -->
						<FormField
							label="Statistical Category"
							type="select"
							value={searchParams.category}
							options={categories}
							on:change={(e) => handleFieldChange(e, 'category')}
						/>

						<!-- Team -->
						<FormField
							label="Team"
							type="text"
							value={searchParams.team}
							placeholder="e.g., Auburn, Alabama, Georgia"
							on:change={(e) => handleFieldChange(e, 'team')}
							on:input={(e) => handleFieldChange(e, 'team')}
						/>

						<!-- Conference -->
						<FormField
							label="Conference"
							type="text"
							value={searchParams.conference}
							placeholder="e.g., SEC, Big 10, ACC"
							on:change={(e) => handleFieldChange(e, 'conference')}
							on:input={(e) => handleFieldChange(e, 'conference')}
						/>

						<!-- Start Week -->
						<FormField
							label="Start Week"
							type="number"
							value={searchParams.startWeek}
							error={formErrors.startWeek}
							placeholder="1"
							min="1"
							max="20"
							on:change={(e) => handleFieldChange(e, 'startWeek')}
							on:input={(e) => handleFieldChange(e, 'startWeek')}
						/>

						<!-- End Week -->
						<FormField
							label="End Week"
							type="number"
							value={searchParams.endWeek}
							error={formErrors.endWeek}
							placeholder="15"
							min="1"
							max="20"
							on:change={(e) => handleFieldChange(e, 'endWeek')}
							on:input={(e) => handleFieldChange(e, 'endWeek')}
						/>

						<!-- Season Type -->
						<FormField
							label="Season Type"
							type="select"
							value={searchParams.seasonType}
							options={seasonTypes}
							on:change={(e) => handleFieldChange(e, 'seasonType')}
						/>

						<!-- Form Actions -->
						<div class="form-actions">
							<button
								type="submit"
								class="btn btn-primary"
								disabled={isLoading || Object.keys(formErrors).length > 0 || (!searchParams.year && !searchParams.playerName)}
							>
								{#if isLoading}
									<span class="btn-spinner" />
									Searching...
								{:else if searchParams.playerName}
									🔍 Search {searchParams.playerName}'s Stats
								{:else}
									🔍 Search Player Stats
								{/if}
							</button>

							<button
								type="button"
								class="btn btn-secondary"
								on:click={clearSearch}
								disabled={isLoading}
							>
								🗑️ Clear
							</button>

							{#if hasResults}
								<div class="export-container">
									<ExportButton
										data={exportData}
										type="player-stats"
										variant="outline"
										size="medium"
										filename={exportFilename}
										showCount={true}
									/>
								</div>
							{/if}
						</div>
					</div>

					<!-- Form Validation Summary -->
					{#if Object.keys(formErrors).length > 0}
						<div class="validation-summary">
							<div class="validation-header">
								<span class="validation-icon">⚠️</span>
								<span class="validation-text">Please fix the following errors:</span>
							</div>
							<ul class="validation-list">
								{#each Object.entries(formErrors) as [field, errorMsg]}
									<li><strong>{field}:</strong> {errorMsg}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</form>
			</div>
		</div>

		<!-- Results Section -->
		<div class="results-section">
			<div class="results-card">
				<!-- Results Header -->
				<div class="results-header">
					<div class="results-title-section">
						<h2 class="results-title">
							📈 Search Results
							{#if playerStats.length > 0}
								<span class="results-count">({playerStats.length} of {totalResults} records)</span>
							{/if}
						</h2>
						{#if isInitialized && (searchParams.year || searchParams.playerName)}
							<p class="results-subtitle">
								{#if searchParams.playerName}
									Showing statistics for <strong>{searchParams.playerName}</strong>
									{#if searchInfo && searchInfo.yearsSearched}
										across {searchInfo.totalYearsSearched} years ({Math.min(...searchInfo.yearsSearched)}-{Math.max(...searchInfo.yearsSearched)})
									{/if}
								{:else if searchParams.year}
									Showing player statistics for <strong>{searchParams.year}</strong>
								{/if}
								{#if searchParams.team && !selectedPlayer}• <strong>{searchParams.team}</strong>{/if}
								{#if searchParams.conference}• <strong>{searchParams.conference}</strong>{/if}
								{#if searchParams.category}• <strong>{searchParams.category}</strong>{/if}
								{#if searchParams.startWeek && searchParams.endWeek}
									• Weeks <strong>{searchParams.startWeek}-{searchParams.endWeek}</strong>
								{:else if searchParams.startWeek}
									• Week <strong>{searchParams.startWeek}+</strong>
								{:else if searchParams.endWeek}
									• Week <strong>1-{searchParams.endWeek}</strong>
								{/if}
								{#if searchParams.seasonType !== 'regular'}
									• <strong>{seasonTypes.find(t => t.value === searchParams.seasonType)?.label}</strong>
								{/if}
							</p>
						{/if}
						
						<!-- Search Info Display -->
						{#if searchInfo && searchInfo.statsFoundByYear}
							<div class="search-info-summary">
								<p class="search-info-text">
									📊 Found stats in years: 
									{Object.entries(searchInfo.statsFoundByYear)
										.sort(([a], [b]) => parseInt(b) - parseInt(a))
										.map(([year, count]) => `${year} (${count})`)
										.join(', ')}
								</p>
							</div>
						{/if}
					</div>

					{#if playerStats.length > 0}
						<div class="results-actions">
							<ExportButton
								data={exportData}
								type="player-stats"
								variant="primary"
								size="small"
								filename={exportFilename}
								showCount={false}
							/>
						</div>
					{/if}
				</div>

				<!-- Results Content -->
				<div class="results-content">
					{#if error}
						<div class="error-state">
							<div class="error-icon">❌</div>
							<div class="error-content">
								<h3>Search Error</h3>
								<p>{error}</p>
								<button class="btn btn-primary" on:click={fetchPlayerStats}>
									🔄 Try Again
								</button>
							</div>
						</div>
					{:else if isLoading}
						<div class="loading-state">
							<LoadingSpinner size="large" text="Searching player statistics..." />
							{#if searchParams.playerName && !searchParams.year}
								<p class="loading-hint">Searching across multiple years for {searchParams.playerName}...</p>
							{/if}
						</div>
					{:else if !searchParams.year && !searchParams.playerName}
						<div class="empty-state">
							<div class="empty-icon">🏈</div>
							<div class="empty-content">
								<h3>Ready to Search</h3>
								<p>Enter a player name (like "Bo Jackson") or specify a year to start searching.</p>
							</div>
						</div>
					{:else if playerStats.length === 0 && isInitialized && !isLoading}
						<div class="empty-state">
							<div class="empty-icon">📊</div>
							<div class="empty-content">
								<h3>No Statistics Found</h3>
								<p>No player statistics match your current search criteria.</p>
								<small>
									{#if searchParams.playerName}
										Try searching for a different spelling of "{searchParams.playerName}" or make sure the name is correct.
										<br />
										<strong>Examples:</strong> "Bo Jackson", "Ricky Williams"
									{:else}
										Try adjusting your search parameters. For Auburn passing stats weeks 4-8 in 2023:
										<br />
										<strong>Year:</strong> 2023, <strong>Team:</strong> Auburn, <strong>Category:</strong> passing, 
										<strong>Start Week:</strong> 4, <strong>End Week:</strong> 8
									{/if}
								</small>
							</div>
						</div>
					{:else if playerStats.length > 0}
						<!-- Results Table -->
						<div class="table-section">
							<PlayerStatsTable stats={playerStats} sortable={true} />
						</div>

						<!-- Pagination -->
						{#if totalResults > pageSize}
							<div class="pagination-section">
								<Pagination 
									totalItems={totalResults} 
									{pageSize} 
									{currentPage}
									maxVisiblePages={7}
									on:pageChange={(e) => handlePageChange(e.detail)}
								/>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Theme Variables */
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

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	/* Header Styles */
	.header-section {
		text-align: center;
		margin-bottom: 3rem;
	}

	.header-content {
		max-width: 600px;
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

	.page-subtitle {
		color: var(--text-secondary);
		font-size: 1.125rem;
		margin: 0;
		line-height: 1.5;
	}

	/* Search Section */
	.search-section {
		margin-bottom: 3rem;
	}

	.search-card {
		background: var(--bg-primary);
		border-radius: 1rem;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		border: 1px solid var(--border-primary);
	}

	.search-header {
		background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
		color: white;
		padding: 2rem;
		text-align: center;
	}

	.search-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.search-subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1rem;
	}

	.search-form {
		padding: 2rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		align-items: center;
	}

	/* Button Styles */
	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		white-space: nowrap;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn-primary {
		background: var(--accent-blue);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-blue);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-tertiary);
		transform: translateY(-1px);
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

	/* Validation Styles */
	.validation-summary {
		background: var(--accent-red);
		color: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-top: 1.5rem;
	}

	.validation-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.validation-icon {
		font-size: 1.25rem;
	}

	.validation-text {
		font-weight: 600;
	}

	.validation-list {
		margin: 0;
		padding-left: 1.5rem;
	}

	.validation-list li {
		margin: 0.25rem 0;
	}

	/* Results Section */
	.results-section {
		margin-bottom: 3rem;
	}

	.results-card {
		background: var(--bg-primary);
		border-radius: 1rem;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		border: 1px solid var(--border-primary);
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 2rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-primary);
		gap: 1rem;
	}

	.results-title-section {
		flex: 1;
		min-width: 0;
	}

	.results-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.results-count {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.results-subtitle {
		color: var(--text-secondary);
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.search-info-summary {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 0.5rem;
		border: 1px solid var(--border-primary);
	}

	.search-info-text {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin: 0;
		line-height: 1.3;
	}

	.results-actions {
		flex-shrink: 0;
	}

	.results-content {
		padding: 2rem;
	}

	/* State Styles */
	.loading-state,
	.empty-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
	}

	.loading-hint {
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin-top: 1rem;
		opacity: 0.8;
	}

	.empty-icon,
	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.6;
	}

	.empty-content h3,
	.error-content h3 {
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-content p,
	.error-content p {
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		line-height: 1.5;
	}

	.empty-content small {
		color: var(--text-secondary);
		opacity: 0.8;
		font-size: 0.875rem;
		display: block;
		margin-top: 0.5rem;
		line-height: 1.4;
		max-width: 500px;
	}

	.table-section {
		margin-bottom: 2rem;
	}

	.pagination-section {
		display: flex;
		justify-content: center;
		padding-top: 2rem;
		border-top: 1px solid var(--border-primary);
	}

	.export-container {
		display: flex;
		align-items: center;
	}

	/* Player Search Styles */
	.player-search-container {
		position: relative;
		grid-column: 1 / -1;
	}

	.selected-player-badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-top: 0.5rem;
		gap: 1rem;
	}

	.selected-player-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.selected-player-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.selected-player-details {
		font-size: 0.875rem;
		opacity: 0.9;
	}

	.clear-player-btn {
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
		flex-shrink: 0;
	}

	.clear-player-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.1);
	}

	.player-search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		border-radius: 0.5rem;
		box-shadow: var(--shadow-lg);
		z-index: 50;
		max-height: 400px;
		overflow-y: auto;
		margin-top: 0.25rem;
	}

	.player-search-loading {
		padding: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.player-search-error {
		padding: 1rem;
		color: var(--accent-red);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.player-search-results {
		padding: 0.5rem 0;
	}

	.player-search-header {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-primary);
	}

	.player-result-item {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s ease;
		border-bottom: 1px solid var(--border-primary);
	}

	.player-result-item:hover {
		background: var(--bg-secondary);
	}

	.player-result-item:last-child {
		border-bottom: none;
	}

	.player-result-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.player-result-name {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.player-result-details {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.player-search-footer {
		padding: 0.75rem 1rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-style: italic;
		border-top: 1px solid var(--border-primary);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.page-title {
			font-size: 2rem;
		}
		
		.header-icon {
			width: 48px;
			height: 48px;
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.search-header,
		.search-form {
			padding: 1.5rem;
		}

		.results-header {
			padding: 1.5rem;
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.results-content {
			padding: 1.5rem;
		}

		.form-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			justify-content: center;
		}

		.results-title {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}

	@media (max-width: 480px) {
		.search-title {
			font-size: 1.25rem;
		}

		.results-title {
			font-size: 1.25rem;
		}

		.loading-state,
		.empty-state,
		.error-state {
			padding: 3rem 1rem;
		}

		.page-subtitle {
			font-size: 1rem;
		}
	}

	/* Focus and accessibility */
	.btn:focus {
		outline: 2px solid var(--accent-blue);
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
</style>