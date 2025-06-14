<!-- TeamStatSearch.svelte -->

<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import { onMount } from 'svelte';

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

	// Handle form submission
	async function handleSubmit() {
		if (!isFormValid) return;

		isLoading = true;

		// Simulate brief loading for better UX
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
	<meta
		name="description"
		content="Search and analyze comprehensive team statistics across seasons, conferences, and game weeks."
	/>
</svelte:head>

<div class="team-search-container" class:mounted>
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="hero-content">
			<div class="hero-icon">🏆</div>
			<h1 class="hero-title">
				<span class="gradient-text">Team Statistics</span>
			</h1>
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
				<div class="panel-header">
					<h2>Search Parameters</h2>
					<p>Configure your team statistics search</p>
				</div>

				<form on:submit|preventDefault={handleSubmit} class="search-form">
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
								<span class="error-message"
									>Please enter a valid year (1900-{new Date().getFullYear() + 1})</span
								>
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
							<span class="error-message"
								>Please ensure start week is less than or equal to end week</span
							>
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
									{selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''}
									selected
								</span>
								<button
									type="button"
									on:click={() => (selectedCategories = [])}
									class="clear-button"
								>
									Clear All
								</button>
							</div>
						{/if}
					</div>
				</form>
			</div>

			<!-- Right Panel: Search Summary -->
			<div class="summary-panel">
				<div class="panel-header">
					<h2>Search Summary</h2>
					<p>Review your search parameters</p>
				</div>

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
							<span class="summary-value" class:missing={!conference}
								>{searchSummary.conference}</span
							>
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

				<!-- Submit Section -->
				<div class="submit-section">
					{#if !isFormValid}
						<div class="validation-message">
							{#if !isYearValid}
								<p class="error-text">📅 Please enter a valid year</p>
							{/if}
							{#if !isWeekRangeValid}
								<p class="error-text">📊 Please check your week range</p>
							{/if}
						</div>
					{:else}
						<div class="ready-message">
							<p class="success-text">✅ Ready to search team statistics</p>
						</div>
					{/if}

					<button
						type="submit"
						class="submit-button"
						class:loading={isLoading}
						disabled={!isFormValid || isLoading}
						on:click={handleSubmit}
					>
						{#if isLoading}
							<div class="loading-spinner" />
							<span>Searching...</span>
						{:else}
							<span>Search Team Stats</span>
							<span class="button-icon">🔍</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	/* CSS Custom Properties for Theme */
	:root {
		/* Green/Blue Team Theme */
		--accent-green: #10b981;
		--accent-blue: #3b82f6;
		--accent-teal: #06b6d4;

		/* Gradients */
		--gradient-primary: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%);
		--gradient-secondary: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-green) 100%);
		--gradient-subtle: linear-gradient(
			135deg,
			rgba(16, 185, 129, 0.1) 0%,
			rgba(59, 130, 246, 0.1) 100%
		);

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
	@media (prefers-color-scheme: dark) {
		:root {
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
	}

	/* Base Styles */
	* {
		box-sizing: border-box;
	}

	.team-search-container {
		min-height: 100vh;
		background: var(--background-primary);
		opacity: 0;
		transform: translateY(20px);
		transition: all var(--transition-slow);
	}

	.team-search-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	/* Hero Section */
	.hero-section {
		background: var(--gradient-primary);
		padding: var(--spacing-2xl) var(--spacing-md);
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
			repeat;
		pointer-events: none;
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}

	.hero-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-md);
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.hero-title {
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 800;
		margin: 0 0 var(--spacing-md) 0;
		line-height: 1.1;
	}

	.gradient-text {
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Search Section */
	.search-section {
		padding: var(--spacing-2xl) var(--spacing-md);
		background: var(--background-secondary);
	}

	.search-grid {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: var(--spacing-2xl);
		align-items: start;
	}

	/* Panel Styles */
	.search-panel,
	.summary-panel {
		background: var(--surface-primary);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border-primary);
	}

	.panel-header {
		margin-bottom: var(--spacing-xl);
		text-align: center;
	}

	.panel-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--text-primary);
	}

	.panel-header p {
		color: var(--text-secondary);
		margin: 0;
	}

	/* Form Styles */
	.search-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
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
	}

	.category-search-input {
		position: relative;
	}

	.category-search-input::before {
		content: '🔍';
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
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
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
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

	/* Summary Panel */
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

	/* Submit Section */
	.submit-section {
		border-top: 1px solid var(--border-primary);
		padding-top: var(--spacing-lg);
	}

	.validation-message,
	.ready-message {
		margin-bottom: var(--spacing-md);
		text-align: center;
	}

	.error-text {
		color: var(--error-color);
		font-size: 0.875rem;
		margin: var(--spacing-xs) 0;
		font-weight: 500;
	}

	.success-text {
		color: var(--success-color);
		font-size: 0.875rem;
		margin: 0;
		font-weight: 500;
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
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		position: relative;
		overflow: hidden;
	}

	.submit-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-xl);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
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
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.search-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
		}

		.summary-panel {
			order: -1;
		}

		.hero-section {
			padding: var(--spacing-xl) var(--spacing-md);
		}

		.hero-title {
			font-size: clamp(2rem, 4vw, 3rem);
		}

		.hero-subtitle {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 768px) {
		.search-section {
			padding: var(--spacing-xl) var(--spacing-sm);
		}

		.search-panel,
		.summary-panel {
			padding: var(--spacing-lg);
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.category-grid {
			grid-template-columns: 1fr;
		}

		.hero-icon {
			font-size: 3rem;
		}

		.category-card {
			padding: var(--spacing-sm);
		}

		.category-icon {
			font-size: 1.5rem;
		}

		.summary-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.summary-value {
			text-align: left;
			margin-left: 0;
		}
	}

	@media (max-width: 480px) {
		.hero-section {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.search-section {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.search-panel,
		.summary-panel {
			padding: var(--spacing-md);
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.panel-header h2 {
			font-size: 1.25rem;
		}
	}

	/* Accessibility */
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

	@media (prefers-contrast: high) {
		:root {
			--border-primary: #000000;
			--border-secondary: #000000;
			--text-secondary: #000000;
		}
	}

	/* Focus styles for keyboard navigation */
	.category-card:focus {
		outline: 2px solid var(--accent-blue);
		outline-offset: 2px;
	}

	.submit-button:focus {
		outline: 2px solid var(--accent-blue);
		outline-offset: 2px;
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

		.gradient-text {
			-webkit-text-fill-color: initial;
			background: none;
			color: black;
		}

		.submit-button {
			display: none;
		}
	}
</style>
