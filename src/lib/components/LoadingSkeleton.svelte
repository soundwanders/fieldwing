<script lang="ts">
	export let rows: number = 3;
	export let columns: number = 1;
	export let height: string = '1rem';
	export let width: string = '100%';
	export let borderRadius: string = '0.25rem';
</script>

<div class="skeleton-container" role="status" aria-label="Loading content">
	{#each Array(rows) as _, rowIndex}
		<div class="skeleton-row">
			{#each Array(columns) as _, colIndex}
				<div
					class="skeleton-item"
					style="height: {height}; width: {width}; border-radius: {borderRadius}"
				/>
			{/each}
		</div>
	{/each}
</div>

<style>
	.skeleton-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.skeleton-row {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.skeleton-item {
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Dark theme support */
	@media (prefers-color-scheme: dark) {
		.skeleton-item {
			background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
			background-size: 200% 100%;
		}
	}

	/* Accessibility: Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.skeleton-item {
			animation: none;
			background: #e0e0e0;
		}

		@media (prefers-color-scheme: dark) {
			.skeleton-item {
				background: #3a3a3a;
			}
		}
	}
</style>
