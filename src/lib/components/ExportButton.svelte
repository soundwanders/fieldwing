<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import {
		exportPlayerStats,
		exportTeamStats,
		exportGameResults,
		canExport,
		getExportSummary,
		type ExportOptions
	} from '$lib/utils/csvExport';
	import type { Game, PlayerStat, TeamStat } from '$lib/types/api';

	// Props
	export let data: Game[] | PlayerStat[] | TeamStat[] = [];
	export let type: 'games' | 'player-stats' | 'team-stats' = 'games';
	export let variant: 'primary' | 'secondary' | 'outline' = 'outline';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let filename: string = '';
	export let disabled: boolean = false;
	export let showIcon: boolean = true;
	export let showCount: boolean = false;

	// State
	let isExporting = false;
	let exportError: string | null = null;

	// Computed properties
	$: exportSummary = getExportSummary(data);
	$: isDisabled = disabled || !exportSummary.canExport || isExporting;

	// Export function
	async function handleExport(): Promise<void> {
		if (isDisabled) return;

		isExporting = true;
		exportError = null;

		try {
			const options: ExportOptions = {
				filename: filename || undefined,
				timestamp: true
			};

			switch (type) {
				case 'player-stats':
					exportPlayerStats(data as PlayerStat[], options);
					break;
				case 'team-stats':
					exportTeamStats(data as TeamStat[], options);
					break;
				case 'games':
					exportGameResults(data as Game[], options);
					break;
				default:
					throw new Error(`Unsupported export type: ${type}`);
			}

			// Show success feedback briefly
			await new Promise((resolve) => setTimeout(resolve, 500));
		} catch (error) {
			console.error('Export failed:', error);
			exportError = error instanceof Error ? error.message : 'Export failed';

			// Clear error after 3 seconds
			setTimeout(() => {
				exportError = null;
			}, 3000);
		} finally {
			isExporting = false;
		}
	}

	// Get appropriate label
	function getButtonLabel(): string {
		if (isExporting) return 'Exporting...';
		if (exportError) return 'Export Failed';
		if (showCount && exportSummary.canExport) {
			return `Export CSV (${exportSummary.count})`;
		}
		return 'Export CSV';
	}

	// Get appropriate title/tooltip
	function getButtonTitle(): string {
		if (isExporting) return 'Export in progress...';
		if (exportError) return exportError;
		if (!exportSummary.canExport) return exportSummary.message;
		return `Export ${exportSummary.count} record${
			exportSummary.count !== 1 ? 's' : ''
		} to CSV file`;
	}
</script>

<button
	class="export-button"
	class:light={!$theme}
	class:dark={$theme}
	class:variant-primary={variant === 'primary'}
	class:variant-secondary={variant === 'secondary'}
	class:variant-outline={variant === 'outline'}
	class:size-small={size === 'small'}
	class:size-medium={size === 'medium'}
	class:size-large={size === 'large'}
	class:is-exporting={isExporting}
	class:has-error={!!exportError}
	disabled={isDisabled}
	on:click={handleExport}
	title={getButtonTitle()}
	type="button"
>
	{#if showIcon}
		<span class="export-icon" class:spinning={isExporting}>
			{#if isExporting}
				⏳
			{:else if exportError}
				❌
			{:else}
				📊
			{/if}
		</span>
	{/if}

	<span class="export-label">
		{getButtonLabel()}
	</span>
</button>

<style>
	.light {
		--button-text: #374151;
		--button-primary-bg: #3b82f6;
		--button-primary-text: #ffffff;
		--button-primary-hover: #2563eb;
		--button-secondary-bg: #10b981;
		--button-secondary-text: #ffffff;
		--button-secondary-hover: #059669;
		--button-outline-bg: transparent;
		--button-outline-border: #3b82f6;
		--button-outline-text: #3b82f6;
		--button-outline-hover-bg: #3b82f6;
		--button-outline-hover-text: #ffffff;
		--button-disabled-bg: #e5e7eb;
		--button-disabled-text: #9ca3af;
		--button-error-bg: #ef4444;
		--button-error-text: #ffffff;
	}

	.dark {
		--button-text: #d1d5db;
		--button-primary-bg: #3b82f6;
		--button-primary-text: #ffffff;
		--button-primary-hover: #2563eb;
		--button-secondary-bg: #10b981;
		--button-secondary-text: #ffffff;
		--button-secondary-hover: #059669;
		--button-outline-bg: transparent;
		--button-outline-border: #60a5fa;
		--button-outline-text: #60a5fa;
		--button-outline-hover-bg: #60a5fa;
		--button-outline-hover-text: #1e293b;
		--button-disabled-bg: #374151;
		--button-disabled-text: #6b7280;
		--button-error-bg: #ef4444;
		--button-error-text: #ffffff;
	}

	.export-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		white-space: nowrap;
		outline: none;
		position: relative;
		overflow: hidden;
	}

	/* Size variants */
	.size-small {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
	}

	.size-medium {
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
	}

	.size-large {
		padding: 1rem 2rem;
		font-size: 1rem;
	}

	/* Color variants */
	.variant-primary {
		background: var(--button-primary-bg);
		color: var(--button-primary-text);
		border: 2px solid var(--button-primary-bg);
	}

	.variant-primary:hover:not(:disabled) {
		background: var(--button-primary-hover);
		border-color: var(--button-primary-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.variant-secondary {
		background: var(--button-secondary-bg);
		color: var(--button-secondary-text);
		border: 2px solid var(--button-secondary-bg);
	}

	.variant-secondary:hover:not(:disabled) {
		background: var(--button-secondary-hover);
		border-color: var(--button-secondary-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.variant-outline {
		background: var(--button-outline-bg);
		color: var(--button-outline-text);
		border: 2px solid var(--button-outline-border);
	}

	.variant-outline:hover:not(:disabled) {
		background: var(--button-outline-hover-bg);
		color: var(--button-outline-hover-text);
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	/* States */
	.export-button:disabled {
		background: var(--button-disabled-bg) !important;
		color: var(--button-disabled-text) !important;
		border-color: var(--button-disabled-bg) !important;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: none !important;
		opacity: 0.6;
	}

	.export-button.has-error {
		background: var(--button-error-bg) !important;
		color: var(--button-error-text) !important;
		border-color: var(--button-error-bg) !important;
	}

	.export-button.is-exporting {
		cursor: wait;
	}

	/* Icon animations */
	.export-icon {
		display: inline-block;
		font-size: 1em;
		transition: transform 0.2s ease;
	}

	.export-icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.export-label {
		font-weight: inherit;
	}

	/* Focus styles for accessibility */
	.export-button:focus {
		outline: 2px solid var(--button-outline-border);
		outline-offset: 2px;
	}

	/* Loading animation */
	.export-button.is-exporting::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.export-button {
			justify-content: center;
		}

		.size-small {
			padding: 0.75rem 1rem;
			font-size: 0.875rem;
		}

		.size-medium {
			padding: 0.875rem 1.5rem;
			font-size: 1rem;
		}

		.size-large {
			padding: 1rem 2rem;
			font-size: 1.125rem;
		}
	}
</style>
