<!-- StatSearch.svelte -->

<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { goto } from '$app/navigation';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';

	let selectedCategory: string = '';
	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';
	let seasonType: string = '';

	let pageSize: number = 16;
	$: currentPage = (Number($page.url.searchParams.get('skip')) || 0) / pageSize;

  let categoryOptions = [
    'defense',
    'fumbles',
    'interceptions',
    'kicking',
    'kickReturns',
    'passing',
    'punting',
    'puntReturns',
    'receiving',
    'rushing'
  ];

  const categoryDisplayNames: Record<string, string> = {
    defense: 'Defense',
    fumbles: 'Fumbles',
    interceptions: 'Interceptions',
    kicking: 'Kicking',
    kickReturns: 'Kick Returns',
    passing: 'Passing',
    punting: 'Punting',
    puntReturns: 'Punt Returns',
    receiving: 'Receiving',
    rushing: 'Rushing'
  };

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
			`seasonType=${encodeURIComponent(seasonType)}`,
			`category=${encodeURIComponent(selectedCategory)}`,
			`limit=${pageSize}`,
			`skip=${currentPage * pageSize}`
		]
			.filter((param) => param.split('=')[1] !== '')
			.join('&');

		const apiUrl = `/player-stats?${queryParams}`;

		// Use Svelte goto function to navigate to the player-stats route
		goto(apiUrl);
	}
</script>

<section class="stats-section" class:light={!$theme} class:dark={$theme}>
	<div class="stats-wrapper">
		<figure class="stats-img-wrapper">
			<img class="playerstats-image" src="/playerstats.png" alt="Player statistics" />
		</figure>

		<article class="stat-search-container">
			<h2 class="stats-title">Search Player Stats</h2>
			<form on:submit|preventDefault={handleSubmit} class:light={!$theme} class:dark={$theme}>
				<label for="stat-category" class="select-label">
					Stat Category:
					<div class="input-container">
						<select id="stat-category" class="category-select" bind:value={selectedCategory} required>
							{#each categoryOptions as category (category)}
								<option value={category}>{categoryDisplayNames[category]}</option>
							{/each}
						</select>
					</div>
				</label>

				<label for="team">
					Team:
					<input id="team" type="text" bind:value={team} />
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

				<label for="season-type">
					Season Type:
					<input
						id="season-type"
						type="text"
						placeholder="Regular is the default value"
						bind:value={seasonType}
					/>
				</label>

				<div class="button-container">
					<button
						class="submit-button"
						type="submit"
						class:light={!$theme}
						class:dark={$theme}
						aria-label="Submit player stats search"
						disabled={selectedCategory.length === 0}
					>
						Search
					</button>
				</div>
			</form>
		</article>
	</div>
</section>

<style>
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

	.playerstats-image {
		height: auto;
		width: 8%;
	}

	.stat-search-container {
		margin: 2rem auto;
		padding: 1rem 2rem;
		padding-bottom: 3rem;
		margin-bottom: 5rem;
		border: 1px solid #ccc;
		border-radius: 8px;
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

	.stat-search-container label:nth-child(1) {
		width: 100%;
		padding: 0.5rem 0.25rem;
		text-align: center;
	}

	.stats-title {
		text-align: center;
		margin: 0;
		padding: 1rem 0 2rem 0;
	}

	.input-container {
		width: 47%;
		margin: 0 auto;
	}

	input,
	.category-select {
		width: 100%;
		padding: 0.5rem 0.25rem;
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
		.playerstats-image {
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

		.stat-search-container label:nth-child(1) {
			padding: 0.175rem 2rem;
			text-align: left;
		}

		.input-container {
			width: 100%;
		}

		.button-container {
			padding-bottom: 2.5rem;
		}
	}
</style>
