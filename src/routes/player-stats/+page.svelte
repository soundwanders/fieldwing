<!-- src/routes/player-stats/+page.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import PlayerStatsTable from '$lib/components/PlayerStatsTable.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import type { PlayerStat } from '$lib/types/api';

	export let data: { searchParams?: Record<string, string> } = {};

	// Component state
	let playerStats: PlayerStat[] = [];
	let isLoading = false;
	let error: string | null = null;
	let totalItems = 0;
	let isInitialized = false;

	// Form state
	let searchParams = {
		year: '',
		team: '',
		conference: '',
		startWeek: '',
		endWeek: '',
		category: '',
		seasonType: 'regular'
	};

	// Form validation
	let formErrors: Record<string, string> = {};

	// Category options
	const categories = [
		{ value: '', label: 'Select Category...' },
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

	// Pagination constants
	const pageSize = 16;

	// Get current page from URL
	function getCurrentPage(): number {
		if (typeof window === 'undefined') return 0;
		const skip = Number(new URLSearchParams(window.location.search).get('skip')) || 0;
		return Math.floor(skip / pageSize);
	}

	// Initialize form from URL parameters
	function initializeFromURL(): void {
		if (typeof window === 'undefined') return;

		const urlParams = new URLSearchParams(window.location.search);

		searchParams = {
			year: urlParams.get('year') || data.searchParams?.year || new Date().getFullYear().toString(),
			team: urlParams.get('team') || data.searchParams?.team || '',
			conference: urlParams.get('conference') || data.searchParams?.conference || '',
			startWeek: urlParams.get('startWeek') || data.searchParams?.startWeek || '',
			endWeek: urlParams.get('endWeek') || data.searchParams?.endWeek || '',
			category: urlParams.get('category') || data.searchParams?.category || '',
			seasonType: urlParams.get('seasonType') || data.searchParams?.seasonType || 'regular'
		};
	}

	// Form validation function
	function validateForm(): boolean {
		formErrors = {};

		if (!searchParams.year) {
			formErrors.year = 'Year is required';
			return false;
		}

		const year = parseInt(searchParams.year);
		const currentYear = new Date().getFullYear();
		if (isNaN(year) || year < 1900 || year > currentYear + 1) {
			formErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
			return false;
		}

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

	// API call function
	async function fetchPlayerStats(): Promise<void> {
		if (!validateForm()) {
			playerStats = [];
			totalItems = 0;
			return;
		}

		isLoading = true;
		error = null;

		try {
			const params = new URLSearchParams();
			params.set('year', searchParams.year);

			if (searchParams.team) params.set('team', searchParams.team);
			if (searchParams.conference) params.set('conference', searchParams.conference);
			if (searchParams.startWeek) params.set('startWeek', searchParams.startWeek);
			if (searchParams.endWeek) params.set('endWeek', searchParams.endWeek);
			if (searchParams.category) params.set('category', searchParams.category);
			if (searchParams.seasonType) params.set('seasonType', searchParams.seasonType);

			// Add pagination
			const currentPage = getCurrentPage();
			params.set('limit', pageSize.toString());
			params.set('skip', (currentPage * pageSize).toString());

			const response = await fetch(`/api/player-stats?${params.toString()}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			if (result.data && Array.isArray(result.data)) {
				playerStats = result.data;
				totalItems = result.data.length;

				if (playerStats.length === 0 && searchParams.year) {
					error =
						'No player statistics found for your search criteria. Try adjusting your filters.';
				}
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch player stats';
			playerStats = [];
			totalItems = 0;
		} finally {
			isLoading = false;
		}
	}

	// Handle form field changes
	function handleFieldChange(event: CustomEvent<{ value: string | number }>, field: string): void {
		searchParams = {
			...searchParams,
			[field]: event.detail.value
		};

		// Clear errors for this field
		if (formErrors[field]) {
			const newErrors = { ...formErrors };
			delete newErrors[field];
			formErrors = newErrors;
		}
	}

	// Handle form submission
	function handleSearch(): void {
		if (!validateForm()) {
			return;
		}

		// Update URL
		const url = new URL(window.location.href);
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value && value !== '') {
				url.searchParams.set(key, String(value));
			} else {
				url.searchParams.delete(key);
			}
		});

		// Reset pagination on new search
		url.searchParams.delete('skip');

		// Update URL and trigger search
		goto(url.pathname + url.search, { replaceState: true });
		fetchPlayerStats();
	}

	// Handle page changes
	function handlePageChange(newPage: number): void {
		const url = new URL(window.location.href);
		const skip = newPage * pageSize;

		if (skip > 0) {
			url.searchParams.set('skip', skip.toString());
		} else {
			url.searchParams.delete('skip');
		}

		goto(url.pathname + url.search, { replaceState: true });
		fetchPlayerStats();
	}

	// CSV Export
	function exportToCSV(): void {
		if (playerStats.length === 0) {
			alert('No data to export');
			return;
		}

		const headers = ['Player', 'Team', 'Conference', 'Category', 'Stat Type', 'Value'];
		const csvContent = [
			headers.join(','),
			...playerStats.map((stat) =>
				[
					`"${stat.player}"`,
					`"${stat.team}"`,
					`"${stat.conference}"`,
					`"${stat.category}"`,
					`"${stat.statType}"`,
					stat.stat
				].join(',')
			)
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `player-stats-${searchParams.year}-${Date.now()}.csv`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}

	// Initialize on mount
	onMount(() => {
		initializeFromURL();
		isInitialized = true;

		// Only fetch if we have a year
		if (searchParams.year) {
			fetchPlayerStats();
		}
	});

	// Cleanup
	onDestroy(() => {
		// Any cleanup needed
	});
</script>

<svelte:head>
	<title>Player Statistics - Fieldwing</title>
	<meta
		name="description"
		content="Search and analyze college football player statistics by year, team, conference, and category."
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
					Discover standout performances and analyze player statistics across college football
				</p>
			</div>
		</div>

		<!-- Search Form -->
		<div class="search-section">
			<div class="search-card">
				<div class="search-header">
					<h2 class="search-title">🔍 Search Player Stats</h2>
					<p class="search-subtitle">Find player statistics by customizing your search criteria</p>
				</div>

				<form on:submit|preventDefault={handleSearch} class="search-form">
					<div class="form-grid">
						<!-- Year (Required) -->
						<FormField
							label="Year"
							type="number"
							value={searchParams.year}
							required={true}
							error={formErrors.year}
							placeholder="2023"
							min="1900"
							max={new Date().getFullYear() + 1}
							on:change={(e) => handleFieldChange(e, 'year')}
						/>

						<!-- Category -->
						<FormField
							label="Category"
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
							placeholder="e.g., Auburn"
							on:change={(e) => handleFieldChange(e, 'team')}
						/>

						<!-- Conference -->
						<FormField
							label="Conference"
							type="text"
							value={searchParams.conference}
							placeholder="e.g., SEC"
							on:change={(e) => handleFieldChange(e, 'conference')}
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
						/>

						<!-- Season Type -->
						<FormField
							label="Season Type"
							type="select"
							value={searchParams.seasonType}
							options={[
								{ value: 'regular', label: 'Regular Season' },
								{ value: 'postseason', label: 'Postseason' },
								{ value: 'both', label: 'Both' }
							]}
							on:change={(e) => handleFieldChange(e, 'seasonType')}
						/>

						<!-- Search Button -->
						<div class="form-actions">
							<button
								type="submit"
								class="btn btn-primary"
								disabled={isLoading || Object.keys(formErrors).length > 0}
							>
								{#if isLoading}
									<span class="btn-spinner" />
									Searching...
								{:else}
									🔍 Search Stats
								{/if}
							</button>

							<button
								type="button"
								on:click={exportToCSV}
								disabled={playerStats.length === 0}
								class="btn btn-secondary"
							>
								📊 Export CSV
							</button>
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
								{#each Object.entries(formErrors) as [field, error]}
									<li>{field}: {error}</li>
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
								<span class="results-count">({playerStats.length} records)</span>
							{/if}
						</h2>
						{#if searchParams.year && isInitialized}
							<p class="results-subtitle">
								Showing player statistics for {searchParams.year}
								{#if searchParams.team}• {searchParams.team}{/if}
								{#if searchParams.conference}• {searchParams.conference}{/if}
								{#if searchParams.category}• {searchParams.category}{/if}
							</p>
						{/if}
					</div>

					{#if playerStats.length > 0}
						<div class="results-actions">
							<button on:click={exportToCSV} class="btn btn-outline" title="Export data to CSV">
								📊 Export
							</button>
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
								<button class="btn btn-primary" on:click={fetchPlayerStats}> 🔄 Try Again </button>
							</div>
						</div>
					{:else if isLoading}
						<div class="loading-state">
							<LoadingSpinner size="large" text="Searching player statistics..." />
						</div>
					{:else if !searchParams.year}
						<div class="empty-state">
							<div class="empty-icon">🏈</div>
							<div class="empty-content">
								<h3>Ready to Search</h3>
								<p>Enter a year above to start searching for player statistics.</p>
							</div>
						</div>
					{:else if playerStats.length === 0 && isInitialized}
						<div class="empty-state">
							<div class="empty-icon">📊</div>
							<div class="empty-content">
								<h3>No Statistics Found</h3>
								<p>No player statistics match your search criteria.</p>
								<small
									>Try adjusting your search parameters or check if data exists for the selected
									year.</small
								>
							</div>
						</div>
					{:else if playerStats.length > 0}
						<!-- Results Table -->
						<div class="table-section">
							<PlayerStatsTable stats={playerStats} sortable={true} />
						</div>

						<!-- Pagination -->
						{#if Math.ceil(totalItems / pageSize) > 1}
							<div class="pagination-section">
								<Pagination {totalItems} {pageSize} maxVisiblePages={7} />
							</div>
						{/if}
					{/if}
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
		font-size: 1.125rem;
		color: var(--text-secondary);
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
		background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
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
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
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
		background: var(--accent-green);
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--accent-green);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.btn-outline {
		background: transparent;
		color: var(--accent-blue);
		border: 2px solid var(--accent-blue);
	}

	.btn-outline:hover {
		background: var(--accent-blue);
		color: white;
		transform: translateY(-2px);
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
	}

	.results-title-section {
		flex: 1;
	}

	.results-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	/* Responsive Design */
	@media (max-width: 768px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.page-subtitle {
			font-size: 1rem;
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
	}

	@media (max-width: 480px) {
		.search-title {
			font-size: 1.25rem;
		}

		.results-title {
			font-size: 1.25rem;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.loading-state,
		.empty-state,
		.error-state {
			padding: 3rem 1rem;
		}
	}
</style>
