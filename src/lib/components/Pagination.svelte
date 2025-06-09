<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { theme } from '$lib/stores/theme';

  export let totalItems: number;
  export let pageSize: number = 16;
  export let maxVisiblePages: number = 7;

  // Calculate pagination values
  $: totalPages = Math.ceil(totalItems / pageSize);
  $: currentPage = Math.floor((Number($page.url.searchParams.get('skip')) || 0) / pageSize);
  $: hasNextPage = currentPage < totalPages - 1;
  $: hasPrevPage = currentPage > 0;

  // Calculate visible page range
  $: startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
  $: endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
  $: visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  function buildPageUrl(pageIndex: number): string {
    const url = new URL($page.url);
    const skip = pageIndex * pageSize;
    
    if (skip > 0) {
      url.searchParams.set('skip', skip.toString());
    } else {
      url.searchParams.delete('skip');
    }
    
    url.searchParams.set('limit', pageSize.toString());
    return url.pathname + url.search;
  }

  function navigateToPage(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      goto(buildPageUrl(pageIndex));
    }
  }

  function handleKeydown(event: KeyboardEvent, pageIndex: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToPage(pageIndex);
    }
  }
</script>

{#if totalPages > 1}
  <nav class="pagination" class:light={!$theme} class:dark={$theme} role="navigation" aria-label="Pagination">
    <div class="pagination-info">
      <span class="pagination-text">
        Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} results
      </span>
    </div>

    <div class="pagination-controls">
      <!-- Previous button -->
      <button
        class="pagination-button"
        class:disabled={!hasPrevPage}
        on:click={() => navigateToPage(currentPage - 1)}
        disabled={!hasPrevPage}
        aria-label="Go to previous page"
        type="button"
      >
        ←
      </button>

      <!-- First page -->
      {#if startPage > 0}
        <a
          href={buildPageUrl(0)}
          class="pagination-item"
          class:active={currentPage === 0}
          on:keydown={(e) => handleKeydown(e, 0)}
          aria-label="Go to page 1"
        >
          1
        </a>
        
        {#if startPage > 1}
          <span class="pagination-ellipsis">...</span>
        {/if}
      {/if}

      <!-- Visible pages -->
      {#each visiblePages as pageIndex}
        <a
          href={buildPageUrl(pageIndex)}
          class="pagination-item"
          class:active={currentPage === pageIndex}
          on:keydown={(e) => handleKeydown(e, pageIndex)}
          aria-label="Go to page {pageIndex + 1}"
          aria-current={currentPage === pageIndex ? 'page' : undefined}
        >
          {pageIndex + 1}
        </a>
      {/each}

      <!-- Last page -->
      {#if endPage < totalPages - 1}
        {#if endPage < totalPages - 2}
          <span class="pagination-ellipsis">...</span>
        {/if}
        
        <a
          href={buildPageUrl(totalPages - 1)}
          class="pagination-item"
          class:active={currentPage === totalPages - 1}
          on:keydown={(e) => handleKeydown(e, totalPages - 1)}
          aria-label="Go to page {totalPages}"
        >
          {totalPages}
        </a>
      {/if}

      <!-- Next button -->
      <button
        class="pagination-button"
        class:disabled={!hasNextPage}
        on:click={() => navigateToPage(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        type="button"
      >
        →
      </button>
    </div>
  </nav>
{/if}

<style>
  .light {
    --pagination-bg: #ffffff;
    --pagination-text: #374151;
    --pagination-border: #d1d5db;
    --pagination-hover: #f3f4f6;
    --pagination-active: #3b82f6;
    --pagination-active-text: #ffffff;
    --pagination-disabled: #9ca3af;
  }

  .dark {
    --pagination-bg: #1f2937;
    --pagination-text: #d1d5db;
    --pagination-border: #4b5563;
    --pagination-hover: #374151;
    --pagination-active: #3b82f6;
    --pagination-active-text: #ffffff;
    --pagination-disabled: #6b7280;
  }

  .pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
    padding: 1rem;
    background-color: var(--pagination-bg);
    border-radius: 0.5rem;
    border: 1px solid var(--pagination-border);
  }

  .pagination-info {
    text-align: center;
  }

  .pagination-text {
    font-size: 0.875rem;
    color: var(--pagination-text);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-button,
  .pagination-item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    border: 1px solid var(--pagination-border);
    border-radius: 0.375rem;
    background-color: var(--pagination-bg);
    color: var(--pagination-text);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .pagination-button:hover:not(.disabled),
  .pagination-item:hover:not(.active) {
    background-color: var(--pagination-hover);
    border-color: var(--pagination-active);
  }

  .pagination-item.active {
    background-color: var(--pagination-active);
    color: var(--pagination-active-text);
    border-color: var(--pagination-active);
  }

  .pagination-button.disabled {
    color: var(--pagination-disabled);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .pagination-ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    color: var(--pagination-text);
    font-weight: 500;
  }

  /* Focus styles for accessibility */
  .pagination-button:focus,
  .pagination-item:focus {
    outline: 2px solid var(--pagination-active);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    .pagination {
      margin: 1rem 0;
      padding: 0.75rem;
    }

    .pagination-controls {
      gap: 0.125rem;
    }

    .pagination-button,
    .pagination-item {
      min-width: 2rem;
      height: 2rem;
      font-size: 0.75rem;
    }

    .pagination-ellipsis {
      min-width: 1.5rem;
      height: 2rem;
    }
  }
</style>