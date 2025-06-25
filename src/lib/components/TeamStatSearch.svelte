<!-- TeamStatSearch.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';

	// Form state
	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';
	let seasonType: 'regular' | 'postseason' | 'both' = 'regular';

	// UI state
	let isLoading = false;
	let mounted = false;
	let searchQuery = '';
	let selectedCategories: string[] = [];

	// Pagination
	let pageSize: number = 16;
	$: currentPage = (Number($page.url.searchParams.get('skip')) || 0) / pageSize;

	// Available stat categories for team statistics
	const statCategories = [
		{
			id: 'offense',
			name: 'Offensive Stats',
			description: 'Rushing, passing, scoring statistics',
			icon: '🏈'
		},
		{
			id: 'defense',
			name: 'Defensive Stats',
			description: 'Tackles, interceptions, sacks',
			icon: '🛡️'
		},
		{
			id: 'special',
			name: 'Special Teams',
			description: 'Kicking, punting, returns',
			icon: '⚡'
		},
		{
			id: 'turnovers',
			name: 'Turnover Stats',
			description: 'Fumbles, interceptions, recovery',
			icon: '🔄'
		},
		{
			id: 'penalties',
			name: 'Penalty Stats',
			description: 'Penalties, yards, discipline',
			icon: '🚩'
		},
		{
			id: 'efficiency',
			name: 'Efficiency Metrics',
			description: 'Third down, red zone, time of possession',
			icon: '📊'
		}
	];

	// Filtered categories based on search
	$: filteredCategories = statCategories.filter(
		(category) =>
			category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			category.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Form validation
	$: isYearValid =
		year !== '' && Number(year) >= 1900 && Number(year) <= new Date().getFullYear() + 1;
	$: isWeekRangeValid =
		(startWeek === '' || (startWeek >= 1 && startWeek <= 14)) &&
		(endWeek === '' || (endWeek >= 1 && endWeek <= 14)) &&
		(startWeek === '' || endWeek === '' || startWeek <= endWeek);
	$: isFormValid = isYearValid && isWeekRangeValid;

	// Search summary for right panel
	$: searchSummary = {
		year: year || 'Not specified',
		team: team || 'All teams',
		conference: conference || 'All conferences',
		weekRange:
			startWeek && endWeek
				? `Week ${startWeek}-${endWeek}`
				: startWeek
				? `From week ${startWeek}`
				: endWeek
				? `Through week ${endWeek}`
				: 'Full season',
		seasonType: seasonType.charAt(0).toUpperCase() + seasonType.slice(1),
		categories: selectedCategories.length > 0 ? selectedCategories.join(', ') : 'All categories'
	};

	// Handle week input validation
	function handleWeekInput(
		event: Event & { currentTarget: HTMLInputElement },
		weekType: 'startWeek' | 'endWeek'
	) {
		const inputValue = Number(event.currentTarget.value);

		if (inputValue < 1 || inputValue > 14 || isNaN(inputValue)) {
			event.currentTarget.value = '';
		}
	}

	// Handle category selection
	function toggleCategory(categoryId: string) {
		if (selectedCategories.includes(categoryId)) {
			selectedCategories = selectedCategories.filter((id) => id !== categoryId);
		} else {
			selectedCategories = [...selectedCategories, categoryId];
		}
	}

	// Clear all selected categories
	function clearAllCategories() {
		selectedCategories = [];
		team = '';
		conference = '';
		startWeek = '';
		endWeek = '';
		seasonType = 'regular';
	}

	// Handle form submission
	async function handleSubmit() {
		if (!isFormValid) return;

		isLoading = true;

		// Simulate brief loading
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Trim school mascot name if present
		let schoolName = statsNameTrim(team);

		// Construct query parameters
		const queryParams = [
			year && `year=${encodeURIComponent(year)}`,
			schoolName && `team=${encodeURIComponent(schoolName)}`,
			conference && `conference=${encodeURIComponent(conference)}`,
			startWeek && `startWeek=${startWeek}`,
			endWeek && `endWeek=${endWeek}`,
			seasonType !== 'regular' && `seasonType=${seasonType}`,
			selectedCategories.length > 0 && `categories=${selectedCategories.join(',')}`,
			`limit=${pageSize}`,
			`skip=${currentPage * pageSize}`
		]
			.filter(Boolean)
			.join('&');

		const apiUrl = `/team-stats?${queryParams}`;

		try {
			await goto(apiUrl);
		} catch (error) {
			console.error('Navigation failed:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		mounted = true;

		// Auto-populate current year
		if (!year) {
			year = new Date().getFullYear().toString();
		}
	});
</script>

<svelte:head>
	<title>Team Statistics Search - FIELDWING</title>
	<meta name="description" content="Search for historical team data" />
</svelte:head>

<div class="team-search-wrapper" class:light={!$theme} class:dark={$theme}>
	<!-- Hero Section -->
	<div class="hero-section">
		<div class="hero-content">
			<div class="hero-icon-wrapper">
				<img 
					class="hero-icon" 
					src="/teamstats.png" 
					alt="Team Statistics"
					width="64"
					height="64"
					loading="eager"
					decoding="async"
				/>
				<h1 class="hero-title">Team Statistics</h1>
			</div>
			<p class="hero-subtitle">View historical team stats by seasons, conferences, and more</p>
		</div>
	</div>

	<!-- Main Selection Interface -->
	<div class="selection-interface">
		<!-- Left Panel: Search Controls -->
		<div class="selection-panel">
			<div class="panel-card">
				<!-- Panel Header -->
				<div class="panel-header">
					<h2 class="panel-title">
						🎯 Team Configuration
						{#if selectedCategories.length > 0}
							<span class="panel-count">({selectedCategories.length} categories)</span>
						{/if}
					</h2>
					<p class="panel-subtitle">Configure your team statistics search parameters</p>
				</div>

				<!-- Controls Section -->
				<div class="controls-section">
					<!-- Required Fields Section -->
					<div class="control-group">
						<label for="year" class="control-label">
							📅 Season Year <span class="required-indicator">*</span>
						</label>
						<input
							id="year"
							type="number"
							bind:value={year}
							min="1900"
							max={new Date().getFullYear() + 1}
							class="control-input"
							class:error={year !== '' && !isYearValid}
							placeholder="e.g., 2024"
							required
						/>
						{#if year !== '' && !isYearValid}
							<span class="error-message"
								>Please enter a valid year (1900-{new Date().getFullYear() + 1})</span
							>
						{/if}
					</div>

					<!-- Filter Controls -->
					<div class="control-row">
						<div class="control-group">
							<label for="team" class="control-label">🏈 Team Name</label>
							<input
								id="team"
								type="text"
								bind:value={team}
								class="control-input"
								placeholder="e.g., Alabama, Ohio State"
							/>
						</div>

						<div class="control-group">
							<label for="conference" class="control-label">🏟️ Conference</label>
							<input
								id="conference"
								type="text"
								bind:value={conference}
								class="control-input"
								placeholder="e.g., SEC, Big Ten"
							/>
						</div>
					</div>

					<div class="control-row">
						<div class="control-group">
							<label for="start-week" class="control-label">📅 Start Week</label>
							<input
								id="start-week"
								type="number"
								bind:value={startWeek}
								on:input={(e) => handleWeekInput(e, 'startWeek')}
								min="1"
								max="14"
								class="control-input"
								placeholder="1-14"
							/>
						</div>

						<div class="control-group">
							<label for="end-week" class="control-label">📅 End Week</label>
							<input
								id="end-week"
								type="number"
								bind:value={endWeek}
								on:input={(e) => handleWeekInput(e, 'endWeek')}
								min="1"
								max="14"
								class="control-input"
								placeholder="1-14"
							/>
						</div>
					</div>

					{#if !isWeekRangeValid}
						<span class="error-message"
							>Please ensure start week is less than or equal to end week</span
						>
					{/if}

					<div class="control-group">
						<label for="season-type" class="control-label">⚡ Season Type</label>
						<select id="season-type" bind:value={seasonType} class="control-select">
							<option value="regular">Regular Season</option>
							<option value="postseason">Postseason Only</option>
							<option value="both">Both Regular & Postseason</option>
						</select>
					</div>

					<!-- Search Input for Categories -->
					{#if statCategories.length > 0}
						<div class="control-group">
							<label for="category-search" class="control-label">🔍 Search Categories</label>
							<input
								type="text"
								class="control-input search-input"
								id="category-search"
								bind:value={searchQuery}
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
					{/if}
				</div>

				<!-- Categories Section -->
				<div class="categories-section">
					<div class="categories-header">
						<h3 class="categories-title">Available Categories</h3>
						<div class="categories-meta">
							{#if selectedCategories.length > 0}
								<span class="selection-complete">✓ {selectedCategories.length} selected</span>
							{:else}
								<span class="selection-incomplete">0 selected</span>
							{/if}
						</div>
					</div>

					<div class="categories-container">
						{#if filteredCategories.length > 0}
							<div class="categories-grid">
								{#each filteredCategories as category (category.id)}
									<button
										class="category-button"
										class:selected={selectedCategories.includes(category.id)}
										on:click={() => toggleCategory(category.id)}
										type="button"
									>
										<div class="category-icon">{category.icon}</div>
										<div class="category-content">
											<span class="category-name">{category.name}</span>
											<span class="category-description">{category.description}</span>
										</div>
										{#if selectedCategories.includes(category.id)}
											<span class="category-selected-icon">✓</span>
										{/if}
									</button>
								{/each}
							</div>

							{#if searchQuery && statCategories.length > filteredCategories.length}
								<div class="search-info">
									<p class="search-results-text">
										Showing {filteredCategories.length} of {statCategories.length} categories
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
						{:else if statCategories.length === 0}
							<div class="select-categories-placeholder">
								<div class="placeholder-icon">📊</div>
								<p class="placeholder-message">No categories available</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Right Panel: Search Summary & Submit -->
		<div class="selected-panel">
			<!-- Search Summary Card -->
			<div class="panel-card selected-teams-card">
				<!-- Summary Header -->
				<div class="panel-header">
					<h2 class="panel-title">📋 Search Summary</h2>
					{#if selectedCategories.length > 0 || team || conference}
						<div class="header-actions">
							<button class="clear-all-btn" on:click={clearAllCategories} type="button">
								Clear All
							</button>
						</div>
					{/if}
				</div>

				<!-- Summary Content -->
				<div class="selected-teams-container">
					{#if year || selectedCategories.length > 0 || team || conference || startWeek || endWeek}
						<div class="search-summary">
							<h4 class="summary-title">📊 Search Parameters</h4>
							<div class="summary-item">
								<span class="summary-label">📅 Year:</span>
								<span class="summary-value" class:missing={!year}>{searchSummary.year}</span>
							</div>
							<div class="summary-item">
								<span class="summary-label">⚡ Season Type:</span>
								<span class="summary-value">{searchSummary.seasonType}</span>
							</div>
							{#if team}
								<div class="summary-item">
									<span class="summary-label">🏈 Team:</span>
									<span class="summary-value">{searchSummary.team}</span>
								</div>
							{/if}
							{#if conference}
								<div class="summary-item">
									<span class="summary-label">🏟️ Conference:</span>
									<span class="summary-value">{searchSummary.conference}</span>
								</div>
							{/if}
							{#if startWeek || endWeek}
								<div class="summary-item">
									<span class="summary-label">📅 Week Range:</span>
									<span class="summary-value">{searchSummary.weekRange}</span>
								</div>
							{/if}
							{#if selectedCategories.length > 0}
								<div class="summary-item">
									<span class="summary-label">📋 Categories:</span>
									<span class="summary-value">{selectedCategories.length} selected</span>
								</div>
							{/if}
						</div>
					{:else}
						<div class="empty-selected">
							<div class="empty-icon">📊</div>
							<h3 class="empty-title">Configure Your Search</h3>
							<p class="empty-message">Fill in the search fields to view team stats</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Submit Card -->
			<div class="panel-card submit-card">
				<div class="submit-content">
					{#if isFormValid}
						<div class="submit-info">
							<h3 class="submit-title">🚀 Ready to Search</h3>
							<p class="submit-description">
								Search team statistics for {year}
								{#if team}
									for {team}
								{/if}
								{#if conference}
									in the {conference}
								{/if}
								{#if selectedCategories.length > 0}
									({selectedCategories.length} categories selected)
								{/if}
							</p>
						</div>
					{:else}
						<div class="submit-info">
							<h3 class="submit-title">⚠️ Configuration Needed</h3>
							<p class="submit-description">
								{#if !year}
									Please enter a year to search for team statistics
								{:else if !isYearValid}
									Please enter a valid year (1900-{new Date().getFullYear() + 1})
								{:else if !isWeekRangeValid}
									Please fix the week range issue
								{:else}
									Please check your search configuration
								{/if}
							</p>
						</div>
					{/if}

					<div class="submit-actions">
						<button
							type="button"
							class="submit-button"
							class:loading={isLoading}
							disabled={!isFormValid || isLoading}
							on:click={handleSubmit}
						>
							{#if isLoading}
								<span class="btn-spinner" />
								Searching...
							{:else if isFormValid}
								📊 Search Team Stats
							{:else if !year}
								Enter Year
							{:else}
								Fix Configuration
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

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
		--accent-pink: #ec4899;
		--accent-cream: #ffe7a9;
		--accent-rose: #f43f5e;
		--accent-orange: #ffcf7c;
		--accent-purple: #8b5cf6;
		--accent-green: #10b981;
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
		--accent-pink: #f472b6;
		--accent-cream: #fbbf24;
		--accent-rose: #fb7185;
		--accent-orange: #fb923c;
		--accent-purple: #a78bfa;
		--accent-green: #34d399;
		--accent-red: #f87171;
	}

	/* ========================================
	   LAYOUT & STRUCTURE
	======================================== */
	.team-search-wrapper {
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
		background: linear-gradient(135deg, var(--accent-pink), var(--accent-cream));
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
		background: linear-gradient(135deg, var(--accent-pink), var(--accent-cream));
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

	.required-indicator {
		color: var(--accent-red);
		font-weight: 600;
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
		border-color: var(--accent-pink);
		box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
		background: var(--bg-primary);
	}

	.control-input.error {
		border-color: var(--accent-red);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.control-select:disabled,
	.control-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
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

	.error-message {
		color: var(--accent-red);
		font-size: 0.75rem;
		font-weight: 500;
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
		background: var(--accent-pink);
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

	.category-button:hover:not(.disabled) {
		border-color: var(--accent-pink);
		background: var(--bg-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.category-button.selected {
		background: linear-gradient(135deg, var(--accent-pink), var(--accent-cream));
		border-color: var(--accent-pink);
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
		flex-shrink: 0;
		margin-right: 0.75rem;
	}

	.category-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.category-name {
		font-weight: 500;
		line-height: 1.3;
	}

	.category-description {
		font-size: 0.75rem;
		opacity: 0.8;
		line-height: 1.3;
	}

	.category-selected-icon {
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
	.empty-search,
	.select-categories-placeholder {
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
		background: var(--accent-pink);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.2s ease;
	}

	.clear-search-btn-alt:hover {
		background: var(--accent-rose);
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

	.summary-value.missing {
		color: var(--text-secondary);
		font-style: italic;
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
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.submit-info {
		flex: 1;
		text-align: center;
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
		margin-top: 1rem;
	}

	.submit-button {
		width: 100%;
		background: linear-gradient(135deg, var(--accent-pink), var(--accent-cream));
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
		justify-content: center;
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
		box-shadow: var(--shadow-lg), 0 10px 20px rgba(236, 72, 153, 0.3);
	}

	.submit-button:disabled {
		background: var(--text-secondary);
		cursor: not-allowed;
		transform: none;
		box-shadow: var(--shadow-sm);
	}

	.submit-button.loading {
		pointer-events: none;
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
		.team-search-wrapper {
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

		.category-button {
			padding: 1rem;
		}

		.category-icon {
			font-size: 1.25rem;
		}
	}

	/* Small Mobile */
	@media (max-width: 480px) {
		.team-search-wrapper {
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

		.category-button {
			padding: 0.75rem;
		}

		.category-icon {
			font-size: 1rem;
			margin-right: 0.5rem;
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
	.clear-search-btn-alt:focus {
		outline: 2px solid var(--accent-pink);
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
