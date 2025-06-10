// src/routes/games/+page.server.ts
import type { PageServerLoad } from './$types';
import { cfbdApi } from '$lib/api/cfbdClient';
import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
import { getSchoolName } from '$lib/utils/getSchoolName';
import { error } from '@sveltejs/kit';

interface GameResult {
	team: string;
	data: any[];
	error: string | null;
}

interface LoadResult {
	gameResults: GameResult[];
	teams: string[];
	year: string;
	week: string;
	requestCount?: number;
}

export const load: PageServerLoad = async ({ url }): Promise<LoadResult> => {
	try {
		// Extract and validate parameters from URL
		const teams = url.searchParams.get('teams');
		const year = url.searchParams.get('year') || new Date().getFullYear().toString();
		const week = url.searchParams.get('week') || getCurrentWeek().toString();

		console.log('🏈 Loading games page with params:', { teams, year, week });

		// Validate required parameters
		if (!teams) {
			console.error('❌ No teams parameter provided');
			throw error(400, 'No teams specified. Please select teams from the game results page.');
		}

		// Parse and validate teams list
		const teamArray = teams
			.split(',')
			.map((team) => team.trim())
			.filter((team) => team.length > 0);

		if (teamArray.length === 0) {
			console.error('❌ Empty teams array after parsing');
			throw error(400, 'Invalid teams parameter. Please select valid teams.');
		}

		console.log(`📝 Processing ${teamArray.length} teams:`, teamArray);

		// Validate year and week parameters
		const yearNum = parseInt(year);
		const weekNum = parseInt(week);

		if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
			throw error(
				400,
				`Invalid year: ${year}. Year must be between 1900 and ${new Date().getFullYear() + 1}.`
			);
		}

		if (isNaN(weekNum) || weekNum < 1 || weekNum > 14) {
			throw error(400, `Invalid week: ${week}. Week must be between 1 and 14.`);
		}

		// Warn about future dates
		if (yearNum > new Date().getFullYear()) {
			console.warn(`⚠️ Requesting data for future year: ${yearNum}`);
		}

		// Process teams with proper error handling - NO CONCURRENT REQUESTS
		console.log('🚀 Starting sequential API requests...');

		const gameResults: GameResult[] = [];

		for (let i = 0; i < teamArray.length; i++) {
			const fullTeamName = teamArray[i];
			try {
				const schoolName = getSchoolName(fullTeamName.trim());
				console.log(`📡 Fetching games for team ${i + 1}/${teamArray.length}: ${schoolName}`);

				// Add delay between requests to avoid rate limiting
				if (i > 0) {
					await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
				}

				const data = await cfbdApi.getGames({
					year,
					week,
					team: schoolName
				});

				// Safely handle the response - don't treat empty results as errors
				const gamesArray = Array.isArray(data) ? data : [];
				console.log(`✅ Successfully fetched ${gamesArray.length} games for ${schoolName}`);

				// IMPORTANT: Empty results are NOT errors - they just mean no games scheduled
				gameResults.push({
					team: schoolName,
					data: gamesArray,
					error: null
				});
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
				console.error(`❌ Failed to fetch games for ${fullTeamName}:`, errorMessage);

				// Add failed result but continue processing other teams
				gameResults.push({
					team: getSchoolName(fullTeamName.trim()),
					data: [],
					error: `Failed to fetch games: ${errorMessage}`
				});
			}
		}

		// Log summary
		const successfulResults = gameResults.filter((result) => result.error === null);
		const failedResults = gameResults.filter((result) => result.error !== null);
		const totalGames = successfulResults.reduce((sum, result) => sum + result.data.length, 0);

		console.log(
			`📊 API Summary: ${successfulResults.length} successful, ${failedResults.length} failed`
		);
		console.log(`🎮 Total games found: ${totalGames}`);
		console.log(`🔢 Total API requests made: ${cfbdApi.getRequestCount()}`);

		// Check if we got any successful API calls (even if they returned 0 games)
		if (successfulResults.length === 0) {
			console.error('❌ No successful API results');
			throw error(
				500,
				'Failed to fetch game data for any of the selected teams. Please try again later.'
			);
		}

		// Log any failures but don't fail the entire request
		if (failedResults.length > 0) {
			console.warn(
				'⚠️ Some teams failed to load:',
				failedResults.map((r) => r.team)
			);
		}

		// Log info about empty results
		if (totalGames === 0) {
			console.info(
				`ℹ️ No games found for week ${week} of ${year}. This may be normal for future dates or bye weeks.`
			);
		}

		const loadResult: LoadResult = {
			gameResults: gameResults,
			teams: teamArray,
			year,
			week,
			requestCount: cfbdApi.getRequestCount()
		};

		console.log('✅ Games page load completed successfully');
		return loadResult;
	} catch (err) {
		// Handle any unexpected errors
		if (err instanceof Error && 'status' in err) {
			// This is already a SvelteKit error, re-throw it
			throw err;
		}

		console.error('💥 Unexpected error in games page load:', err);
		const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
		throw error(500, `Failed to load game data: ${errorMessage}`);
	}
};
