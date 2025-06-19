// src/routes/head-to-head/+page.server.ts

import type { PageServerLoad } from './$types';
import { cfbdApi } from '$lib/api/cfbdClient';
import { getSchoolName } from '$lib/utils/getSchoolName';
import { error } from '@sveltejs/kit';

interface LoadResult {
	matchupData: any;
	searchParams: {
		team1: string;
		team2: string;
		minYear?: string;
		maxYear?: string;
		division?: string;
	};
	requestCount?: number;
}

export const load: PageServerLoad = async ({ url }): Promise<LoadResult> => {
	try {
		// Extract and validate parameters
		const team1Raw = url.searchParams.get('team1');
		const team2Raw = url.searchParams.get('team2');
		const minYear = url.searchParams.get('minYear') || '';
		const maxYear = url.searchParams.get('maxYear') || '';
		const division = url.searchParams.get('division') || '';

		console.log('🏈 Loading head-to-head matchup with params:', {
			team1: team1Raw,
			team2: team2Raw,
			minYear,
			maxYear,
			division
		});

		// Validate required parameters
		if (!team1Raw || !team2Raw) {
			throw error(400, 'Both team1 and team2 parameters are required for head-to-head matchups.');
		}

		// Extract school names (remove mascots)
		const team1 = getSchoolName(team1Raw.trim());
		const team2 = getSchoolName(team2Raw.trim());

		if (!team1 || !team2) {
			throw error(400, 'Invalid team names provided.');
		}

		if (team1.toLowerCase() === team2.toLowerCase()) {
			throw error(400, 'Cannot compare a team against itself. Please select two different teams.');
		}

		// Validate year parameters if provided
		const currentYear = new Date().getFullYear();

		if (minYear) {
			const minYearNum = parseInt(minYear);
			if (isNaN(minYearNum) || minYearNum < 1900 || minYearNum > currentYear + 1) {
				throw error(
					400,
					`Invalid minimum year: ${minYear}. Year must be between 1900 and ${currentYear + 1}.`
				);
			}
		}

		if (maxYear) {
			const maxYearNum = parseInt(maxYear);
			if (isNaN(maxYearNum) || maxYearNum < 1900 || maxYearNum > currentYear + 1) {
				throw error(
					400,
					`Invalid maximum year: ${maxYear}. Year must be between 1900 and ${currentYear + 1}.`
				);
			}
		}

		// Validate year range
		if (minYear && maxYear) {
			const minYearNum = parseInt(minYear);
			const maxYearNum = parseInt(maxYear);
			if (minYearNum > maxYearNum) {
				throw error(400, 'Minimum year cannot be greater than maximum year.');
			}
		}

		console.log(`📡 Fetching head-to-head matchup: ${team1} vs ${team2}`);

		// Fetch matchup data with year parameters
		const matchupData = await cfbdApi.getTeamMatchup({
			team1,
			team2,
			minYear: minYear || undefined,
			maxYear: maxYear || undefined
		});

		if (!matchupData) {
			console.warn('⚠️ No matchup data returned from API');
			throw error(
				404,
				`No head-to-head data found for ${team1} vs ${team2}. These teams may not have played each other in the specified time period.`
			);
		}

		// Filter games by year range if the API didn't already do it
		if (matchupData.games && (minYear || maxYear)) {
			const minYearNum = minYear ? parseInt(minYear) : 0;
			const maxYearNum = maxYear ? parseInt(maxYear) : 9999;
			matchupData.games = matchupData.games.filter((game: any) => {
				const gameYear = game.season;
				return gameYear >= minYearNum && gameYear <= maxYearNum;
			});

			// Update the matchup metadata to reflect filtered data
			if (matchupData.games.length > 0) {
				const years = matchupData.games.map((game: any) => game.season);
				matchupData.startYear = Math.min(...years);
				matchupData.endYear = Math.max(...years);

				// Recalculate win counts for filtered games
				const team1Wins = matchupData.games.filter(
					(game: any) => game.winner === matchupData.team1
				).length;
				const team2Wins = matchupData.games.filter(
					(game: any) => game.winner === matchupData.team2
				).length;
				const ties = matchupData.games.filter((game: any) => game.winner === 'Tie').length;

				matchupData.team1Wins = team1Wins;
				matchupData.team2Wins = team2Wins;
				matchupData.ties = ties;
			}
		}

		console.log(
			`✅ Successfully fetched matchup data with ${matchupData.games?.length || 0} games`
		);
		console.log(`🔢 Total API requests made: ${cfbdApi.getRequestCount()}`);

		const result: LoadResult = {
			matchupData,
			searchParams: {
				team1: team1Raw, // Keep original names for display
				team2: team2Raw,
				minYear: minYear || undefined,
				maxYear: maxYear || undefined,
				division: division || undefined
			},
			requestCount: cfbdApi.getRequestCount()
		};

		console.log('✅ Head-to-head page load completed successfully');
		return result;
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('💥 Unexpected error in head-to-head page load:', err);
		const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
		throw error(500, `Failed to load matchup data: ${errorMessage}`);
	}
};
