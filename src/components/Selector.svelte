<!-- Selector.svelte -->

<script lang="ts">
	/**
	 * @type {string[]}
	 */
	export let leagues: string[]; // Specify the type as string[]

	/**
	 * @type {string}
	 */
	export let selectedLeague: string; // Specify the type as string
</script>

<section class="select-section">
	<form class="selector-form">
		<h2>Select Items</h2>
		<button type="button" class="select-team-button">
			<span>Select an item</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>
		<select aria-hidden="true" tabindex="-1">
			<option value="" />
			<option value="painting">Painting</option>
			<option value="sculpture">Sculpture</option>
			<option value="drawing">Drawing</option>
			<option value="photography">Photography</option>
			<option value="printmaking">Printmaking</option>
		</select>

		<button class="submit-team-button" type="submit">Submit</button>
	</form>

	<div class="selected-items mt-10">
		<h2>Selected Items</h2>
		<ul>
			<li>Item 1</li>
			<li>Item 2</li>
		</ul>
	</div>
</section>

<style>
	.select-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #1a202c;
		padding: 2.5rem;
	}

	.selector-form {
		width: 100%;
		max-width: 20rem;
		background-color: #f9f9f9;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		color: #2d3748;
	}

	.selector-form h2 {
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		color: #f9f9f9;
	}

	.select-team-button {
		display: flex;
		height: 2.5rem;
		align-items: center;
		justify-content: space-between;
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		background-color: #edf2f7;
		padding: 0.75rem;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}

	.select-team-button span {
		pointer-events: none;
	}

	.select-team-button svg {
		height: 1rem;
		width: 1rem;
		opacity: 0.5;
	}

	.submit-team-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
		outline: none;
		cursor: pointer;
	}

	.submit-team-button:disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	.submit-team-button:hover {
		background-color: #4299e1;
		color: #f9f9f9;
	}

	.mt-10 {
		margin-top: 2.5rem;
	}

	.selected-items {
		width: 100%;
		max-width: 20rem;
		background-color: #f9f9f9;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 1.5rem;
		color: #2d3748;
	}

	.selected-items h2 {
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 1.5rem;
		color: #f9f9f9;
	}

	.selected-items li {
		border-bottom: 1px solid #e2e8f0;
		padding: 0.5rem 1rem;
		color: #2d3748;
	}

	.selected-items li:last-child {
		border-bottom: none;
	}
</style>
