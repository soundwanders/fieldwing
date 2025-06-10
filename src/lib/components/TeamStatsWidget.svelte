<!-- TeamStatsWidget.svelte -->

<script lang="ts">
	import { page } from '$app/stores';
	import { statsNameTrim } from '$lib/utils/statsNameTrim';
	import { theme } from '$lib/stores/theme';

	let selectedCategory: string = '';
	let year: string = '';
	let team: string = '';
	let conference: string = '';
	let startWeek: number | '' = '';
	let endWeek: number | '' = '';

	let isInvalidWeekRange: boolean = false;

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

	// Declare a reactive variable to store the dynamic apiUrl
	let apiUrl: string = '';

	// Dynamically generate the apiUrl
	function generateApiUrl(): string {
		const isValidStartWeek = (value: number | '') => value === '' || (value >= 1 && value <= 14);
		const isValidEndWeek = (value: number | '') => value === '' || (value >= 1 && value <= 14);

		// Update isInvalidWeekRange directly
		isInvalidWeekRange =
			!isValidStartWeek(startWeek) ||
			!isValidEndWeek(endWeek) ||
			(startWeek > endWeek && endWeek !== '');

		if (isInvalidWeekRange) {
			return '';
		}

		let schoolName = statsNameTrim(team);

		const queryParams = [
			`year=${encodeURIComponent(year)}`,
			`team=${encodeURIComponent(schoolName)}`,
			`conference=${encodeURIComponent(conference)}`,
			`startWeek=${isValidStartWeek(startWeek) ? startWeek : ''}`,
			`endWeek=${isValidEndWeek(endWeek) ? endWeek : ''}`,
			`category=${encodeURIComponent(selectedCategory)}`,
			`limit=${pageSize}`,
			`skip=${currentPage * pageSize}`
		]
			.filter((param) => param.split('=')[1] !== '')
			.join('&');

		return `/team-stats?${queryParams}`;
	}

	// Handle input changes and trigger apiUrl generation
	function handleInput() {
		apiUrl = generateApiUrl();
	}

	// Reactively update the apiUrl
	$: apiUrl = generateApiUrl();
</script>

<section class="stats-widget" class:light={!$theme} class:dark={$theme}>
	<form class="stats-sort-form" on:input={handleInput} class:light={!$theme} class:dark={$theme}>
		<label for="team">
			Team:
			<input id="team" type="text" bind:value={team} />
		</label>

		<label for="conference">
			Conf:
			<input id="conference" type="text" bind:value={conference} />
		</label>

		<label for="year">
			Year:
			<input id="year" type="number" bind:value={year} required />
		</label>

		<label for="start-week">
			Start Week:
			<input
				id="start-week"
				class:invalid={isInvalidWeekRange}
				type="number"
				bind:value={startWeek}
				on:input={(e) => handleWeekInput(e, 'startWeek')}
			/>
		</label>

		<label for="end-week">
			End Week:
			<input
				id="end-week"
				class:invalid={isInvalidWeekRange}
				type="number"
				bind:value={endWeek}
				on:input={(e) => handleWeekInput(e, 'endWeek')}
			/>
		</label>
	</form>

	<div class="button-container">
		<a href={apiUrl} data-sveltekit-reload role="button">
			<button class="submit-button" type="button"> Search </button>
		</a>
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

	.stats-widget {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		align-content: center;
		width: 100%;
		padding: 0;
	}

	.stats-sort-form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		width: 100%;
	}

	label {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	input {
		width: 80%;
		padding: 0.5rem;
		box-sizing: border-box;
		background-color: var(--form-sub-background-color);
		color: var(--input-text-color);
		border: 1px solid #ccc;
		border-radius: 0.5rem;
	}

	.button-container {
		flex: 0 0 auto;
		margin: 1.5rem 0;
	}

	.submit-button {
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
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

	.invalid {
		border: 1px solid #ff4b4b;
	}

	@media (max-width: 768px) {
		.stats-widget {
			width: 100%;
			padding: 1rem;
			box-sizing: border-box;
		}

		.stats-sort-form {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			width: 100%;
			align-items: stretch;
		}

		label {
			display: flex;
			flex-direction: column;
			width: 100%;
			font-size: 0.875rem;
			line-height: 1.25rem;
			gap: 0.25rem;
		}

		input {
			width: 100%;
			padding: 0.75rem;
			box-sizing: border-box;
			background-color: var(--form-sub-background-color);
			color: var(--input-text-color);
			border: 1px solid #ccc;
			border-radius: 0.5rem;
			font-size: 16px; /* Prevent iOS zoom */
			margin-top: 0;
		}

		.button-container {
			width: 100%;
			margin: 1.5rem 0;
			display: flex;
			justify-content: center;
		}

		.submit-button {
			width: 100%;
			max-width: 200px;
			padding: 0.875rem 1rem;
			font-size: 1rem;
			border: none;
			border-radius: 0.5rem;
			color: #fff;
			background-color: var(--primary-color);
			cursor: pointer;
			touch-action: manipulation;
		}

		.submit-button:hover {
			opacity: 0.9;
		}

		.submit-button:disabled {
			background-color: var(--button-disabled-background-color);
			cursor: not-allowed;
		}

		.invalid {
			border: 1px solid #ff4b4b;
			background-color: rgba(255, 75, 75, 0.1);
		}
	}

	/* Extra small mobile devices */
	@media (max-width: 360px) {
		.stats-widget {
			padding: 0.75rem;
		}

		.stats-sort-form {
			gap: 0.75rem;
		}

		input {
			padding: 0.625rem;
			font-size: 16px; /* Prevent iOS zoom */
		}

		label {
			font-size: 0.8rem;
		}

		.submit-button {
			padding: 0.75rem 1rem;
			font-size: 0.9rem;
		}
	}
</style>
