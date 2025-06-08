// src/routes/api/player-stats/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { PlayerStatsSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }: import('@sveltejs/kit').RequestEvent) => {
  try {
    const searchParams = url.searchParams;
    
    // Helper function to safely parse season type
    const parseSeasonType = (value: string | null): "regular" | "postseason" | "both" | undefined => {
      if (!value) return undefined;
      if (value === 'regular' || value === 'postseason' || value === 'both') {
        return value;
      }
      return undefined;
    };

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
    const category = searchParams.get('category') as import('$lib/types/api').PlayerStatCategory | undefined;
    const seasonType = parseSeasonType(searchParams.get('seasonType'));

    // Validate required parameters
    if (!year) {
      return json({ error: 'Year parameter is required' }, { status: 400 });
    }

    // Build clean params object
    const params: PlayerStatsSearchParams = {
      year,
      ...(team && { team }),
      ...(conference && { conference }),
      ...(startWeek && { startWeek }),
      ...(endWeek && { endWeek }),
      ...(category && { category }),
      ...(seasonType && { seasonType }),
    };

    console.log('🏈 API Route: Fetching player stats with params:', params);
    const data = await cfbdApi.getPlayerStats(params);
    
    return json({
      data,
      requestCount: cfbdApi.getRequestCount()
    });
  } catch (error) {
    console.error('❌ Player stats API route error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
};
