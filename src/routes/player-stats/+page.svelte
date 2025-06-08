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
  import type { PlayerStat } from '$lib/types/api';
  
  export let data: { searchParams?: Record<string, string> } = {};

  // Form state
  let searchForm = {
    year: data.searchParams?.year || new Date().getFullYear().toString(),
    team: data.searchParams?.team || '',
    conference: data.searchParams?.conference || '',
    startWeek: data.searchParams?.startWeek || '',
    endWeek: data.searchParams?.endWeek || '',
    category: data.searchParams?.category || '',
    seasonType: data.searchParams?.seasonType || 'regular'
  };

  // Component state
  let playerStats: PlayerStat[] = [];
  let isLoading = false;
  let error: string | null = null;
  let totalItems = 0;
  
  // Form validation
  let formErrors: Record<string, string> = {};
  
  // Category options
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

  // Pagination
  const pageSize = 16;
  $: currentPage = Math.floor((Number($page.url.searchParams.get('skip')) || 0) / pageSize);
  $: totalPages = Math.ceil(totalItems / pageSize);

  // Form validation function
  function validateForm(): boolean {
    formErrors = {};
    
    if (!searchForm.year) {
      formErrors.year = 'Year is required';
      return false;
    }
    
    const year = parseInt(searchForm.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      formErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      return false;
    }

    if (searchForm.startWeek) {
      const week = parseInt(searchForm.startWeek);
      if (isNaN(week) || week < 1 || week > 20) {
        formErrors.startWeek = 'Start week must be between 1 and 20';
        return false;
      }
    }

    if (searchForm.endWeek) {
      const week = parseInt(searchForm.endWeek);
      if (isNaN(week) || week < 1 || week > 20) {
        formErrors.endWeek = 'End week must be between 1 and 20';
        return false;
      }
    }

    if (searchForm.startWeek && searchForm.endWeek) {
      const start = parseInt(searchForm.startWeek);
      const end = parseInt(searchForm.endWeek);
      if (start > end) {
        formErrors.endWeek = 'End week must be greater than or equal to start week';
        return false;
      }
    }

    return true;
  }

  // API call function - NO REACTIVE STATEMENTS!
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
      params.set('year', searchForm.year);
      
      if (searchForm.team) params.set('team', searchForm.team);
      if (searchForm.conference) params.set('conference', searchForm.conference);
      if (searchForm.startWeek) params.set('startWeek', searchForm.startWeek);
      if (searchForm.endWeek) params.set('endWeek', searchForm.endWeek);
      if (searchForm.category) params.set('category', searchForm.category);
      if (searchForm.seasonType) params.set('seasonType', searchForm.seasonType);
      
      // Add pagination
      params.set('limit', pageSize.toString());
      params.set('skip', (currentPage * pageSize).toString());

      console.log('🔍 Fetching player stats with params:', params.toString());
      
      const response = await fetch(`/api/player-stats?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        playerStats = result.data;
        totalItems = result.data.length; // For now, use actual length
        console.log(`✅ Loaded ${playerStats.length} player stats`);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      console.error('❌ Failed to fetch player stats:', err);
      error = err instanceof Error ? err.message : 'Failed to fetch player stats';
      playerStats = [];
      totalItems = 0;
    } finally {
      isLoading = false;
    }
  }

  // Handle form submission
  function handleSearch(): void {
    console.log('🚀 Search triggered');
    
    // Update URL without causing reactive loops
    const url = new URL(window.location.href);
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value && value !== '') {
        url.searchParams.set(key, value);
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

  // Handle input changes with debouncing
  let searchTimeout: ReturnType<typeof setTimeout>;
  function handleInput(): void {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (validateForm()) {
        handleSearch();
      }
    }, 500); // 500ms debounce
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
      ...playerStats.map(stat => [
        `"${stat.player}"`,
        `"${stat.team}"`, 
        `"${stat.conference}"`,
        `"${stat.category}"`,
        `"${stat.statType}"`,
        stat.stat
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player-stats-${searchForm.year}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Initialize on mount
  onMount(() => {
    console.log('🎯 Player stats page mounted');
    if (searchForm.year) {
      fetchPlayerStats();
    }
  });

  // Cleanup
  onDestroy(() => {
    clearTimeout(searchTimeout);
  });
</script>

<svelte:head>
  <title>Player Statistics - Fieldwing</title>
  <meta name="description" content="Search and analyze college football player statistics by year, team, conference, and category." />
</svelte:head>

<div class="container" class:light={!$theme} class:dark={$theme}>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="header-section">
      <img class="icon" src="/playerstats.png" alt="Player Stats" />
      <h1 class="text-3xl font-bold mb-8">Player Statistics</h1>
    </div>
    
    <!-- Search Form -->
    <div class="search-form">
      <form on:submit|preventDefault={handleSearch} class="form-grid">
        <!-- Year (Required) -->
        <div class="form-field">
          <label for="year" class="field-label">
            Year *
            {#if formErrors.year}
              <span class="error-text">({formErrors.year})</span>
            {/if}
          </label>
          <input
            id="year"
            type="number"
            bind:value={searchForm.year}
            on:input={handleInput}
            placeholder="2023"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
            class="field-input"
            class:error={formErrors.year}
          />
        </div>

        <!-- Category -->
        <div class="form-field">
          <label for="category" class="field-label">Category</label>
          <select 
            id="category"
            bind:value={searchForm.category}
            on:change={handleInput}
            class="field-input"
          >
            {#each categories as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <!-- Team -->
        <div class="form-field">
          <label for="team" class="field-label">Team</label>
          <input
            id="team"
            type="text"
            bind:value={searchForm.team}
            on:input={handleInput}
            placeholder="e.g., Alabama"
            class="field-input"
          />
        </div>

        <!-- Conference -->
        <div class="form-field">
          <label for="conference" class="field-label">Conference</label>
          <input
            id="conference"
            type="text"
            bind:value={searchForm.conference}
            on:input={handleInput}
            placeholder="e.g., SEC"
            class="field-input"
          />
        </div>

        <!-- Start Week -->
        <div class="form-field">
          <label for="startWeek" class="field-label">
            Start Week
            {#if formErrors.startWeek}
              <span class="error-text">({formErrors.startWeek})</span>
            {/if}
          </label>
          <input
            id="startWeek"
            type="number"
            bind:value={searchForm.startWeek}
            on:input={handleInput}
            placeholder="1"
            min="1"
            max="20"
            class="field-input"
            class:error={formErrors.startWeek}
          />
        </div>

        <!-- End Week -->
        <div class="form-field">
          <label for="endWeek" class="field-label">
            End Week
            {#if formErrors.endWeek}
              <span class="error-text">({formErrors.endWeek})</span>
            {/if}
          </label>
          <input
            id="endWeek"
            type="number"
            bind:value={searchForm.endWeek}
            on:input={handleInput}
            placeholder="15"
            min="1"
            max="20"
            class="field-input"
            class:error={formErrors.endWeek}
          />
        </div>

        <!-- Season Type -->
        <div class="form-field">
          <label for="seasonType" class="field-label">Season Type</label>
          <select 
            id="seasonType"
            bind:value={searchForm.seasonType}
            on:change={handleInput}
            class="field-input"
          >
            <option value="regular">Regular Season</option>
            <option value="postseason">Postseason</option>
            <option value="both">Both</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="form-field flex items-end gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isLoading || Object.keys(formErrors).length > 0}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            type="button"
            on:click={exportToCSV}
            disabled={playerStats.length === 0}
            class="btn btn-secondary"
          >
            Export CSV
          </button>
        </div>
      </form>

      <!-- Form Validation Summary -->
      {#if Object.keys(formErrors).length > 0}
        <div class="validation-summary">
          <p>Please fix the following errors:</p>
          <ul>
            {#each Object.entries(formErrors) as [field, error]}
              <li>{field}: {error}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <!-- Results Section -->
    <div class="results-section">
      <!-- Results Header -->
      <div class="results-header">
        <h2 class="results-title">
          Search Results
          {#if playerStats.length > 0}
            <span class="results-count">({playerStats.length} records)</span>
          {/if}
        </h2>
      </div>

      <!-- Results Content -->
      <div class="results-content">
        {#if error}
          <ErrorMessage 
            {error}
            onRetry={fetchPlayerStats}
          />
        {:else if isLoading}
          <div class="loading-container">
            <LoadingSpinner size="large" text="Loading player statistics..." />
          </div>
        {:else if !searchForm.year}
          <div class="empty-state">
            <p>Please enter a year to search for player statistics.</p>
          </div>
        {:else if playerStats.length === 0}
          <div class="empty-state">
            <p>No player statistics found matching your criteria.</p>
            <p class="text-sm mt-2">Try adjusting your search parameters.</p>
          </div>
        {:else}
          <!-- Results Table -->
          <PlayerStatsTable 
            stats={playerStats}
            sortable={true}
          />
          
          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="pagination-container">
              <Pagination
                totalItems={totalItems}
                pageSize={pageSize}
                on:pageChange={(e) => handlePageChange(e.detail)}
              />
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .light {
    --bg-color: #f9f9f9;
    --text-color: #1a202c;
    --form-bg: #ffffff;
    --border-color: #d1d5db;
    --error-color: #ef4444;
    --primary-color: #3b82f6;
    --secondary-color: #6b7280;
  }

  .dark {
    --bg-color: #1a202c;
    --text-color: #f9f9f9;
    --form-bg: #374151;
    --border-color: #4b5563;
    --error-color: #f87171;
    --primary-color: #60a5fa;
    --secondary-color: #9ca3af;
  }

  .container {
    background-color: var(--bg-color);
    color: var(--text-color);
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .max-w-6xl {
    max-width: 72rem;
    margin: 0 auto;
  }

  .header-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .icon {
    width: 48px;
    height: 48px;
  }

  .search-form {
    background-color: var(--form-bg);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .field-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    background-color: var(--form-bg);
    color: var(--text-color);
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }

  .field-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .field-input.error {
    border-color: var(--error-color);
  }

  .error-text {
    color: var(--error-color);
    font-size: 0.75rem;
    font-weight: normal;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-secondary {
    background-color: var(--secondary-color);
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .validation-summary {
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error-color);
    border-radius: 0.375rem;
    color: var(--error-color);
    font-size: 0.875rem;
  }

  .validation-summary ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
  }

  .results-section {
    background-color: var(--form-bg);
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
  }

  .results-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .results-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }

  .results-count {
    font-size: 0.875rem;
    font-weight: normal;
    color: var(--secondary-color);
  }

  .results-content {
    padding: 1.5rem;
  }

  .loading-container,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: var(--secondary-color);
  }

  .pagination-container {
    margin-top: 1.5rem;
  }

  .flex {
    display: flex;
  }

  .items-end {
    align-items: flex-end;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .mb-8 {
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.5rem;
    }
    
    .header-section {
      flex-direction: column;
      text-align: center;
    }
    
    .icon {
      width: 40px;
      height: 40px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>