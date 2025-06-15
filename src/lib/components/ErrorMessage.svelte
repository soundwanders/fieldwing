<!-- ErrorMessage.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';

	export let error: Error | string;
	export let title: string = 'Error';
	export let showDetails: boolean = true;
	export let onRetry: (() => void) | undefined = undefined;
	export let onReport: (() => void) | undefined = undefined;

	$: errorMessage = error instanceof Error ? error.message : error;
	$: errorStack = error instanceof Error ? error.stack : undefined;
</script>

<div class="error-container" class:light={!$theme} class:dark={$theme} role="alert">
	<div class="error-icon">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<div class="error-content">
		<h3 class="error-title">{title}</h3>
		<p class="error-message">{errorMessage}</p>

		{#if showDetails && errorStack}
			<details class="error-details">
				<summary>Technical Details</summary>
				<pre class="error-stack">{errorStack}</pre>
			</details>
		{/if}

		<div class="error-actions">
			{#if onRetry}
				<button class="retry-button" on:click={onRetry} type="button"> Try Again </button>
			{/if}

			{#if onReport}
				<button class="report-button" on:click={onReport} type="button"> Report Issue </button>
			{/if}
		</div>
	</div>
</div>

<style>
	.light {
		--error-bg: #fef2f2;
		--error-border: #fecaca;
		--error-text: #991b1b;
		--error-icon: #dc2626;
		--button-bg: #dc2626;
		--button-hover: #b91c1c;
		--details-bg: rgba(220, 38, 38, 0.1);
	}

	.dark {
		--error-bg: #451a1a;
		--error-border: #7c2d2d;
		--error-text: #fca5a5;
		--error-icon: #f87171;
		--button-bg: #dc2626;
		--button-hover: #b91c1c;
		--details-bg: rgba(248, 113, 113, 0.1);
	}

	.error-container {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		background-color: var(--error-bg);
		border: 1px solid var(--error-border);
		border-radius: 0.5rem;
		color: var(--error-text);
		margin: 1rem 0;
	}

	.error-icon {
		flex-shrink: 0;
		color: var(--error-icon);
		margin-top: 0.125rem;
	}

	.error-content {
		flex: 1;
		min-width: 0;
	}

	.error-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--error-text);
	}

	.error-message {
		font-size: 0.875rem;
		margin: 0 0 1rem 0;
		line-height: 1.5;
		color: var(--error-text);
	}

	.error-details {
		margin: 0.75rem 0;
		background: var(--details-bg);
		border-radius: 0.25rem;
		padding: 0.5rem;
	}

	.error-details summary {
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.25rem;
		color: var(--error-text);
	}

	.error-details summary:hover {
		text-decoration: underline;
	}

	.error-stack {
		margin: 0.5rem 0 0 0;
		padding: 0.75rem;
		background: var(--details-bg);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		overflow-x: auto;
		white-space: pre-wrap;
		color: var(--error-text);
		border: 1px solid var(--error-border);
	}

	.error-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.retry-button,
	.report-button {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s;
		color: white;
		background-color: var(--button-bg);
	}

	.retry-button:hover,
	.report-button:hover {
		background-color: var(--button-hover);
	}

	.report-button {
		background-color: #6b7280;
	}

	.report-button:hover {
		background-color: #4b5563;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.error-container {
			padding: 0.75rem;
		}

		.error-actions {
			flex-direction: column;
		}

		.retry-button,
		.report-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
