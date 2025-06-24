<!-- PlayerStatSearch.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import type { Player } from '$lib/types/api';

	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';
	let seasonType: string = 'regular';
	let selectedCategory: string = '';

	// Player search state
	let playerSearchQuery = '';
	let playerSearchResults: Player[] = [];
	let isSearchingPlayers = false;
	let playerSearchError: string | null = null;
	let showPlayerSearch = false;
	let selectedPlayer: Player | null = null;

	let pageSize: number = 16;
	let componentError: Error | null = null;
	let mounted = false;
	let isLoading: boolean = false;
	let searchQuery: string = '';
	let filteredCategories: any[] = [];
	let formErrors: Record<string, string> = {};

	// Current year for validation
	const currentYear = new Date().getFullYear();
	const yearString = currentYear.toString();

	// Store unsubscribers for cleanup
	let unsubscribers: (() => void)[] = [];

	$: currentPage = (Number($page.url.searchParams.get('skip')) || 0) / pageSize;

	// Category options with purple/teal theme focus
	let categoryOptions = [
		{ value: 'passing', label: 'Passing', icon: '🏈', description: 'Quarterback statistics' },
		{ value: 'rushing', label: 'Rushing', icon: '🏃', description: 'Running back statistics' },
		{ value: 'receiving', label: 'Receiving', icon: '🙌', description: 'Wide receiver statistics' },
		{ value: 'defense', label: 'Defense', icon: '🛡️', description: 'Defensive statistics' },
		{ value: 'kicking', label: 'Kicking', icon: '🦵', description: 'Kicker statistics' },
		{ value: 'punting', label: 'Punting', icon: '🦶', description: 'Punter statistics' },
		{
			value: 'kickReturns',
			label: 'Kick Returns',
			icon: '⚡',
			description: 'Return specialist stats'
		},
		{
			value: 'puntReturns',
			label: 'Punt Returns',
			icon: '🔄',
			description: 'Punt return statistics'
		},
		{
			value: 'interceptions',
			label: 'Interceptions',
			icon: '🤲',
			description: 'Interception statistics'
		},
		{ value: 'fumbles', label: 'Fumbles', icon: '💫', description: 'Fumble statistics' }
	];

	const seasonTypeOptions = [
		{ value: 'regular', label: 'Regular Season' },
		{ value: 'postseason', label: 'Postseason' },
		{ value: 'both', label: 'Both' }
	];

	// Filter categories based on search query
	$: filteredCategories = searchQuery.trim()
		? categoryOptions
				.filter(
					(category) =>
						category.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
						category.description.toLowerCase().includes(searchQuery.toLowerCase().trim())
				)
				.slice(0, 20) // Limit for performance
		: categoryOptions;

	// Reactive validation check
	$: isValidForm = (() => {
		console.log('🔍 Validation check:', {
			year,
			playerSearchQuery,
			selectedPlayer: selectedPlayer?.name,
			team,
			startWeek,
			endWeek
		});

		// Convert year to string and handle both string/number types
		const yearStr = String(year || '').trim();
		const hasYear = yearStr && !isNaN(Number(yearStr)) && Number(yearStr) > 0;
		
		const hasSelectedPlayer = selectedPlayer && selectedPlayer.name;
		const hasTypedPlayer = playerSearchQuery && String(playerSearchQuery).trim().length >= 2;
		
		console.log('📊 Validation flags:', {
			hasYear,
			hasSelectedPlayer,
			hasTypedPlayer,
			yearStr
		});
		
		// Must have either year OR player selection OR typed player name
		const hasValidSearchCriteria = hasYear || hasSelectedPlayer || hasTypedPlayer;
		
		// Week range validation (if provided) - also handle number/string conversion
		const hasValidWeekRange = (() => {
			const startWeekNum = startWeek ? Number(startWeek) : null;
			const endWeekNum = endWeek ? Number(endWeek) : null;
			
			if (!startWeekNum && !endWeekNum) return true;
			
			if (startWeekNum && endWeekNum) {
				return startWeekNum >= 1 && startWeekNum <= 20 && 
						endWeekNum >= 1 && endWeekNum <= 20 && 
						startWeekNum <= endWeekNum;
			}
			
			if (startWeekNum) return startWeekNum >= 1 && startWeekNum <= 20;
			if (endWeekNum) return endWeekNum >= 1 && endWeekNum <= 20;
			
			return true;
		})();
		
		const isValid = hasValidSearchCriteria && hasValidWeekRange;
		console.log('✅ Form is valid:', isValid);
		
		return isValid;
	})();

	// Player search functionality
	async function searchPlayers(): Promise<void> {
		if (!playerSearchQuery || String(playerSearchQuery).trim().length < 2) {
			playerSearchResults = [];
			return;
		}

		isSearchingPlayers = true;
		playerSearchError = null;

		try {
			const params = new URLSearchParams();
			params.set('searchTerm', String(playerSearchQuery).trim());

			// Add optional filters if available - handle type conversion
			if (team && String(team).trim()) {
				params.set('team', String(team).trim());
			}

			if (year && String(year).trim()) {
				params.set('year', String(year).trim());
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
		team = player.team;
		showPlayerSearch = false;
		playerSearchQuery = player.name;
		
		console.log(`🎯 Selected player: ${player.name} from ${player.team}`);
	}

	// Clear player selection
	function clearPlayerSelection(): void {
		selectedPlayer = null;
		playerSearchQuery = '';
		playerSearchResults = [];
		showPlayerSearch = false;
	}

	// Debounced player search
	let playerSearchTimeout: ReturnType<typeof setTimeout>;
	function handlePlayerSearchInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		playerSearchQuery = target.value;
		
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

	// Toggle category selection
	const toggleCategorySelection = (event: Event, category: string) => {
		event.preventDefault();
		selectedCategory = selectedCategory === category ? '' : category;
	};

	// Clear all selections
	const clearAllSelections = () => {
		selectedCategory = '';
		team = '';
		conference = '';
		startWeek = '';
		endWeek = '';
		seasonType = 'regular';
		clearPlayerSelection();
	};

	// Handle week input validation
	function handleWeekInput(
		event: Event & { currentTarget: HTMLInputElement },
		weekType: 'startWeek' | 'endWeek'
	) {
		const inputValue = Number(event.currentTarget.value);

		if (inputValue < 1 || inputValue > 20 || isNaN(inputValue)) {
			event.currentTarget.value = '';
			formErrors[weekType] = 'Week must be between 1 and 20';
		} else {
			delete formErrors[weekType];
		}
		formErrors = { ...formErrors };
	}

	function handleRetry() {
		componentError = null;
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
	}

	// Simple validation function
	function validateData() {
		const errors: Record<string, string> = {};
		
		if (year && String(year).trim()) {
			const yearNum = Number(year);
			if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
				errors.year = 'Please enter a valid year';
			}
		}

		// Week range validation if provided
		if (startWeek && endWeek && Number(startWeek) > Number(endWeek)) {
			errors.weekRange = 'Start week cannot be greater than end week';
		}

		formErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function getSearchURL() {
		if (!validateData()) {
			return '#';
		}

		// Build URL parameters array
		const urlParams: string[] = [];

		// Add year if provided - handle type conversion
		if (year && String(year).trim()) {
			urlParams.push(`year=${encodeURIComponent(String(year).trim())}`);
		}

		// Add player name if selected
		if (selectedPlayer && selectedPlayer.name) {
			urlParams.push(`playerName=${encodeURIComponent(selectedPlayer.name)}`);
		} else if (playerSearchQuery && String(playerSearchQuery).trim().length >= 2) {
			// Also handle case where user typed a name but didn't select from dropdown
			urlParams.push(`playerName=${encodeURIComponent(String(playerSearchQuery).trim())}`);
		}

		// Add team (with name trimming)
		if (team && String(team).trim()) {
			const schoolName = statsNameTrim(String(team).trim());
			if (schoolName) {
				urlParams.push(`team=${encodeURIComponent(schoolName)}`);
			}
		}

		// Add conference
		if (conference && String(conference).trim()) {
			urlParams.push(`conference=${encodeURIComponent(String(conference).trim())}`);
		}

		// Add week range - handle type conversion
		if (startWeek && String(startWeek).trim()) {
			urlParams.push(`startWeek=${encodeURIComponent(String(startWeek))}`);
		}
		if (endWeek && String(endWeek).trim()) {
			urlParams.push(`endWeek=${encodeURIComponent(String(endWeek))}`);
		}

		// Add season type if not regular
		if (seasonType && seasonType !== 'regular') {
			urlParams.push(`seasonType=${encodeURIComponent(seasonType)}`);
		}

		// Add category
		if (selectedCategory && String(selectedCategory).trim()) {
			urlParams.push(`category=${encodeURIComponent(selectedCategory)}`);
		}

		// Add pagination defaults
		urlParams.push(`limit=50`);
		urlParams.push(`skip=0`);

		const queryString = urlParams.join('&');
		const finalURL = `/player-stats?${queryString}`;
		
		console.log('🔗 Generated URL:', finalURL);
		
		return finalURL;
	}

	function handleSubmit() {
		if (validateData()) {
			const url = getSearchURL();
			console.log('🚀 Navigating to:', url);
			goto(url);
		} else {
			console.error('❌ Form validation failed:', formErrors);
		}
	}

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		// Clean up all subscriptions
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers = [];
		
		// Clear player search timeout
		if (playerSearchTimeout) {
			clearTimeout(playerSearchTimeout);
		}
	});
</script>

<ErrorBoundary bind:error={componentError} on:retry={handleRetry}>
	<div class="player-select-wrapper" class:light={!$theme} class:dark={$theme}>
		<!-- Hero Section -->
		<div class="hero-section">
			<div class="hero-content">
				<div class="hero-icon-wrapper">
					<img class="hero-icon" src="/playerstats.png" alt="Player Statistics" />
					<h1 class="hero-title">Player Statistics</h1>
				</div>
				<p class="hero-subtitle">
					Search by player name (like "Bo Jackson") or filter by year and other criteria
				</p>
			</div>
		</div>

		<!-- Main Selection Interface -->
		<div class="selection-interface">
			<!-- Left Panel: Search Controls -->
			<div class="selection-panel">
				<div class="panel-card">
					<div class="panel-header">
						<h2 class="panel-title">
							🔍 Search Configuration
							{#if selectedCategory || selectedPlayer}
								<span class="panel-count">({selectedCategory ? 'Category' : ''}{selectedCategory && selectedPlayer ? ' & ' : ''}{selectedPlayer ? 'Player' : ''} Selected)</span>
							{/if}
						</h2>
						<p class="panel-subtitle">
							Choose search criteria to find specific player statistics
						</p>
					</div>

					<!-- Controls Section -->
					<div class="controls-section">
						<!-- Player Name Search -->
						<div class="player-search-container">
							<label for="player-search-input" class="control-label">🎯 Search by Player Name (Optional)</label>
							<input
								type="text"
								class="control-input search-input"
								id="player-search-input"
								bind:value={playerSearchQuery}
								on:input={handlePlayerSearchInput}
								placeholder="e.g., Ricky Williams, Bo Jackson..."
								autocomplete="off"
							/>
							{#if playerSearchQuery && !selectedPlayer}
								<button
									class="clear-search-btn"
									on:click={clearPlayerSelection}
									type="button"
									aria-label="Clear player search"
								>
									✕
								</button>
							{/if}

							{#if selectedPlayer}
								<div class="selected-player-badge">
									<div class="selected-player-info">
										<span class="selected-player-name">{selectedPlayer.name}</span>
										<span class="selected-player-details">
											{selectedPlayer.position} • {selectedPlayer.team}
											{#if selectedPlayer.jersey} • #{selectedPlayer.jersey}{/if}
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
											{#each playerSearchResults.slice(0, 8) as player}
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
											{#if playerSearchResults.length > 8}
												<div class="player-search-footer">
													Showing first 8 results. Refine your search for more specific results.
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Year and Season Type -->
						<div class="control-row">
							<div class="control-group">
								<label for="year-input" class="control-label">
									📅 Year {selectedPlayer || (playerSearchQuery && playerSearchQuery.trim().length >= 2) ? '(Optional)' : '(Required)'}
								</label>
								<input
									type="number"
									class="control-input"
									id="year-input"
									bind:value={year}
									min={1900}
									max={currentYear + 1}
									placeholder={selectedPlayer || (playerSearchQuery && playerSearchQuery.trim().length >= 2) ? "All years" : yearString}
									required={!(selectedPlayer || (playerSearchQuery && playerSearchQuery.trim().length >= 2))}
								/>
								{#if formErrors.year}
									<span class="error-text">{formErrors.year}</span>
								{/if}
							</div>

							<div class="control-group">
								<label for="season-type" class="control-label"> 🏆 Season Type </label>
								<select class="control-select" id="season-type" bind:value={seasonType}>
									{#each seasonTypeOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
						</div>

						<!-- Team and Conference -->
						<div class="control-row">
							<div class="control-group">
								<label for="team-input" class="control-label"> 🏈 Team {selectedPlayer ? '(Auto-filled)' : '(Optional)'} </label>
								<input
									type="text"
									class="control-input"
									id="team-input"
									bind:value={team}
									placeholder="e.g., Auburn"
									readonly={selectedPlayer ? true : false}
									class:readonly={selectedPlayer ? true : false}
								/>
								{#if selectedPlayer}
									<small class="input-helper">Team auto-filled from selected player</small>
								{/if}
							</div>

							<div class="control-group">
								<label for="conference-input" class="control-label">
									🏟️ Conference (Optional)
								</label>
								<input
									type="text"
									class="control-input"
									id="conference-input"
									bind:value={conference}
									placeholder="e.g., SEC"
								/>
							</div>
						</div>

						<!-- Week Range -->
						<div class="control-row">
							<div class="control-group">
								<label for="start-week" class="control-label"> 📊 Start Week </label>
								<input
									type="number"
									class="control-input"
									id="start-week"
									bind:value={startWeek}
									min={1}
									max={14}
									placeholder="1"
									on:input={(e) => handleWeekInput(e, 'startWeek')}
								/>
								{#if formErrors.startWeek}
									<span class="error-text">{formErrors.startWeek}</span>
								{/if}
							</div>

							<div class="control-group">
								<label for="end-week" class="control-label"> 📊 End Week </label>
								<input
									type="number"
									class="control-input"
									id="end-week"
									bind:value={endWeek}
									min={1}
									max={14}
									placeholder="14"
									on:input={(e) => handleWeekInput(e, 'endWeek')}
								/>
								{#if formErrors.endWeek}
									<span class="error-text">{formErrors.endWeek}</span>
								{/if}
							</div>
						</div>

						{#if formErrors.weekRange}
							<div class="error-banner">
								⚠️ {formErrors.weekRange}
							</div>
						{/if}

						<!-- Category Search -->
						<div class="control-group">
							<label for="category-search" class="control-label"> 🔍 Search Categories </label>
							<input
								type="text"
								class="control-input search-input"
								id="category-search"
								bind:value={searchQuery}
								on:input={handleSearchInput}
								placeholder="Type to filter categories..."
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
					</div>

					<!-- Categories Section -->
					<div class="categories-section">
						<div class="categories-header">
							<h3 class="categories-title">Statistical Categories</h3>
							<div class="categories-meta">
								{#if selectedCategory}
									<span class="selection-complete">✓ Category selected</span>
								{:else}
									<span class="selection-incomplete">Select a category</span>
								{/if}
							</div>
						</div>

						<div class="categories-container">
							{#if isLoading}
								<div class="loading-categories">
									<LoadingSpinner size="small" text="Loading categories..." />
								</div>
							{:else if filteredCategories.length > 0}
								<div class="categories-grid">
									{#each filteredCategories as category (category.value)}
										<button
											class="category-button"
											class:selected={selectedCategory === category.value}
											on:click={(event) => toggleCategorySelection(event, category.value)}
											type="button"
										>
											<div class="category-icon">{category.icon}</div>
											<div class="category-content">
												<span class="category-name">{category.label}</span>
												<span class="category-description">{category.description}</span>
											</div>
											{#if selectedCategory === category.value}
												<div class="category-selected-icon">✓</div>
											{/if}
										</button>
									{/each}
								</div>
								{#if searchQuery && categoryOptions.length > filteredCategories.length}
									<div class="search-info">
										<p class="search-results-text">
											Showing {filteredCategories.length} of {categoryOptions.length} categories
										</p>
									</div>
								{/if}
							{:else if searchQuery}
								<div class="empty-search">
									<div class="empty-icon">🔍</div>
									<p class="empty-message">No categories found for "{searchQuery}"</p>
									<button
										class="clear-search-btn-alt"
										on:click={() => (searchQuery = '')}
										type="button"
									>
										Clear Search
									</button>
								</div>
							{:else}
								<div class="categories-placeholder">
									<div class="placeholder-icon">📊</div>
									<p class="placeholder-message">Categories loaded and ready</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Panel: Search Summary & Submit -->
			<div class="selected-panel">
				<!-- Search Summary Card -->
				<div class="panel-card summary-card">
					<!-- Summary Header -->
					<div class="panel-header">
						<h2 class="panel-title">📋 Search Summary</h2>
						{#if selectedCategory || team || conference || selectedPlayer}
							<button class="clear-all-btn" on:click={clearAllSelections} type="button">
								Clear All
							</button>
						{/if}
					</div>

					<!-- Summary Content -->
					<div class="summary-container">
						{#if year || selectedCategory || team || conference || startWeek || endWeek || selectedPlayer}
							<div class="summary-list">
								<!-- Player Selection -->
								{#if selectedPlayer}
									<div class="summary-section">
										<h4 class="summary-section-title">Selected Player</h4>
										<div class="summary-item">
											<span class="summary-label">🎯 Player:</span>
											<span class="summary-value">
												{selectedPlayer.name}
											</span>
										</div>
										<div class="summary-item">
											<span class="summary-label">📍 Position:</span>
											<span class="summary-value">
												{selectedPlayer.position}
											</span>
										</div>
										<div class="summary-item">
											<span class="summary-label">🏈 Team:</span>
											<span class="summary-value">
												{selectedPlayer.team}
											</span>
										</div>
									</div>
								{/if}

								<!-- Required Fields -->
								<div class="summary-section">
									<h4 class="summary-section-title">Search Parameters</h4>
									<div class="summary-item">
										<span class="summary-label">📅 Year:</span>
										<span class="summary-value" class:missing={!year}>
											{year || (selectedPlayer ? 'Add year for stats' : 'Required')}
										</span>
									</div>
								</div>

								<!-- Optional Fields -->
								<div class="summary-section">
									<h4 class="summary-section-title">Search Filters</h4>
									<div class="summary-item">
										<span class="summary-label">📊 Category:</span>
										<span class="summary-value" class:missing={!selectedCategory}>
											{#if selectedCategory}
												{categoryOptions.find((cat) => cat.value === selectedCategory)?.label ||
													selectedCategory}
											{:else}
												All categories
											{/if}
										</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">🏈 Team:</span>
										<span class="summary-value" class:missing={!team}>
											{team || 'All teams'}
										</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">🏟️ Conference:</span>
										<span class="summary-value" class:missing={!conference}>
											{conference || 'All conferences'}
										</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">📊 Week Range:</span>
										<span class="summary-value">
											{#if startWeek && endWeek}
												Week {startWeek} - {endWeek}
											{:else if startWeek}
												Week {startWeek}+
											{:else if endWeek}
												Week 1 - {endWeek}
											{:else}
												All weeks
											{/if}
										</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">🏆 Season:</span>
										<span class="summary-value">
											{seasonTypeOptions.find((opt) => opt.value === seasonType)?.label ||
												'Regular Season'}
										</span>
									</div>
								</div>
							</div>
						{:else}
							<div class="empty-summary">
								<div class="empty-icon">📊</div>
								<h3 class="empty-title">Configure Your Search</h3>
								<p class="empty-message">
									Fill in the search parameters to analyze player statistics
								</p>
								<small class="empty-hint">
									💡 Try searching for a specific player like "Ricky Williams" or filter by team and category
								</small>
							</div>
						{/if}
					</div>
				</div>

				<!-- Submit Card -->
				<div class="panel-card submit-card">
					<div class="submit-content">
						<div class="submit-info">
							{#if isValidForm}
								<h3 class="submit-title">🚀 Ready to Search</h3>
								<p class="submit-description">
									{#if selectedPlayer}
										Search {selectedPlayer.name}'s statistics
										{#if year}for {year}{:else}across all available years{/if}
									{:else if playerSearchQuery && playerSearchQuery.trim().length >= 2}
										Search for "{playerSearchQuery}"
										{#if year}in {year}{:else}across all available years{/if}
									{:else if year}
										Search player statistics for {year}
										{#if selectedCategory}
											in the {categoryOptions.find((cat) => cat.value === selectedCategory)?.label ||
												selectedCategory} category
										{/if}
										{#if team}
											for {team}
										{/if}
									{/if}
								</p>
							{:else}
								<h3 class="submit-title">⚠️ Configuration Needed</h3>
								<p class="submit-description">
									{#if !year && !selectedPlayer && (!playerSearchQuery || playerSearchQuery.trim().length < 2)}
										Please enter a year or search for a specific player to continue
									{:else if formErrors.year}
										Please enter a valid year (1900-{currentYear + 1}) or search for a player
									{:else if formErrors.weekRange}
										Please fix the week range issue
									{:else}
										Please check your search configuration
									{/if}
								</p>
							{/if}
						</div>

						<div class="submit-actions">
							<a
								href={isValidForm ? getSearchURL() : '#'}
								data-sveltekit-prefetch
								class="submit-link"
								class:disabled={!isValidForm || isLoading}
							>
								<button
									type="button"
									class="submit-button"
									disabled={!isValidForm || isLoading}
									on:click={handleSubmit}
								>
									{#if isLoading}
										<span class="btn-spinner" />
										Searching...
									{:else if selectedPlayer}
										📊 Search {selectedPlayer.name}'s Stats
									{:else if playerSearchQuery && playerSearchQuery.trim().length >= 2}
										📊 Search for "{playerSearchQuery}"
									{:else}
										📊 Search Player Stats
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
		--accent-teal: #14b8a6;
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
		--accent-teal: #2dd4bf;
	}

	/* ========================================
	   LAYOUT & STRUCTURE
	======================================== */
	.player-select-wrapper {
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
		background: linear-gradient(135deg, var(--accent-purple), var(--accent-teal));
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
		background: linear-gradient(135deg, var(--accent-purple), var(--accent-teal));
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

	.clear-all-btn {
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

	.clear-all-btn:hover {
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

	#player-search-input {
		margin-top: 0.5rem;
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
		border-color: var(--accent-purple);
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
		background: var(--bg-primary);
	}

	.control-select:disabled,
	.control-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.control-input.readonly {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		cursor: not-allowed;
		opacity: 0.8;
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

	.input-helper {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-style: italic;
		margin-top: 0.25rem;
	}

	.error-text {
		font-size: 0.75rem;
		color: var(--accent-red);
		margin-top: 0.25rem;
	}

	.error-banner {
		background: var(--accent-red);
		color: white;
		padding: 1rem;
		border-radius: 0.75rem;
		margin-top: 1rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* ========================================
	   PLAYER SEARCH STYLES
	======================================== */
	.player-search-container {
		position: relative;
		margin-bottom: 1rem;
	}

	.selected-player-badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		margin-top: 0.5rem;
		gap: 1rem;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
		border-radius: 0.75rem;
		box-shadow: var(--shadow-lg);
		z-index: 50;
		max-height: 300px;
		overflow-y: auto;
		margin-top: 0.25rem;
		animation: fadeInDown 0.2s ease-out;
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	/* ========================================
	   CATEGORIES SECTION
	======================================== */
	.categories-section {
		border-top: 1px solid var(--border-primary);
	}

	.categories-header {
		padding: 1.5rem 2rem 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-secondary);
	}

	.categories-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.categories-meta {
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

	.categories-container {
		min-height: 400px;
		max-height: 500px;
		overflow-y: auto;
		padding: 1rem 2rem 2rem 2rem;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.category-button {
		display: flex;
		align-items: center;
		gap: 1rem;
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

	.category-button:hover {
		border-color: var(--accent-purple);
		background: var(--bg-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.category-button.selected {
		background: linear-gradient(135deg, var(--accent-purple), var(--accent-teal));
		border-color: var(--accent-purple);
		color: white;
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.category-button.selected::before {
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

	.category-icon {
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background: rgba(139, 92, 246, 0.1);
		border-radius: 0.5rem;
		flex-shrink: 0;
	}

	.category-button.selected .category-icon {
		background: rgba(255, 255, 255, 0.2);
	}

	.category-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.category-name {
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.3;
	}

	.category-description {
		font-size: 0.75rem;
		opacity: 0.8;
		line-height: 1.3;
	}

	.category-selected-icon {
		font-size: 1.125rem;
		animation: checkmark 0.3s ease-out;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
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
	.loading-categories,
	.empty-search,
	.categories-placeholder {
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
		background: var(--accent-purple);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.2s ease;
	}

	.clear-search-btn-alt:hover {
		background: var(--accent-teal);
		transform: translateY(-1px);
	}

	/* ========================================
	   SUMMARY PANEL
	======================================== */
	.summary-container {
		padding: 2rem;
		min-height: auto;
	}

	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.summary-section {
		background: var(--bg-secondary);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid var(--border-primary);
	}

	.summary-section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		text-align: right;
	}

	.summary-value.missing {
		color: var(--text-secondary);
		opacity: 0.7;
		font-style: italic;
	}

	.empty-summary {
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

	.empty-hint {
		color: var(--text-secondary);
		opacity: 0.8;
		font-size: 0.75rem;
		display: block;
		margin-top: 0.5rem;
	}

	.summary-card {
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
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.submit-info {
		flex: 1;
		min-width: 200px;
		text-align: center;
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
		background: linear-gradient(135deg, var(--accent-purple), var(--accent-teal));
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
		box-shadow: var(--shadow-lg), 0 10px 20px rgba(139, 92, 246, 0.3);
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

		.categories-container {
			max-height: 400px;
		}
	}

	/* Mobile Phones */
	@media (max-width: 768px) {
		.player-select-wrapper {
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

		.categories-header {
			padding: 1rem 1.25rem;
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}

		.categories-container {
			padding: 1rem 1.25rem 1.25rem 1.25rem;
			min-height: 300px;
			max-height: 350px;
		}

		.categories-grid {
			grid-template-columns: 1fr;
		}

		.summary-container {
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

		.category-button {
			padding: 0.75rem;
		}

		.category-icon {
			width: 2rem;
			height: 2rem;
			font-size: 1.25rem;
		}

		.player-search-dropdown {
			max-height: 250px;
		}
	}

	/* Small Mobile */
	@media (max-width: 480px) {
		.player-select-wrapper {
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

		.categories-header {
			padding: 0.75rem 1rem;
		}

		.categories-container {
			padding: 0.75rem 1rem 1rem 1rem;
		}

		.summary-container {
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

		.category-button {
			padding: 0.75rem;
			gap: 0.75rem;
		}

		.category-icon {
			width: 1.75rem;
			height: 1.75rem;
			font-size: 1rem;
		}

		.player-search-dropdown {
			max-height: 200px;
		}
	}

	/* ========================================
	   ACCESSIBILITY & FOCUS STATES
	======================================== */
	.category-button:focus,
	.control-select:focus,
	.control-input:focus,
	.submit-button:focus,
	.clear-all-btn:focus,
	.clear-search-btn:focus,
	.clear-player-btn:focus {
		outline: 2px solid var(--accent-purple);
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
		.category-button,
		.control-select,
		.control-input,
		.submit-button {
			border-width: 2px;
		}
	}
</style>