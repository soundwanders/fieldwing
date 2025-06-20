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
			category: categoryParam
		});

		// Validate required parameters
		if (!yearParam) {
			return json(
				{
					success: false,
					error: 'Year parameter is required',
					data: []
				},
				{ status: 400 }
			);
		}

		// Validate year range
		const year = parseInt(yearParam);
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

		// Clean up parameters for CFBD API
		const cfbdParams: PlayerStatsSearchParams = {
			year: year // Convert to number for CFBD API
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
				'passing', 'rushing', 'receiving', 'defense', 'kicking', 
				'punting', 'kickReturns', 'puntReturns', 'interceptions', 'fumbles'
			];
			const category = categoryParam.trim() as PlayerStatCategory;
			if (validCategories.includes(category)) {
				cfbdParams.category = category;
			}
		}

		console.log('📡 Calling CFBD API with cleaned params:', cfbdParams);

		// Call CFBD API using our client
		const playerStats = await cfbdApi.getPlayerStats(cfbdParams);

		console.log(`✅ CFBD API returned ${playerStats.length} player stats`);

		// Apply pagination
		const total = playerStats.length;
		const paginatedStats = playerStats.slice(skip, skip + limit);

		console.log(`📄 Returning ${paginatedStats.length} stats (page ${Math.floor(skip / limit) + 1})`);

		return json({
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
		});

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