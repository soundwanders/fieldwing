<!-- src/lib/components/FormField.svelte -->
<script lang="ts">
  import { theme } from '$lib/stores/theme';

  export let label: string;
  export let type: string = 'text';
  export let value: string | number = '';
  export let error: string | undefined = undefined;
  export let placeholder: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let min: string | number | undefined = undefined;
  export let max: string | number | undefined = undefined;
  export let id: string = `field-${Math.random().toString(36).substr(2, 9)}`;
  export let name: string = id;
  export let options: Array<{value: string | number, label: string}> = [];

  // Create a custom event dispatcher for value changes
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    input: { value: string | number };
    change: { value: string | number };
    blur: { value: string | number };
    focus: { value: string | number };
  }>();

  // Handle input changes and dispatch events
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue = type === 'number' ? 
      (target.value === '' ? '' : Number(target.value)) : 
      target.value;
    
    value = newValue;
    dispatch('input', { value: newValue });
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue = type === 'number' ? 
      (target.value === '' ? '' : Number(target.value)) : 
      target.value;
    
    value = newValue;
    dispatch('change', { value: newValue });
  }

  function handleBlur(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue = type === 'number' ? 
      (target.value === '' ? '' : Number(target.value)) : 
      target.value;
    
    dispatch('blur', { value: newValue });
  }

  function handleFocus(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const newValue = type === 'number' ? 
      (target.value === '' ? '' : Number(target.value)) : 
      target.value;
    
    dispatch('focus', { value: newValue });
  }
</script>

<div class="form-field" class:light={!$theme} class:dark={$theme} class:error={!!error}>
  <label for={id} class="field-label">
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
    {#if error}
      <span class="error-text">({error})</span>
    {/if}
  </label>
  
  {#if type === 'select' && options.length > 0}
    <select
      {id}
      {name}
      {required}
      {disabled}
      value={value}
      on:input={handleInput}
      on:change={handleChange}
      on:blur={handleBlur}
      on:focus={handleFocus}
      class="field-input"
      class:error={!!error}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {:else}
    <input
      {id}
      {name}
      {type}
      {placeholder}
      {required}
      {disabled}
      {min}
      {max}
      value={value}
      on:input={handleInput}
      on:change={handleChange}
      on:blur={handleBlur}
      on:focus={handleFocus}
      class="field-input"
      class:error={!!error}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  {/if}
  
  {#if error}
    <span id="{id}-error" class="error-message" role="alert">
      {error}
    </span>
  {/if}
</div>

<style>
  .light {
    --label-color: #374151;
    --input-bg: #ffffff;
    --input-border: #d1d5db;
    --input-border-focus: #3b82f6;
    --input-text: #111827;
    --error-color: #ef4444;
    --error-bg: #fef2f2;
    --placeholder-color: #9ca3af;
  }

  .dark {
    --label-color: #d1d5db;
    --input-bg: #374151;
    --input-border: #4b5563;
    --input-border-focus: #60a5fa;
    --input-text: #f9fafb;
    --error-color: #f87171;
    --error-bg: #7f1d1d;
    --placeholder-color: #6b7280;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--label-color);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .required {
    color: var(--error-color);
    font-weight: 600;
  }

  .field-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--input-border);
    border-radius: 0.375rem;
    background-color: var(--input-bg);
    color: var(--input-text);
    font-size: 0.875rem;
    transition: all 0.2s ease;
    outline: none;
  }

  .field-input::placeholder {
    color: var(--placeholder-color);
  }

  .field-input:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .field-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--input-border);
  }

  .field-input.error {
    border-color: var(--error-color);
  }

  .field-input.error:focus {
    border-color: var(--error-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .error-message {
    font-size: 0.75rem;
    color: var(--error-color);
    margin-top: 0.25rem;
  }

  .form-field.error .field-label {
    color: var(--error-color);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .field-input {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
</style>