// +page.server.ts
import type { PageServerLoad } from './$types';
import CFBD_API_KEY from '$env/static/private';
import { selectedTeams } from '$lib/stores/store';

export const load: PageServerLoad = async () => {
  try {
    // Get the selected teams value
    const selectedTeamsValue = selectedTeams.subscribe(value => value);

    // Ensure that selectedTeamsValue is an array
    const teamArray = Array.isArray(selectedTeamsValue) ? selectedTeamsValue : [];

    const currentYear = new Date().getFullYear();
    const collegeFootballStartDate = new Date(currentYear, 7, 30);
    const currentDate = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.ceil((currentDate.getTime() - collegeFootballStartDate.getTime()) / millisecondsPerWeek);

    // Make multiple API calls concurrently
    const fetchGameResultsPromises = teamArray.map(async (team: string) => {
      const url = `https://api.collegefootballdata.com/games?year=${currentYear}&week=${currentWeek}&team=${team}`;
      
      console.log('URL', url);
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${CFBD_API_KEY}`,
        },
      });

      if (!res.ok) {
        return { team, error: `Failed to fetch game results` };
      }

      const data = await res.json();

      console.log('team', team);
      console.log('data', data);

      return { team, data };
    });

    // Wait for all API calls to complete
    const results = await Promise.all(fetchGameResultsPromises);

    return {
      gameResults: results,
    };
  } catch (error) {
    console.error(error);
    return {
      error: 'Internal Server Error',
    };
  }
};
