<!-- StatSearch.svelte -->
<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { getSchoolName } from '$lib/utils/getSchoolName';

	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';
	let seasonType: string = '';
	let category: string = '';

	// Limit input changes to a number between 1 and 14
	function handleWeekInput(
		event: Event & { currentTarget: HTMLInputElement },
		weekType: 'startWeek' | 'endWeek'
	) {
		const inputValue = Number(event.currentTarget.value);

		if (inputValue < 1 || inputValue > 14 || isNaN(inputValue)) {
			// If the value is negative, greater than 14, or not a number, we prevent the change
			event.currentTarget.value = '';
		}
	}

	// Function to handle form submission
	function handleSubmit() {
		// Validate startWeek and endWeek
		const isValidWeek = (value: number | '') => value === '' || (value >= 1 && value <= 14);

		if (!isValidWeek(startWeek) || !isValidWeek(endWeek)) {
			alert('Start Week and End Week must be between 1 and 14.');
			return;
		}

		// trim school mascot name if its present to only allow school name in query param
		let schoolName = getSchoolName(team);

		// Construct the URL with the provided parameters, leave out the unused parameters
		const queryParams = [
			`year=${encodeURIComponent(year)}`,
			`team=${encodeURIComponent(schoolName)}`,
			`conference=${encodeURIComponent(conference)}`,
			`startWeek=${isValidWeek(startWeek) ? startWeek : ''}`,
			`endWeek=${isValidWeek(endWeek) ? endWeek : ''}`,
			`seasonType=${encodeURIComponent(seasonType)}`,
			`category=${encodeURIComponent(category)}`
		]
			.filter((param) => param.split('=')[1] !== '')
			.join('&');

		const apiUrl = `/player-stats?${queryParams}`;

		// Use Svelte's goto function to navigate to the player-stats route
		goto(apiUrl);
	}
</script>

<section class="stats-section" class:light={!$theme} class:dark={$theme}>
	<div class="stats-wrapper">
		<figure class="players-wrapper">
			<img class="players-image" src="/players.png" alt="Player statistics" />
		</figure>

		<div class="stat-search-container">
			<h2 class="stats-title">Search Player Stats</h2>
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
					<input
						type="number"
						bind:value={startWeek}
						on:input={(e) => handleWeekInput(e, 'startWeek')}
					/>
				</label>

				<label>
					End Week:
					<input
						type="number"
						bind:value={endWeek}
						on:input={(e) => handleWeekInput(e, 'endWeek')}
					/>
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

	.players-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.players-image {
		height: auto;
		width: 8%;
	}

	.stats-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.stat-search-container {
		margin: 2rem auto;
		padding: 1rem 2rem;
		padding-bottom: 4rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	.stats-title {
		margin: 0;
		padding: 1rem 0 2rem 0;
	}

	label {
		display: block;
		margin-bottom: 10px;
	}

	input {
		width: 100%;
		padding: 0.5rem 0;
		margin: 0.5rem 0;
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
