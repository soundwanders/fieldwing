<!-- src/lib/components/Pagination.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { theme } from '$lib/stores/theme';

	export let totalItems: number;
	export let pageSize: number = 50;
	export let currentPage: number = 0;
	export let maxVisiblePages: number = 7;

	const dispatch = createEventDispatcher<{
		pageChange: number;
	}>();

	$: totalPages = Math.ceil(totalItems / pageSize);
	$: startItem = currentPage * pageSize + 1;
	$: endItem = Math.min((currentPage + 1) * pageSize, totalItems);

	// Calculate visible page range
	$: visiblePages = (() => {
		if (totalPages <= maxVisiblePages) {
			return Array.from({ length: totalPages }, (_, i) => i);
		}

		const halfVisible = Math.floor(maxVisiblePages / 2);
		let start = Math.max(0, currentPage - halfVisible);
		let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

		// Adjust start if we're near the end
		if (end - start < maxVisiblePages - 1) {
			start = Math.max(0, end - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	})();

	function goToPage(page: number) {
		if (page >= 0 && page < totalPages && page !== currentPage) {
			dispatch('pageChange', page);
		}
	}

	function goToFirst() {
		goToPage(0);
	}

	function goToLast() {
		goToPage(totalPages - 1);
	}

	function goToPrevious() {
		goToPage(currentPage - 1);
	}

	function goToNext() {
		goToPage(currentPage + 1);
	}

	$: canGoPrevious = currentPage > 0;
	$: canGoNext = currentPage < totalPages - 1;
</script>

{#if totalPages > 1}
	<nav class="pagination" class:light={!$theme} class:dark={$theme} aria-label="Pagination Navigation">
		<div class="pagination-info">
			<span class="pagination-text">
				Showing <strong>{startItem.toLocaleString()}</strong> to 
				<strong>{endItem.toLocaleString()}</strong> of 
				<strong>{totalItems.toLocaleString()}</strong> results
			</span>
		</div>

		<div class="pagination-controls">
			<!-- First Page -->
			<button
				class="pagination-button pagination-edge"
				on:click={goToFirst}
				disabled={!canGoPrevious}
				aria-label="Go to first page"
				title="First page"
			>
				⟪
			</button>

			<!-- Previous Page -->
			<button
				class="pagination-button pagination-nav"
				on:click={goToPrevious}
				disabled={!canGoPrevious}
				aria-label="Go to previous page"
				title="Previous page"
			>
				‹
			</button>

			<!-- Page Numbers -->
			{#each visiblePages as page}
				<button
					class="pagination-button pagination-number"
					class:active={page === currentPage}
					on:click={() => goToPage(page)}
					aria-label="Go to page {page + 1}"
					aria-current={page === currentPage ? 'page' : undefined}
				>
					{page + 1}
				</button>
			{/each}

			<!-- Next Page -->
			<button
				class="pagination-button pagination-nav"
				on:click={goToNext}
				disabled={!canGoNext}
				aria-label="Go to next page"
				title="Next page"
			>
				›
			</button>

			<!-- Last Page -->
			<button
				class="pagination-button pagination-edge"
				on:click={goToLast}
				disabled={!canGoNext}
				aria-label="Go to last page"
				title="Last page"
			>
				⟫
			</button>
		</div>

		<!-- Page Jump Input (for large datasets) -->
		{#if totalPages > 10}
			<div class="pagination-jump">
				<label for="page-jump" class="pagination-jump-label">Go to page:</label>
				<input
					id="page-jump"
					type="number"
					min="1"
					max={totalPages}
					value={currentPage + 1}
					class="pagination-jump-input"
					on:change={(e) => {
						const page = parseInt(e.currentTarget.value) - 1;
						if (page >= 0 && page < totalPages) {
							goToPage(page);
						}
					}}
				/>
				<span class="pagination-jump-total">of {totalPages}</span>
			</div>
		{/if}
	</nav>
{/if}

<style>
	.light {
		--pagination-bg: #ffffff;
		--pagination-border: #e5e7eb;
		--pagination-text: #374151;
		--pagination-text-muted: #6b7280;
		--pagination-button-bg: #ffffff;
		--pagination-button-hover: #f3f4f6;
		--pagination-button-active: #3b82f6;
		--pagination-button-active-text: #ffffff;
		--pagination-button-disabled: #f9fafb;
		--pagination-button-disabled-text: #d1d5db;
		--pagination-input-bg: #ffffff;
		--pagination-input-border: #d1d5db;
	}

	.dark {
		--pagination-bg: #1f2937;
		--pagination-border: #374151;
		--pagination-text: #f3f4f6;
		--pagination-text-muted: #9ca3af;
		--pagination-button-bg: #374151;
		--pagination-button-hover: #4b5563;
		--pagination-button-active: #3b82f6;
		--pagination-button-active-text: #ffffff;
		--pagination-button-disabled: #1f2937;
		--pagination-button-disabled-text: #6b7280;
		--pagination-input-bg: #374151;
		--pagination-input-border: #4b5563;
	}

	.pagination {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		padding: 1.5rem;
		background: var(--pagination-bg);
		border: 1px solid var(--pagination-border);
		border-radius: 0.5rem;
	}

	.pagination-info {
		display: flex;
		justify-content: center;
	}

	.pagination-text {
		font-size: 0.875rem;
		color: var(--pagination-text-muted);
	}

	.pagination-text strong {
		color: var(--pagination-text);
		font-weight: 600;
	}

	.pagination-controls {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.pagination-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: var(--pagination-button-bg);
		border: 1px solid var(--pagination-border);
		color: var(--pagination-text);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 0.375rem;
		min-width: 2.5rem;
		height: 2.5rem;
	}

	.pagination-button:hover:not(:disabled) {
		background: var(--pagination-button-hover);
		border-color: var(--pagination-button-active);
	}

	.pagination-button:disabled {
		background: var(--pagination-button-disabled);
		color: var(--pagination-button-disabled-text);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.pagination-button.active {
		background: var(--pagination-button-active);
		color: var(--pagination-button-active-text);
		border-color: var(--pagination-button-active);
		font-weight: 600;
	}

	.pagination-edge {
		font-size: 1rem;
	}

	.pagination-nav {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.pagination-number {
		min-width: 2.5rem;
	}

	.pagination-jump {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--pagination-text-muted);
	}

	.pagination-jump-label {
		font-weight: 500;
	}

	.pagination-jump-input {
		width: 4rem;
		padding: 0.375rem 0.5rem;
		background: var(--pagination-input-bg);
		border: 1px solid var(--pagination-input-border);
		border-radius: 0.375rem;
		color: var(--pagination-text);
		font-size: 0.875rem;
		text-align: center;
	}

	.pagination-jump-input:focus {
		outline: 2px solid var(--pagination-button-active);
		outline-offset: 2px;
		border-color: var(--pagination-button-active);
	}

	.pagination-jump-total {
		font-weight: 500;
		color: var(--pagination-text);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.pagination {
			padding: 1rem;
		}

		.pagination-controls {
			gap: 0.125rem;
		}

		.pagination-button {
			padding: 0.375rem;
			min-width: 2rem;
			height: 2rem;
			font-size: 0.75rem;
		}

		.pagination-edge,
		.pagination-nav {
			font-size: 0.875rem;
		}

		.pagination-text {
			font-size: 0.75rem;
		}

		.pagination-jump {
			flex-direction: column;
			gap: 0.25rem;
			text-align: center;
		}

		.pagination-jump-input {
			width: 3rem;
		}
	}

	@media (max-width: 480px) {
		.pagination {
			gap: 0.75rem;
			padding: 0.75rem;
		}

		.pagination-controls {
			gap: 0.1rem;
		}

		.pagination-button {
			padding: 0.25rem;
			min-width: 1.75rem;
			height: 1.75rem;
			font-size: 0.7rem;
		}

		.pagination-text {
			font-size: 0.7rem;
			text-align: center;
		}

		/* Hide edge buttons on very small screens */
		.pagination-edge {
			display: none;
		}
	}

	/* Focus styles for accessibility */
	.pagination-button:focus {
		outline: 2px solid var(--pagination-button-active);
		outline-offset: 2px;
	}

	/* Reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.pagination-button {
			transition: none;
		}
	}
</style>