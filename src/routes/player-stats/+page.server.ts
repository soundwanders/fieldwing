// src/routes/player-stats/+page.server.ts

import type { PageServerLoad } from './$types';
import { cfbdApi } from '$lib/api/cfbdClient';
import { error } from '@sveltejs/kit';

interface PlayerStatsResult {
  playerStatsData: any[];
  total: number;
}

interface LoadResult {
  playerData: PlayerStatsResult;
  searchParams: {
    year: string;
    team?: string;
    conference?: string;
    startWeek?: string;
    endWeek?: string;
    category?: string;
    seasonType?: string;
  };
  requestCount?: number;
}

export const load: PageServerLoad = async ({ url }): Promise<LoadResult> => {
  try {
    // Extract and validate parameters
    const year = url.searchParams.get('year');
    const team = url.searchParams.get('team') || '';
    const conference = url.searchParams.get('conference') || '';
    const startWeek = url.searchParams.get('startWeek') || '';
    const endWeek = url.searchParams.get('endWeek') || '';
    const category = url.searchParams.get('category') || '';
    const seasonType = url.searchParams.get('seasonType') || '';

    console.log('🏈 Loading player stats with params:', {
      year, team, conference, startWeek, endWeek, category, seasonType
    });

    // Validate required parameters
    if (!year) {
      throw error(400, 'Year parameter is required for player statistics.');
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      throw error(400, `Invalid year: ${year}. Year must be between 1900 and ${new Date().getFullYear() + 1}.`);
    }

    // Validate week parameters if provided
    if (startWeek) {
      const startWeekNum = parseInt(startWeek);
      if (isNaN(startWeekNum) || startWeekNum < 1 || startWeekNum > 14) {
        throw error(400, 'Start week must be between 1 and 14.');
      }
    }

    if (endWeek) {
      const endWeekNum = parseInt(endWeek);
      if (isNaN(endWeekNum) || endWeekNum < 1 || endWeekNum > 14) {
        throw error(400, 'End week must be between 1 and 14.');
      }
    }

    // Validate week range
    if (startWeek && endWeek) {
      const startWeekNum = parseInt(startWeek);
      const endWeekNum = parseInt(endWeek);
      if (startWeekNum > endWeekNum) {
        throw error(400, 'Start week cannot be greater than end week.');
      }
    }

    console.log('📡 Fetching player statistics...');

    const playerStatsData = await cfbdApi.getPlayerStats({
      year,
      team: team || undefined,
      conference: conference || undefined,
      startWeek: startWeek || undefined,
      endWeek: endWeek || undefined,
      category: category || undefined,
      seasonType: seasonType || undefined
    }) as any[];

    console.log(`✅ Successfully fetched ${playerStatsData.length} player stat records`);
    console.log(`🔢 Total API requests made: ${cfbdApi.getRequestCount()}`);

    const result: LoadResult = {
      playerData: {
        playerStatsData: playerStatsData || [],
        total: playerStatsData?.length || 0
      },
      searchParams: {
        year,
        team: team || undefined,
        conference: conference || undefined,
        startWeek: startWeek || undefined,
        endWeek: endWeek || undefined,
        category: category || undefined,
        seasonType: seasonType || undefined
      },
      requestCount: cfbdApi.getRequestCount()
    };

    console.log('✅ Player stats page load completed successfully');
    return result;

  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    
    console.error('💥 Unexpected error in player stats page load:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    throw error(500, `Failed to load player statistics: ${errorMessage}`);
  }
};