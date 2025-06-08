// src/routes/api/games/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { GameSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
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

    // Helper function to safely parse integer
    const parseInteger = (value: string | null): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    // Build params with proper type conversion
    const year = parseInteger(searchParams.get('year'));
    const week = parseInteger(searchParams.get('week'));
    const team = searchParams.get('team') || undefined;
    const conference = searchParams.get('conference') || undefined;
    const division = searchParams.get('division') || undefined;
    const seasonType = parseSeasonType(searchParams.get('seasonType'));

    // Build clean params object
    const params: GameSearchParams = {
      ...(year && { year }),
      ...(week && { week }),
      ...(team && { team }),
      ...(conference && { conference }),
      ...(division && { division }),
      ...(seasonType && { seasonType }),
    };

    console.log('🏈 API Route: Fetching games with params:', params);
    const data = await cfbdApi.getGames(params);
    
    return json({
      data,
      requestCount: cfbdApi.getRequestCount()
    });
  } catch (error) {
    console.error('❌ Games API route error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
};