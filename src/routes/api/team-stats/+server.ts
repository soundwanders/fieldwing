// src/routes/api/team-stats/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { TeamStatsSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams;

		// Helper function to safely parse year
		const parseYear = (value: string | null): string | undefined => {
			if (!value) return undefined;
			const parsed = parseInt(value);
			if (isNaN(parsed)) return undefined;
			return value; // Return as string since API expects string
		};

		// Helper function to safely parse integer
		const parseInteger = (value: string | null): number | undefined => {
			if (!value) return undefined;
			const parsed = parseInt(value);
			return isNaN(parsed) ? undefined : parsed;
		};

		// Build params with proper type conversion
		const year = parseYear(searchParams.get('year'));
		const team = searchParams.get('team') || undefined;
		const conference = searchParams.get('conference') || undefined;
		const startWeek = parseInteger(searchParams.get('startWeek'));
		const endWeek = parseInteger(searchParams.get('endWeek'));

		// Validate required parameters
		if (!year) {
			return json({ error: 'Year parameter is required' }, { status: 400 });
		}

		// Build clean params object
		const params: TeamStatsSearchParams = {
			year,
			...(team && { team }),
			...(conference && { conference }),
			...(startWeek && { startWeek }),
			...(endWeek && { endWeek })
		};

		console.log('🏈 API Route: Fetching team stats with params:', params);
		const data = await cfbdApi.getTeamStats(params);

		return json({
			data,
			requestCount: cfbdApi.getRequestCount()
		});
	} catch (error) {
		console.error('❌ Team stats API route error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
