// src/routes/api/player-stats/+server.ts
import { json } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { RequestHandler } from './$types';
import type { PlayerStatsSearchParams, PlayerStatCategory } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Extract and validate query parameters
		const yearParam = url.searchParams.get('year');
		const teamParam = url.searchParams.get('team');
		const conferenceParam = url.searchParams.get('conference');
		const startWeekParam = url.searchParams.get('startWeek');
		const endWeekParam = url.searchParams.get('endWeek');
		const seasonTypeParam = url.searchParams.get('seasonType');
		const categoryParam = url.searchParams.get('category');
		const playerNameParam = url.searchParams.get('playerName');

		// Pagination parameters
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const skip = parseInt(url.searchParams.get('skip') || '0');

		console.log('🔍 Player stats API called with params:', {
			year: yearParam,
			team: teamParam,
			conference: conferenceParam,
			startWeek: startWeekParam,
			endWeek: endWeekParam,
			seasonType: seasonTypeParam,
			category: categoryParam,
			playerName: playerNameParam
		});

		// For player-specific searches, we'll search across multiple years if no year is specified
		const isPlayerSpecificSearch = playerNameParam && playerNameParam.trim();

		// Validate required parameters - year is only required if NOT searching for a specific player
		if (!yearParam && !isPlayerSpecificSearch) {
			return json(
				{
					success: false,
					error: 'Year parameter is required when not searching for a specific player',
					data: []
				},
				{ status: 400 }
			);
		}

		// If year is provided, validate it
		let year: number | undefined;
		if (yearParam) {
			year = parseInt(yearParam);
			const currentYear = new Date().getFullYear();
			if (isNaN(year) || year < 1900 || year > currentYear + 1) {
				return json(
					{
						success: false,
						error: `Invalid year. Must be between 1900 and ${currentYear + 1}`,
						data: []
					},
					{ status: 400 }
				);
			}
		}

		// For player-specific searches without a year, we'll search across a range of years
		const yearsToSearch: number[] = [];
		if (isPlayerSpecificSearch && !year) {
			// Search key years for college football (focus on years when famous players were active)
			const currentYear = new Date().getFullYear();
			// Include years from 1995-present for comprehensive coverage
			const startSearchYear = 1995;
			for (let y = currentYear; y >= startSearchYear; y--) {
				yearsToSearch.push(y);
			}
			console.log(
				`🔍 Searching for player "${playerNameParam}" across years: ${startSearchYear}-${currentYear} (${yearsToSearch.length} years)`
			);
		} else if (year) {
			yearsToSearch.push(year);
		}

		let allPlayerStats: any[] = [];
		let searchErrors: string[] = [];

		// Search across all specified years
		for (const searchYear of yearsToSearch) {
			try {
				// Clean up parameters for CFBD API
				const cfbdParams: PlayerStatsSearchParams = {
					year: searchYear
				};

				// Only add optional parameters if they have values
				if (teamParam && teamParam.trim()) {
					cfbdParams.team = teamParam.trim();
				}

				if (conferenceParam && conferenceParam.trim()) {
					cfbdParams.conference = conferenceParam.trim();
				}

				if (startWeekParam && startWeekParam.trim()) {
					const startWeek = parseInt(startWeekParam.trim());
					if (!isNaN(startWeek) && startWeek >= 1 && startWeek <= 20) {
						cfbdParams.startWeek = startWeek;
					}
				}

				if (endWeekParam && endWeekParam.trim()) {
					const endWeek = parseInt(endWeekParam.trim());
					if (!isNaN(endWeek) && endWeek >= 1 && endWeek <= 20) {
						cfbdParams.endWeek = endWeek;
					}
				}

				if (seasonTypeParam && seasonTypeParam !== 'regular') {
					cfbdParams.seasonType = seasonTypeParam as 'regular' | 'postseason' | 'both';
				}

				if (categoryParam && categoryParam.trim()) {
					// Validate category against allowed values
					const validCategories: PlayerStatCategory[] = [
						'passing',
						'rushing',
						'receiving',
						'defense',
						'kicking',
						'punting',
						'kickReturns',
						'puntReturns',
						'interceptions',
						'fumbles'
					];
					const category = categoryParam.trim() as PlayerStatCategory;
					if (validCategories.includes(category)) {
						cfbdParams.category = category;
					}
				}

				console.log(`📡 Calling CFBD API for year ${searchYear} with params:`, cfbdParams);

				// Call CFBD API using our client
				const yearStats = await cfbdApi.getPlayerStats(cfbdParams);

				// If searching for a specific player, filter results by player name
				let filteredStats = yearStats;
				if (isPlayerSpecificSearch) {
					const searchName = playerNameParam.toLowerCase().trim();
					filteredStats = yearStats.filter(
						(stat) => stat.player && stat.player.toLowerCase().includes(searchName)
					);
					console.log(
						`🎯 Found ${filteredStats.length} stats for "${playerNameParam}" in ${searchYear}`
					);
				}

				allPlayerStats.push(...filteredStats);
			} catch (error) {
				console.error(`❌ Error fetching stats for year ${searchYear}:`, error);
				searchErrors.push(
					`Year ${searchYear}: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
				// Continue searching other years even if one fails
			}
		}

		console.log(`✅ Total stats found across all years: ${allPlayerStats.length}`);

		// Remove duplicates (same player, same year, same category)
		const uniqueStats = allPlayerStats.filter((stat, index, arr) => {
			return (
				index ===
				arr.findIndex(
					(s) =>
						s.player === stat.player &&
						s.year === stat.year &&
						s.category === stat.category &&
						s.team === stat.team
				)
			);
		});

		console.log(`🔄 After deduplication: ${uniqueStats.length} unique stats`);

		// Sort by year (most recent first) and then by statistical performance
		uniqueStats.sort((a, b) => {
			// First sort by year (descending)
			if (b.year !== a.year) {
				return b.year - a.year;
			}
			// Then by player name for consistency
			return (a.player || '').localeCompare(b.player || '');
		});

		// Apply pagination
		const total = uniqueStats.length;
		const paginatedStats = uniqueStats.slice(skip, skip + limit);

		console.log(
			`📄 Returning ${paginatedStats.length} stats (page ${Math.floor(skip / limit) + 1})`
		);

		// Include search info in response
		const response: any = {
			success: true,
			data: paginatedStats,
			total: total,
			pagination: {
				limit,
				skip,
				page: Math.floor(skip / limit),
				totalPages: Math.ceil(total / limit),
				hasNext: skip + limit < total,
				hasPrev: skip > 0
			}
		};

		// Add search metadata for player-specific searches
		if (isPlayerSpecificSearch) {
			response.searchInfo = {
				playerName: playerNameParam,
				yearsSearched: yearsToSearch,
				totalYearsSearched: yearsToSearch.length,
				statsFoundByYear: yearsToSearch.reduce(
					(acc, year) => {
						const yearCount = allPlayerStats.filter((s) => s.year === year).length;
						if (yearCount > 0) acc[year] = yearCount;
						return acc;
					},
					{} as Record<number, number>
				)
			};
		}

		// Include any search errors as warnings
		if (searchErrors.length > 0) {
			response.warnings = searchErrors;
		}

		return json(response);
	} catch (error) {
		console.error('❌ Player stats API error:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return json(
			{
				success: false,
				error: `Failed to fetch player statistics: ${errorMessage}`,
				data: []
			},
			{ status: 500 }
		);
	}
};
