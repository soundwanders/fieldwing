// +page.server.ts
import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';
import { getCurrentWeek } from '$lib/utils/getCurrentWeek';

export const load: PageServerLoad = async ({ params, url }) => {
  try {
    // Access the teams parameter from the query string
    const teams = url.searchParams.get('teams');
    const week = url.searchParams.get('week');

    // Ensure that teams is a string
    const teamsString = teams || '';

    // Split the teams string into an array
    const teamArray = teamsString.split(',');
    
      // Extract the school name from the full team name to properly structure the API call
      // For example, "Akron Zips" needs to be transformed into "Akron"
    const schoolNamesArray = teamArray.map((fullTeamName: string) => {
      return fullTeamName.split(' ')[0];
    });

    // Create a variable to store the current year
    const currentYear = new Date().getFullYear();

    // Use the selected week or default to the current week
    const selectedWeek = week || getCurrentWeek();

    // Make multiple API calls concurrently
    const fetchGameResultsPromises = schoolNamesArray.map(async (team: string) => {
      const url = `https://api.collegefootballdata.com/games?year=${currentYear}&week=${selectedWeek}&team=${team}`;

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

      return { team, data };
    });

    // Wait for all API calls to complete
    const results = await Promise.all(fetchGameResultsPromises);

    return {
      gameResults: results,
    }
  } catch (error) {
    console.error(error);
    return {
      error: 'Internal Server Error',
    }
  }
};
