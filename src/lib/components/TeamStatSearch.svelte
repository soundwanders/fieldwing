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
	$: filteredCategories = statCategories.filter(category =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		category.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Form validation
	$: isYearValid = year !== '' && Number(year) >= 1900 && Number(year) <= new Date().getFullYear() + 1;
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
		weekRange: startWeek && endWeek ? `Week ${startWeek}-${endWeek}` : 
				  startWeek ? `From week ${startWeek}` :
				  endWeek ? `Through week ${endWeek}` : 'Full season',
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
			selectedCategories = selectedCategories.filter(id => id !== categoryId);
		} else {
			selectedCategories = [...selectedCategories, categoryId];
		}
	}

	// Clear all selected categories
	function clearAllCategories() {
		selectedCategories = [];
	}

	// Handle form submission
	async function handleSubmit() {
		if (!isFormValid) return;
		
		isLoading = true;
		
		// Simulate brief loading for better UX
		await new Promise(resolve => setTimeout(resolve, 300));
		
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
	<meta name="description" content="Search and analyze comprehensive team statistics across seasons, conferences, and game weeks." />
</svelte:head>

<div class="team-search-container" class:light={!$theme} class:dark={$theme} class:mounted>
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="hero-content">
			<div class="hero-icon-wrapper">
				<img class="hero-icon" src="/teamstats.png" alt="Team Statistics" />
				<h1 class="hero-title">Team Statistics</h1>
			</div>
			<p class="hero-subtitle">
				Discover comprehensive team performance data across seasons, conferences, and game weeks
			</p>
		</div>
	</section>

	<!-- Main Search Interface -->
	<section class="search-section">
		<div class="search-grid">
			<!-- Left Panel: Search Controls -->
			<div class="search-panel">
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
						<div class="field-group">
							<h3 class="section-title required-section">
								<span class="section-icon">⭐</span>
								Required Information
							</h3>
							
							<div class="form-field required">
								<label for="year" class="field-label">
									Season Year
									<span class="required-indicator">*</span>
								</label>
								<input
									id="year"
									type="number"
									bind:value={year}
									min="1900"
									max={new Date().getFullYear() + 1}
									class="form-input"
									class:error={year !== '' && !isYearValid}
									placeholder="e.g., 2024"
									required
								/>
								{#if year !== '' && !isYearValid}
									<span class="error-message">Please enter a valid year (1900-{new Date().getFullYear() + 1})</span>
								{/if}
							</div>
						</div>

						<!-- Optional Filters Section -->
						<div class="field-group">
							<h3 class="section-title">
								<span class="section-icon">🎯</span>
								Filters (Optional)
							</h3>
							
							<div class="form-row">
								<div class="form-field">
									<label for="team" class="field-label">Team Name</label>
									<input
										id="team"
										type="text"
										bind:value={team}
										class="form-input"
										placeholder="e.g., Alabama, Ohio State"
									/>
								</div>
								
								<div class="form-field">
									<label for="conference" class="field-label">Conference</label>
									<input
										id="conference"
										type="text"
										bind:value={conference}
										class="form-input"
										placeholder="e.g., SEC, Big Ten"
									/>
								</div>
							</div>

							<div class="form-row">
								<div class="form-field">
									<label for="start-week" class="field-label">Start Week</label>
									<input
										id="start-week"
										type="number"
										bind:value={startWeek}
										on:input={(e) => handleWeekInput(e, 'startWeek')}
										min="1"
										max="14"
										class="form-input"
										placeholder="1-14"
									/>
								</div>
								
								<div class="form-field">
									<label for="end-week" class="field-label">End Week</label>
									<input
										id="end-week"
										type="number"
										bind:value={endWeek}
										on:input={(e) => handleWeekInput(e, 'endWeek')}
										min="1"
										max="14"
										class="form-input"
										placeholder="1-14"
									/>
								</div>
							</div>

							{#if !isWeekRangeValid}
								<span class="error-message">Please ensure start week is less than or equal to end week</span>
							{/if}

							<div class="form-field">
								<label for="season-type" class="field-label">Season Type</label>
								<select id="season-type" bind:value={seasonType} class="form-input">
									<option value="regular">Regular Season</option>
									<option value="postseason">Postseason Only</option>
									<option value="both">Both Regular & Postseason</option>
								</select>
							</div>
						</div>

						<!-- Category Selection -->
						<div class="field-group">
							<h3 class="section-title">
								<span class="section-icon">📋</span>
								Statistic Categories
							</h3>
							
							<div class="category-search">
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Search categories..."
									class="form-input category-search-input"
								/>
								{#if searchQuery}
									<button 
										class="clear-search-btn"
										on:click={() => searchQuery = ''}
										type="button"
										aria-label="Clear search"
									>
										✕
									</button>
								{/if}
							</div>

							<div class="category-grid">
								{#each filteredCategories as category (category.id)}
									<div
										class="category-card"
										class:selected={selectedCategories.includes(category.id)}
										on:click={() => toggleCategory(category.id)}
										on:keydown={(e) => e.key === 'Enter' && toggleCategory(category.id)}
										role="button"
										tabindex="0"
										aria-pressed={selectedCategories.includes(category.id)}
									>
										<div class="category-icon">{category.icon}</div>
										<div class="category-content">
											<h4 class="category-name">{category.name}</h4>
											<p class="category-description">{category.description}</p>
										</div>
										<div class="category-selector">
											{#if selectedCategories.includes(category.id)}
												<div class="check-icon">✓</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>

							{#if selectedCategories.length > 0}
								<div class="selected-summary">
									<span class="summary-text">
										{selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''} selected
									</span>
									<button
										type="button"
										on:click={clearAllCategories}
										class="clear-button"
									>
										Clear All
									</button>
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
						<h2 class="panel-title">
							📋 Search Summary
						</h2>
						{#if selectedCategories.length > 0 || team || conference}
							<button 
								class="clear-all-btn"
								on:click={() => {
									selectedCategories = [];
									team = '';
									conference = '';
									startWeek = '';
									endWeek = '';
									seasonType = 'regular';
								}}
								type="button"
							>
								Clear All
							</button>
						{/if}
					</div>

					<!-- Summary Content -->
					<div class="summary-container">
						{#if year || selectedCategories.length > 0 || team || conference || startWeek || endWeek}
							<div class="summary-content">
								<div class="summary-section">
									<h4 class="summary-title">Season Information</h4>
									<div class="summary-item">
										<span class="summary-label">Year:</span>
										<span class="summary-value" class:missing={!year}>{searchSummary.year}</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">Season Type:</span>
										<span class="summary-value">{searchSummary.seasonType}</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">Week Range:</span>
										<span class="summary-value">{searchSummary.weekRange}</span>
									</div>
								</div>

								<div class="summary-section">
									<h4 class="summary-title">Team Filters</h4>
									<div class="summary-item">
										<span class="summary-label">Team:</span>
										<span class="summary-value" class:missing={!team}>{searchSummary.team}</span>
									</div>
									<div class="summary-item">
										<span class="summary-label">Conference:</span>
										<span class="summary-value" class:missing={!conference}>{searchSummary.conference}</span>
									</div>
								</div>

								<div class="summary-section">
									<h4 class="summary-title">Statistics</h4>
									<div class="summary-item">
										<span class="summary-label">Categories:</span>
										<span class="summary-value" class:missing={selectedCategories.length === 0}>
											{searchSummary.categories}
										</span>
									</div>
								</div>
							</div>
						{:else}
							<div class="empty-summary">
								<div class="empty-icon">📊</div>
								<h3 class="empty-title">Configure Your Search</h3>
								<p class="empty-message">Fill in the search parameters to analyze team statistics</p>
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
									<div class="loading-spinner"></div>
									<span>Searching...</span>
								{:else if isFormValid}
									<span>Search Team Stats</span>
									<span class="button-icon">🔍</span>
								{:else if !year}
									<span>Enter Year</span>
								{:else}
									<span>Fix Configuration</span>
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	/* CSS Custom Properties for Green/Blue Team Theme */
	:root {
		--accent-green: #10b981;
		--accent-blue: #3b82f6;
		--accent-teal: #06b6d4;
		
		/* Gradients */
		--gradient-primary: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%);
		--gradient-secondary: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-green) 100%);
		--gradient-subtle: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
		
		/* Base Colors */
		--background-primary: #ffffff;
		--background-secondary: #f8fafc;
		--background-tertiary: #f1f5f9;
		--surface-primary: #ffffff;
		--surface-secondary: #f8fafc;
		
		/* Text Colors */
		--text-primary: #1e293b;
		--text-secondary: #64748b;
		--text-tertiary: #94a3b8;
		--text-inverse: #ffffff;
		
		/* Border Colors */
		--border-primary: #e2e8f0;
		--border-secondary: #cbd5e1;
		--border-focus: var(--accent-blue);
		
		/* Status Colors */
		--success-color: #059669;
		--error-color: #dc2626;
		--warning-color: #d97706;
		
		/* Shadows */
		--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		
		/* Transitions */
		--transition-fast: 0.15s ease-out;
		--transition-medium: 0.3s ease-out;
		--transition-slow: 0.5s ease-out;
		
		/* Spacing */
		--spacing-xs: 0.25rem;
		--spacing-sm: 0.5rem;
		--spacing-md: 1rem;
		--spacing-lg: 1.5rem;
		--spacing-xl: 2rem;
		--spacing-2xl: 3rem;
		
		/* Border Radius */
		--radius-sm: 0.375rem;
		--radius-md: 0.5rem;
		--radius-lg: 0.75rem;
		--radius-xl: 1rem;
	}

	/* Dark theme support */
	.dark {
		--background-primary: #0f172a;
		--background-secondary: #1e293b;
		--background-tertiary: #334155;
		--surface-primary: #1e293b;
		--surface-secondary: #334155;
		
		--text-primary: #f1f5f9;
		--text-secondary: #cbd5e1;
		--text-tertiary: #94a3b8;
		
		--border-primary: #334155;
		--border-secondary: #475569;
	}

	/* Base Styles */
	* {
		box-sizing: border-box;
	}

	.team-search-container {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%);
		opacity: 0;
		transform: translateY(20px);
		transition: all var(--transition-slow);
		padding: 1rem;
	}

	.team-search-container.mounted {
		opacity: 1;
		transform: translateY(0);
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
		background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
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
	.search-section {
		padding: 0 var(--spacing-md) var(--spacing-2xl) var(--spacing-md);
	}

	.search-grid {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: var(--spacing-2xl);
		align-items: start;
	}

	.selected-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: min-content;
	}

	.panel-card {
		background: var(--surface-primary);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border-primary);
		overflow: hidden;
	}

	.panel-header {
		background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
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

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		padding-bottom: var(--spacing-sm);
		border-bottom: 2px solid var(--border-primary);
	}

	.section-title.required-section {
		color: var(--accent-green);
		border-bottom-color: var(--accent-green);
	}

	.section-icon {
		font-size: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.field-label {
		font-weight: 500;
		color: var(--text-primary);
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.required-indicator {
		color: var(--error-color);
		font-weight: 600;
	}

	.form-input {
		padding: 0.75rem;
		border: 2px solid var(--border-primary);
		border-radius: var(--radius-md);
		font-size: 1rem;
		background: var(--background-primary);
		color: var(--text-primary);
		transition: all var(--transition-fast);
		outline: none;
	}

	.form-input:focus {
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input.error {
		border-color: var(--error-color);
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}

	.form-input::placeholder {
		color: var(--text-tertiary);
	}

	.error-message {
		color: var(--error-color);
		font-size: 0.75rem;
		font-weight: 500;
	}

	/* Category Selection */
	.category-search {
		margin-bottom: var(--spacing-md);
		position: relative;
	}

	.category-search-input {
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

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.category-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border: 2px solid var(--border-primary);
		border-radius: var(--radius-lg);
		background: var(--background-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
	}

	.category-card:hover {
		border-color: var(--accent-green);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.category-card.selected {
		border-color: var(--accent-green);
		background: var(--gradient-subtle);
		position: relative;
	}

	.category-card.selected::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% { left: -100%; }
		100% { left: 100%; }
	}

	.category-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.category-content {
		flex: 1;
		text-align: left;
	}

	.category-name {
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 var(--spacing-xs) 0;
		font-size: 0.875rem;
	}

	.category-description {
		color: var(--text-secondary);
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.category-selector {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid var(--border-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.category-card.selected .category-selector {
		background: var(--accent-green);
		border-color: var(--accent-green);
	}

	.check-icon {
		color: white;
		font-size: 0.75rem;
		font-weight: bold;
	}

	.selected-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--gradient-subtle);
		border-radius: var(--radius-md);
		border: 1px solid var(--accent-green);
	}

	.summary-text {
		color: var(--accent-green);
		font-weight: 500;
		font-size: 0.875rem;
	}

	.clear-button {
		background: none;
		border: 1px solid var(--accent-green);
		color: var(--accent-green);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.clear-button:hover {
		background: var(--accent-green);
		color: white;
	}

	/* ========================================
	   SUMMARY PANEL
	======================================== */
	.summary-container {
		padding: 2rem;
		min-height: auto;
	}

	.summary-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.summary-section {
		padding: var(--spacing-md);
		background: var(--background-secondary);
		border-radius: var(--radius-md);
		border-left: 4px solid var(--accent-green);
	}

	.summary-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent-green);
		margin: 0 0 var(--spacing-sm) 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-xs) 0;
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
		flex: 1;
		margin-left: var(--spacing-md);
	}

	.summary-value.missing {
		color: var(--text-tertiary);
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

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.6;
	}

	.empty-title {
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.empty-message {
		color: var(--text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.summary-card {
		flex: 1;
	}

	/* ========================================
	   SUBMIT CARD
	======================================== */
	.submit-card {
		background: var(--surface-primary);
		border-radius: var(--radius-xl);
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
		width: 100%;
		margin-top: 1rem;
	}

	.submit-button {
		width: 100%;
		padding: 1rem var(--spacing-lg);
		background: var(--gradient-primary);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
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
		box-shadow: var(--shadow-lg), 0 10px 20px rgba(16, 185, 129, 0.3);
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

	.button-icon {
		font-size: 1.125rem;
	}

	.loading-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
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
		.search-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}

		.selected-panel {
			height: 100%;
			order: -1;
		}

		.selected-panel {
			gap: 1rem;
		}
	}

	/* Mobile Phones */
	@media (max-width: 768px) {
		.team-search-container {
			padding: 0.75rem;
		}

		.search-grid {
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

		.form-row {
			grid-template-columns: 1fr;
		}

		.category-grid {
			grid-template-columns: 1fr;
		}

		.summary-container {
			padding: 1.25rem;
		}

		.submit-content {
			padding: 1.25rem;
			flex-direction: column;
			text-align: center;
			align-items: center;
		}

		.submit-actions {
			width: 100%;
		}

		.submit-button {
			width: 100%;
			justify-content: center;
		}

		.category-card {
			padding: var(--spacing-sm);
		}

		.category-icon {
			font-size: 1.5rem;
		}
	}

	/* Small Mobile */
	@media (max-width: 480px) {
		.team-search-container {
			padding: 0.5rem;
		}

		.search-grid {
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

		.summary-container {
			padding: 1rem;
		}

		.submit-content {
			padding: 1rem;
			align-items: center;
		}

		.submit-button {
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
			font-size: 1rem;
		}
	}

	/* ========================================
	   ACCESSIBILITY & FOCUS STATES
	======================================== */
	.category-card:focus,
	.form-input:focus,
	.submit-button:focus,
	.clear-all-btn:focus,
	.clear-search-btn:focus,
	.clear-button:focus {
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

		.hero-icon {
			animation: none;
		}

		.category-card.selected::before {
			animation: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		:root {
			--border-primary: #000000;
			--border-secondary: #000000;
			--text-secondary: #000000;
		}
	}

	/* Print styles */
	@media print {
		.team-search-container {
			background: white;
		}

		.hero-section {
			background: white;
			color: black;
		}

		.hero-title {
			-webkit-text-fill-color: initial;
			background: none;
			color: black;
		}

		.submit-button {
			display: none;
		}
	}
</style>