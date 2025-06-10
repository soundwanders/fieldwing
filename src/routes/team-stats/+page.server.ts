// src/routes/team-stats/+page.server.ts
import type { PageServerLoad } from './$types';
import { cfbdApi } from '$lib/api/cfbdClient';
import { error } from '@sveltejs/kit';

interface TeamStatsResult {
  teamStatsData: any[];
  total: number;
}

interface LoadResult {
  teamData: TeamStatsResult;
  searchParams: {
    year: string;
    team?: string;
    conference?: string;
    startWeek?: string;
    endWeek?: string;
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

    console.log('🏈 Loading team stats with params:', {
      year, team, conference, startWeek, endWeek
    });

    // If no year is provided, return empty data (this allows the page to load)
    if (!year) {
      console.log('📝 No year parameter provided, returning empty data');
      return {
        teamData: {
          teamStatsData: [],
          total: 0
        },
        searchParams: {
          year: '',
          team: team || undefined,
          conference: conference || undefined,
          startWeek: startWeek || undefined,
          endWeek: endWeek || undefined
        },
        requestCount: cfbdApi.getRequestCount()
      };
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

    console.log('📡 Fetching team statistics...');

    const teamStatsData = await cfbdApi.getTeamStats({
      year,
      team: team || undefined,
      conference: conference || undefined,
      startWeek: startWeek || undefined,
      endWeek: endWeek || undefined
    }) as any[];

    console.log(`✅ Successfully fetched ${teamStatsData.length} team stat records`);
    console.log(`🔢 Total API requests made: ${cfbdApi.getRequestCount()}`);

    const result: LoadResult = {
      teamData: {
        teamStatsData: teamStatsData || [],
        total: teamStatsData?.length || 0
      },
      searchParams: {
        year,
        team: team || undefined,
        conference: conference || undefined,
        startWeek: startWeek || undefined,
        endWeek: endWeek || undefined
      },
      requestCount: cfbdApi.getRequestCount()
    };

    console.log('✅ Team stats page load completed successfully');
    return result;

  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    
    console.error('💥 Unexpected error in team stats page load:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    throw error(500, `Failed to load team statistics: ${errorMessage}`);
  }
};