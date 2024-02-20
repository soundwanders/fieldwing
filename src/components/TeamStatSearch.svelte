<!-- TeamStatSearch.svelte -->

<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';

	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';

	let pageSize: number = 16;
	$: currentPage = (Number($page.url.searchParams.get('skip')) || 0) / pageSize;

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

	// Handle form submission on submit button click
	function handleSubmit() {
		// Validate startWeek and endWeek
		const isValidWeek = (value: number | '') => value === '' || (value >= 1 && value <= 14);

		if (!isValidWeek(startWeek) || !isValidWeek(endWeek)) {
			alert('Start Week and End Week must be between 1 and 14.');
			return;
		}

		if (startWeek > endWeek) {
			alert('Please make sure the start week is a lower number than the end week.');
			return;
		}

		if (endWeek < startWeek) {
			alert('Please make sure the end week is a greater number than the start week.');
			return;
		}

		// Trim school mascot name if its present to only allow school name in query param
		let schoolName = statsNameTrim(team);

		// Construct the URL with the provided parameters, and leave out any unused parameters
		const queryParams = [
			`year=${encodeURIComponent(year)}`,
			`team=${encodeURIComponent(schoolName)}`,
			`conference=${encodeURIComponent(conference)}`,
			`startWeek=${isValidWeek(startWeek) ? startWeek : ''}`,
			`endWeek=${isValidWeek(endWeek) ? endWeek : ''}`,
			`limit=${pageSize}`,
			`skip=${currentPage * pageSize}`
		]
			.filter((param) => param.split('=')[1] !== '')
			.join('&');

		const apiUrl = `/team-stats?${queryParams}`;

		// Use Svelte goto function to navigate to the team-stats route
		goto(apiUrl);
	}
</script>

<section class="stats-section" class:light={!$theme} class:dark={$theme}>
	<div class="stats-wrapper">
		<figure class="stats-img-wrapper">
			<img class="teamstats-image" src="/teamstats.png" alt="Team statistics" />
		</figure>

		<article class="stat-search-container">
			<h2 class="stats-title">Search Team Stats</h2>
			<form on:submit|preventDefault={handleSubmit} class:light={!$theme} class:dark={$theme}>
				<label for="team">
					Team:
					<input id="team" type="text" bind:value={team} required />
				</label>

				<label for="year">
					Year:
					<input id="year" type="number" bind:value={year} required />
				</label>

				<label for="start-week">
					Start Week:
					<input
						id="start-week"
						type="number"
						bind:value={startWeek}
						on:input={(e) => handleWeekInput(e, 'startWeek')}
					/>
				</label>

				<label for="end-week">
					End Week:
					<input
						id="end-week"
						type="number"
						bind:value={endWeek}
						on:input={(e) => handleWeekInput(e, 'endWeek')}
					/>
				</label>

				<label for="conference">
					Conference:
					<input id="conference" type="text" bind:value={conference} />
				</label>

				<div class="button-container">
					<button
						class="submit-button"
						type="submit"
						class:light={!$theme}
						class:dark={$theme}
						aria-label="Submit team stats search"
						disabled={team.length === 0}
					>
						Search
					</button>
				</div>
			</form>
		</article>
	</div>
</section>

<style module>
	.light {
		--form-background-color: #eeeef0;
		--form-sub-background-color: #f4f4f5;
		--label-color: #555;
		--input-background-color: #f9f9f9;
		--input-text-color: #333;
		--button-hover-color: #e0e0e0;
		--button-disabled-background-color: #7c7c7c;
		--button-disabled-hover-color: #5f5f5f;
		--placeholder-color: #888;
	}

	/* Dark Theme */
	.dark {
		--form-background-color: #1d232e;
		--form-sub-background-color: #242b38;
		--label-color: #b0b0b0;
		--input-background-color: #2b2b2b;
		--input-text-color: #f9f9f9;
		--button-hover-color: #444;
		--button-disabled-background-color: #707070;
		--button-disabled-hover-color: #5c5c5c;
		--placeholder-color: #666;
	}

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

	.stats-img-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.teamstats-image {
		height: auto;
		width: 8.75%;
	}

	.stat-search-container {
		margin: 2rem auto;
		padding: 1rem 2rem;
		padding-bottom: 3rem;
		margin-bottom: 5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		width: 35%;
	}

	.stat-search-container form {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.stat-search-container label {
		width: 47%;
		padding: 0.175rem 0;
		margin-bottom: 0.5rem;
		box-sizing: border-box;
	}

	.stats-title {
		text-align: center;
		margin: 0;
		padding: 1rem 0 2rem 0;
	}

	input {
		width: 100%;
		padding: 0.5rem 0.25rem;
		margin: 0.5rem 0;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		font-size: 0.9rem;
		background-color: var(--form-sub-background-color);
		color: var(--input-text-color);
		box-sizing: border-box;
	}

	.button-container {
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: 1.5rem;
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

	/* Add media query for smaller screens */
	@media screen and (max-width: 768px) {
		.stats-wrapper {
			width: 95%;
			padding: 0 2rem;
			margin-bottom: 4rem;
		}

		.teamstats-image {
			width: 33%;
			height: auto;
		}

		.stats-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
			padding: 1.75rem 0;
		}

		.stat-search-container {
			width: 100%;
			padding: 0;
			margin-bottom: 2rem;
		}

		.stat-search-container label {
			width: 100%;
			padding: 0.175rem 2rem;
			box-sizing: border-box;
		}

		.button-container {
			padding-bottom: 2.5rem;
		}
	}
</style>
