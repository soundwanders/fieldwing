<!-- PlayerStatSearch.svelte -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';
	let seasonType: string = 'regular';
	let selectedCategory: string = '';

	let pageSize: number = 16;
	let componentError: Error | null = null;
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

	// Form validation
	$: isValidForm = (() => {
		const hasYear = year && !isNaN(Number(year));
		const hasValidYear = hasYear && Number(year) >= 1900 && Number(year) <= currentYear + 1;
		const hasValidWeekRange = (() => {
			if (!startWeek && !endWeek) return true;
			if (startWeek && !endWeek) return Number(startWeek) >= 1 && Number(startWeek) <= 14;
			if (!startWeek && endWeek) return Number(endWeek) >= 1 && Number(endWeek) <= 14;

			const start = Number(startWeek);
			const end = Number(endWeek);
			return start >= 1 && start <= 14 && end >= 1 && end <= 14 && start <= end;
		})();

		return hasValidYear && hasValidWeekRange;
	})();

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
	};

	// Handle week input validation
	function handleWeekInput(
		event: Event & { currentTarget: HTMLInputElement },
		weekType: 'startWeek' | 'endWeek'
	) {
		const inputValue = Number(event.currentTarget.value);

		if (inputValue < 1 || inputValue > 14 || isNaN(inputValue)) {
			event.currentTarget.value = '';
			formErrors[weekType] = 'Week must be between 1 and 14';
		} else {
			delete formErrors[weekType];
		}
		formErrors = { ...formErrors };
	}

	function handleRetry() {
		componentError = null;
		// Reset form if needed
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
	}

	function validateData() {
		const errors: Record<string, string> = {};

		if (!year) {
			errors.year = 'Year is required';
		} else {
			const yearNum = Number(year);
			if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
				errors.year = 'Please enter a valid year';
			}
		}

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

		// Trim school mascot name if present
		let schoolName = statsNameTrim(team);

		// Construct the URL with the provided parameters
		const queryParams = [
			`year=${encodeURIComponent(year)}`,
			...(schoolName ? [`team=${encodeURIComponent(schoolName)}`] : []),
			...(conference ? [`conference=${encodeURIComponent(conference)}`] : []),
			...(startWeek ? [`startWeek=${startWeek}`] : []),
			...(endWeek ? [`endWeek=${endWeek}`] : []),
			...(seasonType && seasonType !== 'regular'
				? [`seasonType=${encodeURIComponent(seasonType)}`]
				: []),
			...(selectedCategory ? [`category=${encodeURIComponent(selectedCategory)}`] : []),
			`limit=${pageSize}`,
			`skip=${currentPage * pageSize}`
		].join('&');

		return `/player-stats?${queryParams}`;
	}

	function handleSubmit() {
		if (validateData()) {
			const url = getSearchURL();
			goto(url);
		}
	}

	onMount(() => {
		// Initialize with current year
		year = currentYear.toString();
	});

	onDestroy(() => {
		// Clean up all subscriptions
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers = [];
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
					Discover standout performances and analyze individual player statistics
				</p>
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
							🔍 Search Configuration
							{#if selectedCategory}
								<span class="panel-count">(Category Selected)</span>
							{/if}
						</h2>
						<p class="panel-subtitle">
							Configure your search criteria to find specific player statistics
						</p>
					</div>

					<!-- Controls Section -->
					<div class="controls-section">
						<!-- Year and Season Type -->
						<div class="control-row">
							<div class="control-group">
								<label for="year-input" class="control-label"> 📅 Year (Required) </label>
								<input
									type="number"
									class="control-input"
									id="year-input"
									bind:value={year}
									min={1900}
									max={currentYear + 1}
									placeholder={yearString}
									required
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
								<label for="team-input" class="control-label"> 🏈 Team (Optional) </label>
								<input
									type="text"
									class="control-input"
									id="team-input"
									bind:value={team}
									placeholder="e.g., Auburn"
								/>
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
						{#if selectedCategory || team || conference}
							<button class="clear-all-btn" on:click={clearAllSelections} type="button">
								Clear All
							</button>
						{/if}
					</div>

					<!-- Summary Content -->
					<div class="summary-container">
						{#if year || selectedCategory || team || conference || startWeek || endWeek}
							<div class="summary-list">
								<!-- Required Fields -->
								<div class="summary-section">
									<h4 class="summary-section-title">Required Parameters</h4>
									<div class="summary-item">
										<span class="summary-label">📅 Year:</span>
										<span class="summary-value" class:missing={!year}>
											{year || 'Not specified'}
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
							</div>
						{/if}
					</div>
				</div>

				<!-- Submit Card -->
				<div class="panel-card submit-card">
					<div class="submit-content">
						{#if isValidForm}
							<div class="submit-info">
								<h3 class="submit-title">🚀 Ready to Search</h3>
								<p class="submit-description">
									Search player statistics for {year}
									{#if selectedCategory}
										in the {categoryOptions.find((cat) => cat.value === selectedCategory)?.label ||
											selectedCategory} category
									{/if}
									{#if team}
										for {team}
									{/if}
								</p>
							</div>
						{:else}
							<div class="submit-info">
								<h3 class="submit-title">⚠️ Configuration Needed</h3>
								<p class="submit-description">
									{#if !year}
										Please enter a year to search for player statistics
									{:else if formErrors.year}
										Please enter a valid year (1900-{currentYear + 1})
									{:else if formErrors.weekRange}
										Please fix the week range issue
									{:else}
										Please check your search configuration
									{/if}
								</p>
							</div>
						{/if}

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
									{:else if isValidForm}
										📊 Search Player Stats
									{:else if !year}
										Enter Year
									{:else}
										Fix Configuration
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
