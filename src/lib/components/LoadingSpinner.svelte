<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let text: string = 'Loading...';
	export let overlay: boolean = false;
	export let color: string = '';
	export let fullScreen: boolean = false;
</script>

<div
	class="loading-container"
	class:overlay
	class:full-screen={fullScreen}
	class:size-small={size === 'small'}
	class:size-medium={size === 'medium'}
	class:size-large={size === 'large'}
	role="status"
	aria-label={text}
	aria-live="polite"
>
	<div class="spinner" style={color ? `border-left-color: ${color}` : ''} />
	{#if text}
		<p class="loading-text">{text}</p>
	{/if}
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
	}

	.loading-container.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		backdrop-filter: blur(2px);
	}

	.loading-container.full-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--background-color, #f9f9f9);
		z-index: 999;
	}

	.spinner {
		border: 3px solid rgba(0, 0, 0, 0.1);
		border-left: 3px solid var(--primary-color, #424ae1);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.size-small .spinner {
		width: 20px;
		height: 20px;
		border-width: 2px;
	}

	.size-medium .spinner {
		width: 40px;
		height: 40px;
	}

	.size-large .spinner {
		width: 60px;
		height: 60px;
		border-width: 4px;
	}

	.loading-text {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-color, #333);
		text-align: center;
		font-weight: 500;
	}

	.overlay .loading-text {
		color: white;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Accessibility: Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
			border-left-color: var(--primary-color, #424ae1);
		}
	}
</style>
