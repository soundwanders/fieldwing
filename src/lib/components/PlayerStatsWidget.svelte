<script lang="ts">
  import { page } from '$app/stores';
  import { theme } from '$lib/stores/theme';
  import { statsNameTrim } from '$lib/utils/statsNameTrim';
  import type { PlayerStatsSearchParams, PlayerStatCategory } from '$lib/types/api';
  import type { ChangeHandler } from '$lib/types/components';

  // Component props with types
  export let initialParams: Partial<PlayerStatsSearchParams> = {};
  export let onSearch: ((params: PlayerStatsSearchParams) => void) | undefined = undefined;

  // Form state with proper types
  let searchParams: PlayerStatsSearchParams = {
    year: '',
    team: '',
    conference: '',
    startWeek: '',
    endWeek: '',
    category: undefined,
    seasonType: 'regular',
    ...initialParams
  };

  let isInvalidWeekRange: boolean = false;
  let formErrors: Record<string, string> = {};

  const pageSize: number = 16;
  $: currentPage = (Number($page.url.searchParams.get('skip')) || 0) / pageSize;

  // Category options with proper typing
  const categoryOptions: Array<{ value: PlayerStatCategory; label: string }> = [
    { value: 'defense', label: 'Defense' },
    { value: 'fumbles', label: 'Fumbles' },
    { value: 'interceptions', label: 'Interceptions' },
    { value: 'kicking', label: 'Kicking' },
    { value: 'kickReturns', label: 'Kick Returns' },
    { value: 'passing', label: 'Passing' },
    { value: 'punting', label: 'Punting' },
    { value: 'puntReturns', label: 'Punt Returns' },
    { value: 'receiving', label: 'Receiving' },
    { value: 'rushing', label: 'Rushing' }
  ];

  // Input validation with types
  function validateWeekInput(
    event: Event & { currentTarget: HTMLInputElement },
    weekType: 'startWeek' | 'endWeek'
  ): void {
    const inputValue = Number(event.currentTarget.value);

    if (inputValue < 1 || inputValue > 14 || isNaN(inputValue)) {
      event.currentTarget.value = '';
      formErrors[weekType] = 'Week must be between 1 and 14';
    } else {
      delete formErrors[weekType];
    }
    
    // Update form errors reactively
    formErrors = { ...formErrors };
  }

  // Form validation
  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!searchParams.year) {
      errors.year = 'Year is required';
    } else {
      const yearNum = Number(searchParams.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        errors.year = 'Please enter a valid year';
      }
    }

    // Week range validation
    if (searchParams.startWeek && searchParams.endWeek) {
      const startWeek = Number(searchParams.startWeek);
      const endWeek = Number(searchParams.endWeek);
      
      if (startWeek > endWeek) {
        errors.weekRange = 'Start week cannot be greater than end week';
        isInvalidWeekRange = true;
      } else {
        isInvalidWeekRange = false;
      }
    }

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  // Generate API URL with proper typing
  function generateApiUrl(): string {
    if (!validateForm()) {
      return '';
    }

    // Trim school mascot name if present
    const processedParams: PlayerStatsSearchParams = {
      ...searchParams,
      team: searchParams.team ? statsNameTrim(searchParams.team) : undefined
    };

    const queryParams = Object.entries(processedParams)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const paginationParams = [
      `limit=${pageSize}`,
      `skip=${currentPage * pageSize}`
    ].join('&');

    return `/player-stats?${queryParams}&${paginationParams}`;
  }

  // Event handlers with proper types
  function handleInput() {
    validateForm();
  }

  const handleCategoryChange: ChangeHandler<HTMLSelectElement> = (event: { currentTarget: { value: string; }; }) => {
    searchParams.category = event.currentTarget.value as PlayerStatCategory;
    validateForm();
  };

  const handleSubmit = () => {
    if (validateForm() && onSearch) {
      onSearch(searchParams);
    }
  };

  // Reactive API URL generation
  $: apiUrl = generateApiUrl();
  $: isFormValid = Object.keys(formErrors).length === 0 && searchParams.year;
</script>

<section class="stats-widget" class:light={!$theme} class:dark={$theme}>
  <form class="stats-form" on:input={handleInput}>
    <div class="form-row">
      <label for="stat-category" class:error={formErrors.category}>
        Stat Category: {formErrors.category ? `(${formErrors.category})` : ''}
        <select
          id="stat-category"
          bind:value={searchParams.category}
          on:change={handleCategoryChange}
          required
          aria-describedby={formErrors.category ? 'category-error' : undefined}
        >
          <option value="">Select category...</option>
          {#each categoryOptions as { value, label } (value)}
            <option {value}>{label}</option>
          {/each}
        </select>
        {#if formErrors.category}
          <span id="category-error" class="error-text">{formErrors.category}</span>
        {/if}
      </label>

      <label for="team" class:error={formErrors.team}>
        Team: {formErrors.team ? `(${formErrors.team})` : ''}
        <input
          id="team"
          type="text"
          bind:value={searchParams.team}
          placeholder="e.g., Alabama"
          aria-describedby={formErrors.team ? 'team-error' : undefined}
        />
        {#if formErrors.team}
          <span id="team-error" class="error-text">{formErrors.team}</span>
        {/if}
      </label>
    </div>

    <div class="form-row">
      <label for="year" class:error={formErrors.year}>
        Year: {formErrors.year ? `(${formErrors.year})` : ''}
        <input
          id="year"
          type="number"
          bind:value={searchParams.year}
          required
          min="1900"
          max={new Date().getFullYear() + 1}
          placeholder="e.g., 2023"
          aria-describedby={formErrors.year ? 'year-error' : undefined}
        />
        {#if formErrors.year}
          <span id="year-error" class="error-text">{formErrors.year}</span>
        {/if}
      </label>

      <label for="conference" class:error={formErrors.conference}>
        Conference: {formErrors.conference ? `(${formErrors.conference})` : ''}
        <input
          id="conference"
          type="text"
          bind:value={searchParams.conference}
          placeholder="e.g., SEC"
          aria-describedby={formErrors.conference ? 'conference-error' : undefined}
        />
        {#if formErrors.conference}
          <span id="conference-error" class="error-text">{formErrors.conference}</span>
        {/if}
      </label>
    </div>

    <div class="form-row">
      <label for="start-week" class:error={formErrors.startWeek || isInvalidWeekRange}>
        Start Week: {formErrors.startWeek ? `(${formErrors.startWeek})` : ''}
        <input
          id="start-week"
          type="number"
          bind:value={searchParams.startWeek}
          min="1"
          max="14"
          class:invalid={isInvalidWeekRange}
          on:input={(e) => validateWeekInput(e, 'startWeek')}
          aria-describedby={formErrors.startWeek ? 'start-week-error' : undefined}
        />
        {#if formErrors.startWeek}
          <span id="start-week-error" class="error-text">{formErrors.startWeek}</span>
        {/if}
      </label>

      <label for="end-week" class:error={formErrors.endWeek || isInvalidWeekRange}>
        End Week: {formErrors.endWeek ? `(${formErrors.endWeek})` : ''}
        <input
          id="end-week"
          type="number"
          bind:value={searchParams.endWeek}
          min="1"
          max="14"
          class:invalid={isInvalidWeekRange}
          on:input={(e) => validateWeekInput(e, 'endWeek')}
          aria-describedby={formErrors.endWeek ? 'end-week-error' : undefined}
        />
        {#if formErrors.endWeek}
          <span id="end-week-error" class="error-text">{formErrors.endWeek}</span>
        {/if}
      </label>
    </div>

    {#if formErrors.weekRange}
      <div class="error-banner">
        {formErrors.weekRange}
      </div>
    {/if}

    <div class="form-row">
      <label for="season-type">
        Season Type:
        <select id="season-type" bind:value={searchParams.seasonType}>
          <option value="regular">Regular Season</option>
          <option value="postseason">Postseason</option>
          <option value="both">Both</option>
        </select>
      </label>
    </div>
  </form>

  <div class="button-container">
    {#if apiUrl && isFormValid}
      <a href={apiUrl} data-sveltekit-reload role="button">
        <button class="submit-button" type="button">
          Search Player Stats
        </button>
      </a>
    {:else}
      <button 
        class="submit-button" 
        type="button" 
        disabled
        on:click={handleSubmit}
      >
        {Object.keys(formErrors).length > 0 ? 'Fix Errors' : 'Fill Required Fields'}
      </button>
    {/if}
  </div>
</section>

<style>
  .light {
    --form-background-color: #eeeef0;
    --form-sub-background-color: #f4f4f5;
    --label-color: #555;
    --input-background-color: #f9f9f9;
    --input-text-color: #333;
    --error-color: #ef4444;
    --error-bg: #fef2f2;
  }

  .dark {
    --form-background-color: #1d232e;
    --form-sub-background-color: #242b38;
    --label-color: #b0b0b0;
    --input-background-color: #2b2b2b;
    --input-text-color: #f9f9f9;
    --error-color: #f87171;
    --error-bg: #7f1d1d;
  }

  .stats-widget {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--form-background-color);
    border-radius: 0.5rem;
    border: 1px solid #ccc;
  }

  .stats-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  label {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--label-color);
  }

  label.error {
    color: var(--error-color);
  }

  input,
  select {
    margin-top: 0.25rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background-color: var(--form-sub-background-color);
    color: var(--input-text-color);
    font-size: 0.875rem;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--primary-color, #424ae1);
    outline-offset: 2px;
  }

  input.invalid {
    border-color: var(--error-color);
    background-color: var(--error-bg);
  }

  .error-text {
    font-size: 0.75rem;
    color: var(--error-color);
    margin-top: 0.25rem;
  }

  .error-banner {
    padding: 0.75rem;
    background-color: var(--error-bg);
    color: var(--error-color);
    border-radius: 0.25rem;
    border: 1px solid var(--error-color);
    font-size: 0.875rem;
    text-align: center;
  }

  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .submit-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color, #424ae1);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
    }

    label {
      min-width: unset;
    }
  }
</style>