// src/routes/api/player-stats/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { PlayerStatsSearchParams, PlayerStatCategory } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    
    console.log('🏈 Player Stats API Route called with params:', Object.fromEntries(searchParams.entries()));
    
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

    // Helper function to validate category
    const parseCategory = (value: string | null): PlayerStatCategory | undefined => {
      if (!value) return undefined;
      const validCategories: PlayerStatCategory[] = [
        'passing', 'rushing', 'receiving', 'fumbles', 'defense', 
        'kicking', 'punting', 'kickReturns', 'puntReturns', 'interceptions'
      ];
      return validCategories.includes(value as PlayerStatCategory) ? value as PlayerStatCategory : undefined;
    };

    // Build params with proper type conversion
    const year = parseYear(searchParams.get('year'));
    const team = searchParams.get('team') || undefined;
    const conference = searchParams.get('conference') || undefined;
    const startWeek = parseInteger(searchParams.get('startWeek'));
    const endWeek = parseInteger(searchParams.get('endWeek'));
    const category = parseCategory(searchParams.get('category'));
    const seasonType = parseSeasonType(searchParams.get('seasonType'));

    // Validate required parameters
    if (!year) {
      console.error('❌ Missing required year parameter');
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

    console.log('🔍 Fetching player stats with validated params:', params);
    
    // Call the API
    const data = await cfbdApi.getPlayerStats(params);
    
    console.log(`✅ Player stats API returned ${data?.length || 0} records`);
    
    // Ensure we always return an array
    const responseData = Array.isArray(data) ? data : [];
    
    return json({
      data: responseData,
      total: responseData.length,
      requestCount: cfbdApi.getRequestCount(),
      params: params // Include params for debugging
    });
    
  } catch (error) {
    console.error('❌ Player stats API route error:', error);
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('400') ? 400 : 
                      errorMessage.includes('404') ? 404 : 500;
    
    return json(
      { 
        error: errorMessage,
        code: 'PLAYER_STATS_ERROR',
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};