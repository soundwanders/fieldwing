// src/routes/api/games/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { GameSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams;

		console.log(
			'🏈 Games API Route called with params:',
			Object.fromEntries(searchParams.entries())
		);

		// Helper function to safely parse season type
		const parseSeasonType = (
			value: string | null
		): 'regular' | 'postseason' | 'both' | undefined => {
			if (!value) return undefined;
			if (value === 'regular' || value === 'postseason' || value === 'both') {
				return value;
			}
			return undefined;
		};

		// Helper function to safely parse integer
		const parseInteger = (value: string | null): number | undefined => {
			if (!value) return undefined;
			const parsed = parseInt(value);
			return isNaN(parsed) ? undefined : parsed;
		};

		// Build params with proper type conversion and validation
		const year = parseInteger(searchParams.get('year'));
		const week = parseInteger(searchParams.get('week'));
		const team = searchParams.get('team') || undefined;
		const home = searchParams.get('home') || undefined;
		const away = searchParams.get('away') || undefined;
		const conference = searchParams.get('conference') || undefined;
		const division = searchParams.get('division') || undefined;
		const seasonType = parseSeasonType(searchParams.get('seasonType'));
		const id = searchParams.get('id') || undefined;

		// Validate year if provided
		if (searchParams.get('year') && !year) {
			return json({ error: 'Invalid year parameter' }, { status: 400 });
		}

		// Validate week if provided
		if (searchParams.get('week') && !week) {
			return json({ error: 'Invalid week parameter' }, { status: 400 });
		}

		// Build clean params object
		const params: GameSearchParams = {
			...(year && { year }),
			...(week && { week }),
			...(team && { team }),
			...(home && { home }),
			...(away && { away }),
			...(conference && { conference }),
			...(division && { division }),
			...(seasonType && { seasonType }),
			...(id && { id })
		};

		console.log('🔍 Fetching games with validated params:', params);

		// Call the API
		const data = await cfbdApi.getGames(params);

		console.log(`✅ Games API returned ${data?.length || 0} records`);

		// Ensure we always return an array
		const responseData = Array.isArray(data) ? data : [];

		// Add some debugging info for empty results
		if (responseData.length === 0 && Object.keys(params).length > 0) {
			console.warn('⚠️ No games found for params:', params);
		}

		return json({
			data: responseData,
			total: responseData.length,
			requestCount: cfbdApi.getRequestCount(),
			params: params // Include params for debugging
		});
	} catch (error) {
		console.error('❌ Games API route error:', error);

		// Return more specific error information
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		const statusCode = errorMessage.includes('400')
			? 400
			: errorMessage.includes('404')
				? 404
				: 500;

		return json(
			{
				error: errorMessage,
				code: 'GAMES_ERROR',
				timestamp: new Date().toISOString()
			},
			{ status: statusCode }
		);
	}
};

// Add OPTIONS handler for CORS if needed
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};
