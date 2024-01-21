<!-- /src/components/PlayerStatsWidget.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	export let data: { playerStatsData?: any[] };
	const { playerStatsData } = data;

	// Define the PlayerStat interface
	interface PlayerStat {
		playerId: string;
		player: string;
		team: string;
		conference: string;
		startWeek: number;
		endWeek: number;
		seasonType: string;
		category: string;
		statType: string;
		stat: string;
	}

	// Create a writable store to hold the filtered and sorted data
	const filteredAndSortedStats = writable([]);

	// Function to fetch, filter, and sort data
	async function fetchData(year: string, criteria: any) {
		// Construct the URL based on user input
		let apiUrl = `https://api.collegefootballdata.com/stats/player/season?year=${encodeURIComponent(
			year
		)}`;

		// Filter out optional parameters that are not provided
		const optionalParamsList = [
			'team',
			'conference',
			'startWeek',
			'endWeek',
			'seasonType',
			'category'
		];
		const queryParams = optionalParamsList
			.filter((param) => {
				const value = criteria[param];
				return value !== null && value !== undefined && value !== '';
			})
			.map((param) => {
				const value = criteria[param];
				return `${param}=${encodeURIComponent(value || '')}`;
			})
			.join('&');

		// Append the constructed query parameters to the URL
		if (queryParams) {
			apiUrl += `&${queryParams}`;
		}

		// Simulate fetching data from an API
		// Replace this with your actual API call
		const response = await fetch(apiUrl);
		const data = await response.json();

		// Set the fetched data to the store
		filteredAndSortedStats.set(data);
	}

	// Run the fetch function on component mount
	onMount(() => {
		// Example criteria, you can customize this based on your needs
		const criteria = {
			team: '',
			conference: ''
			// Add other criteria as needed
		};

		fetchData('2023', criteria);
	});

	// Cleanup function on component destroy
	onDestroy(() => {
		// Cleanup tasks, if needed
	});

	// Subscribe to changes in the playerStatsData prop
	$: {
		// Update the store with the latest playerStatsData
		filteredAndSortedStats.set(playerStatsData);
	}

	// Function to filter and sort data based on criteria
	function filterAndSort(criteria: any) {
		// Common design pattern for filtering and sorting
		const result = playerStatsData.filter(filterFunction(criteria)).sort(sortFunction(criteria));

		// Update the filteredAndSortedStats store with the result
		filteredAndSortedStats.set(result);
	}

	// Helper function for filtering
	function filterFunction(criteria: any) {
		return (playerStat: PlayerStat) => {
			// Implement your filtering logic here
			// Example: return playerStat.category === criteria.category;
			return true; // Placeholder for demonstration
		};
	}

	// Helper function for sorting
	function sortFunction(criteria: any) {
		return (a: PlayerStat, b: PlayerStat) => {
			// Implement your sorting logic here
			// Example: return parseFloat(b.stat) - parseFloat(a.stat);
			return 0; // Placeholder for demonstration
		};
	}
</script>

<!-- Your component's HTML structure -->
<div>
	<!-- Display your filtered and sorted data here -->
	{#each $filteredAndSortedStats as playerStats}
		<!-- Your player stats data rendering logic here -->
		<p>{playerStats.player}</p>
	{/each}
</div>

<style>
	/* Add your component styles here */
</style>
