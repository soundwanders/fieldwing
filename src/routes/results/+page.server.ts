// +page.server.ts
import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, url }) => {
  try {
    // Access the teams parameter from the query string
    const teams = url.searchParams.get('teams');

    // Ensure that teams is a string
    const teamsString = teams || '';

    // Split the teams string into an array
    const teamArray = teamsString.split(',');
    
      // Extract the school name from the full team name to properly structure the API call
      // For example, "Akron Zips" needs to be transformed into "Akron"
    const schoolNamesArray = teamArray.map((fullTeamName: string) => {
      return fullTeamName.split(' ')[0];
    });
    
    const currentYear = new Date().getFullYear();
    const collegeFootballStartDate = new Date(currentYear, 7, 30);
    const currentDate = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.ceil((currentDate.getTime() - collegeFootballStartDate.getTime()) / millisecondsPerWeek);

    // Make multiple API calls concurrently
    const fetchGameResultsPromises = schoolNamesArray.map(async (team: string) => {
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
