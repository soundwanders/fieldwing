<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import TeamStatsTable from '$lib/components/TeamStatsTable.svelte';
	import type { TeamStat } from '$lib/types/api';
	import ExportButton from '$lib/components/ExportButton.svelte';

	export let data: {
		teamData?: { teamStatsData: TeamStat[]; total: number };
		searchParams?: Record<string, string>;
		error?: string;
	} = {};

	// Component state
	let teamStats: TeamStat[] = [];
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
		endWeek: ''
	};

	// Form validation
	let formErrors: Record<string, string> = {};

	// Reactive variables for export functionality (similar to games route)
	$: hasResults = teamStats.length > 0;
	$: exportData = teamStats; // The data we want to export
	$: exportFilename = (() => {
		let filename = `team-stats-${searchParams.year}`;
		if (searchParams.team) filename += `-${searchParams.team.replace(/\s+/g, '-')}`;
		if (searchParams.conference) filename += `-${searchParams.conference}`;
		if (searchParams.startWeek && searchParams.endWeek) {
			filename += `-weeks-${searchParams.startWeek}-${searchParams.endWeek}`;
		} else if (searchParams.startWeek) {
			filename += `-week-${searchParams.startWeek}+`;
		} else if (searchParams.endWeek) {
			filename += `-week-1-${searchParams.endWeek}`;
		}
		return filename;
	})();

	// Initialize from server data or URL parameters
	function initializeFromData(): void {
		if (typeof window === 'undefined') return;

		const urlParams = new URLSearchParams(window.location.search);

		searchParams = {
			year: urlParams.get('year') || data.searchParams?.year || new Date().getFullYear().toString(),
			team: urlParams.get('team') || data.searchParams?.team || '',
			conference: urlParams.get('conference') || data.searchParams?.conference || '',
			startWeek: urlParams.get('startWeek') || data.searchParams?.startWeek || '',
			endWeek: urlParams.get('endWeek') || data.searchParams?.endWeek || ''
		};

		// If we have server data, use it
		if (data.teamData?.teamStatsData) {
			teamStats = data.teamData.teamStatsData;
			totalItems = data.teamData.total;
		}
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
			if (isNaN(week) || week < 1 || week > 14) {
				formErrors.startWeek = 'Start week must be between 1 and 14';
				return false;
			}
		}

		if (searchParams.endWeek) {
			const week = parseInt(searchParams.endWeek);
			if (isNaN(week) || week < 1 || week > 14) {
				formErrors.endWeek = 'End week must be between 1 and 14';
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
	async function fetchTeamStats(): Promise<void> {
		if (!validateForm()) {
			teamStats = [];
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

			const response = await fetch(`/api/team-stats?${params.toString()}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			if (result.data && Array.isArray(result.data)) {
				teamStats = result.data;
				totalItems = result.data.length;

				if (teamStats.length === 0 && searchParams.year) {
					error = 'No team statistics found for your search criteria. Try adjusting your filters.';
				}
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch team stats';
			teamStats = [];
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

		// Update URL and trigger search
		const url = new URL(window.location.href);
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value && value !== '') {
				url.searchParams.set(key, String(value));
			} else {
				url.searchParams.delete(key);
			}
		});

		goto(url.pathname + url.search, { replaceState: true });
		fetchTeamStats();
	}

	// Initialize on mount
	onMount(() => {
		initializeFromData();
		isInitialized = true;
	});

	// Cleanup
	onDestroy(() => {
		// Any cleanup needed
	});
</script>

<svelte:head>
	<title>Team Statistics - Fieldwing</title>
	<meta
		name="description"
		content="Search and analyze college football team statistics by year, team, conference, and week range."
	/>
</svelte:head>

<div class="wrapper" class:light={!$theme} class:dark={$theme}>
	<div class="container">
		<!-- Header Section -->
		<div class="header-section">
			<div class="header-content">
				<img class="header-icon" src="/teamstats.png" alt="Team Stats" />
				<h1 class="page-title">Team Statistics</h1>
				<p class="page-subtitle">
					Analyze team performance metrics and statistics across college football
				</p>
			</div>
		</div>

		<!-- Search Form -->
		<div class="search-section">
			<div class="search-card">
				<div class="search-header">
					<h2 class="search-title">🔍 Search Team Stats</h2>
					<p class="search-subtitle">Find team statistics by customizing your search criteria</p>
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
							max="14"
							on:change={(e) => handleFieldChange(e, 'startWeek')}
						/>

						<!-- End Week -->
						<FormField
							label="End Week"
							type="number"
							value={searchParams.endWeek}
							error={formErrors.endWeek}
							placeholder="14"
							min="1"
							max="14"
							on:change={(e) => handleFieldChange(e, 'endWeek')}
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

							<!-- Export Button -->
							{#if hasResults}
								<div class="export-container">
									<ExportButton
										data={exportData}
										type="team-stats"
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
							{#if teamStats.length > 0}
								<span class="results-count">({teamStats.length} records)</span>
							{/if}
						</h2>
						{#if searchParams.year && isInitialized}
							<p class="results-subtitle">
								Showing team statistics for {searchParams.year}
								{#if searchParams.team}• {searchParams.team}{/if}
								{#if searchParams.conference}• {searchParams.conference}{/if}
							</p>
						{/if}
					</div>

					{#if teamStats.length > 0}
						<div class="results-actions">
							<div class="export-container">
								<ExportButton
									data={exportData}
									type="team-stats"
									variant="primary"
									size="small"
									filename={exportFilename}
									showCount={false}
								/>
							</div>
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
								<button class="btn btn-primary" on:click={fetchTeamStats}> 🔄 Try Again </button>
							</div>
						</div>
					{:else if isLoading}
						<div class="loading-state">
							<LoadingSpinner size="large" text="Searching team statistics..." />
						</div>
					{:else if !searchParams.year}
						<div class="empty-state">
							<div class="empty-icon">🏈</div>
							<div class="empty-content">
								<h3>Ready to Search</h3>
								<p>Enter a year above to start searching for team statistics.</p>
							</div>
						</div>
					{:else if teamStats.length === 0 && isInitialized}
						<div class="empty-state">
							<div class="empty-icon">📊</div>
							<div class="empty-content">
								<h3>No Statistics Found</h3>
								<p>No team statistics match your search criteria.</p>
								<small
									>Try adjusting your search parameters or check if data exists for the selected
									year.</small
								>
							</div>
						</div>
					{:else if teamStats.length > 0}
						<!-- Team Stats Table -->
						<div class="table-section">
							<TeamStatsTable stats={teamStats} sortable={true} />
						</div>
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
