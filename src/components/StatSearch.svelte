<!-- StatSearch.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { getSchoolName } from '$lib/utils/getSchoolName';

	// State variables
	let year = '';
	let team = '';
	let conference = '';
	let startWeek = '';
	let endWeek = '';
	let seasonType = '';
	let category = '';

	// Function to handle form submission
	function handleSubmit() {
		// trim school mascot name if its present to only allow school name in query param
		let schoolName = getSchoolName(team);

		// Construct the URL with the provided parameters
		const apiUrl = `/player-stats?year=${year}&team=${schoolName}&conference=${conference}&startWeek=${startWeek}&endWeek=${endWeek}&seasonType=${seasonType}&category=${category}`;

		// Use Svelte's goto function to navigate to the player-stats route
		goto(apiUrl);
	}
</script>

<section class="stats-section" class:light={!$theme} class:dark={$theme}>
	<div class="stats-wrapper">
		<div class="stat-search-container">
			<h2>Stat Search</h2>
			<form on:submit|preventDefault={handleSubmit}>
				<label>
					Year:
					<input type="number" bind:value={year} required />
				</label>

				<label>
					Team:
					<input type="text" bind:value={team} />
				</label>

				<label>
					Conference:
					<input type="text" bind:value={conference} />
				</label>

				<label>
					Start Week:
					<input type="number" bind:value={startWeek} />
				</label>

				<label>
					End Week:
					<input type="number" bind:value={endWeek} />
				</label>

				<label>
					Season Type:
					<input type="text" bind:value={seasonType} />
				</label>

				<label>
					Category:
					<input type="text" bind:value={category} />
				</label>

				<div class="button-container">
					<button class="submit-button" type="submit" class:light={!$theme} class:dark={$theme}
						>Search</button
					>
				</div>
			</form>
		</div>
	</div>
</section>

<style>
	.stats-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.stats-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.stat-search-container {
		margin: 0 auto;
		padding: 2rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	label {
		display: block;
		margin-bottom: 10px;
	}

	input {
		width: 100%;
		padding: 0.5rem 0;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.9rem;
		background-color: var(--form-sub-background-color);
		color: var(--input-text-color);
		box-sizing: border-box;
	}

	.button-container {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.submit-button {
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		padding: 0.25rem 0.675rem;
		color: #fff;
		background-color: var(--primary-color);
		cursor: pointer;
	}

	.submit-button:hover {
		opacity: 0.9;
	}

	.submit-button:disabled {
		background-color: var(--button-disabled-background-color);
		cursor: not-allowed;
	}

	.submit-button:hover:disabled {
		background-color: var(--button-disabled-hover-color);
	}
</style>
