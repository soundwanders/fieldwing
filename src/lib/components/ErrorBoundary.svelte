<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';

  export let error: Error | null = null;
  export let fallback: boolean = true;
  export let title: string = 'Something went wrong';
  export let message: string = 'We encountered an unexpected error. Please try again or report this issue if it persists.';

  const dispatch = createEventDispatcher();

  function retry() {
    error = null;
    dispatch('retry');
  }

  function reportError() {
    // In a real app, you'd send this to an error reporting service
    console.error('User reported error:', error);
    dispatch('report', error);
    
    // For now, just show a simple alert
    alert('Thank you for reporting this issue. We will investigate it.');
  }

  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      error = event.error;
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      error = new Error(event.reason);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });
</script>

{#if error && fallback}
  <div class="error-boundary" class:light={!$theme} class:dark={$theme}>
    <div class="error-content">
      <div class="error-icon" role="img" aria-label="Error">⚠️</div>
      <h2>{title}</h2>
      <p class="error-message">{message}</p>
      
      {#if error.message}
        <details class="error-details">
          <summary>Technical Details</summary>
          <code>{error.message}</code>
          {#if error.stack}
            <pre class="error-stack">{error.stack}</pre>
          {/if}
        </details>
      {/if}

      <div class="error-actions">
        <button class="retry-button" on:click={retry} type="button">
          🔄 Try Again
        </button>
        <button class="report-button" on:click={reportError} type="button">
          📧 Report Issue
        </button>
        <a href="/" class="home-button">
          🏠 Go Home
        </a>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .light {
    --background-color: #f9f9f9;
    --text-color: #1a202c;
    --error-bg: #fef2f2;
    --error-border: #fecaca;
    --button-bg: #ef4444;
    --button-hover: #dc2626;
    --secondary-button-bg: #6b7280;
    --secondary-button-hover: #4b5563;
    --code-bg: rgba(239, 68, 68, 0.1);
  }

  .dark {
    --background-color: #1a202c;
    --text-color: #f9f9f9;
    --error-bg: #451a1a;
    --error-border: #7c2d2d;
    --button-bg: #dc2626;
    --button-hover: #b91c1c;
    --secondary-button-bg: #4b5563;
    --secondary-button-hover: #374151;
    --code-bg: rgba(220, 38, 38, 0.2);
  }

  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    background-color: var(--background-color);
    color: var(--text-color);
    width: 100%;
  }

  .error-content {
    text-align: center;
    max-width: 600px;
    background-color: var(--error-bg);
    border: 1px solid var(--error-border);
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: pulse 2s infinite;
  }

  .error-content h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .error-message {
    margin: 1rem 0 2rem 0;
    line-height: 1.6;
    color: var(--text-color);
  }

  .error-details {
    margin: 1.5rem 0;
    text-align: left;
    background-color: var(--code-bg);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .error-details summary:hover {
    text-decoration: underline;
  }

  .error-details code {
    background: var(--code-bg);
    padding: 0.5rem;
    border-radius: 0.25rem;
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color);
    word-wrap: break-word;
  }

  .error-stack {
    background: var(--code-bg);
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-color);
    overflow-x: auto;
    max-height: 200px;
    white-space: pre-wrap;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }

  .retry-button,
  .report-button,
  .home-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
  }

  .retry-button {
    background-color: var(--button-bg);
    color: white;
  }

  .retry-button:hover {
    background-color: var(--button-hover);
    transform: translateY(-1px);
  }

  .report-button,
  .home-button {
    background-color: var(--secondary-button-bg);
    color: white;
  }

  .report-button:hover,
  .home-button:hover {
    background-color: var(--secondary-button-hover);
    transform: translateY(-1px);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 768px) {
    .error-boundary {
      padding: 1rem;
      min-height: 300px;
    }

    .error-content {
      padding: 1.5rem;
    }

    .error-icon {
      font-size: 3rem;
    }

    .error-content h2 {
      font-size: 1.25rem;
    }

    .error-actions {
      flex-direction: column;
      align-items: center;
    }

    .retry-button,
    .report-button,
    .home-button {
      width: 100%;
      max-width: 200px;
    }
  }
</style>