// src/routes/results/+page.server.ts
import type { PageServerLoad } from './$types';
import CFBD_API_KEY from '$env/static/private';

export const load: PageServerLoad = async (context: { status?: any; params?: any; }) => {
  const { params } = context;
  const { teams } = params;

  try {
    // Build the date/time structure in our desired custom format
    // Modifies the API call url to only include the most recent week of games
    
    // Calculate current year, use full year to match CFBD API data structure
    const currentYear = new Date().getFullYear();

    // Calculate the (estimated) start date for the college football season
    const collegeFootballStartDate = new Date(currentYear, 7, 30); // August is month 7 (0-based index).

    // Calculate the current week for college football
    const currentDate = new Date();
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.ceil((currentDate.getTime() - collegeFootballStartDate.getTime()) / millisecondsPerWeek);

    const url = `https://api.collegefootballdata.com/games?year=${currentYear}&week=${currentWeek}&team=${team}`;

    const response = await fetch(url, {
      headers: {
        // Writing 'Bearer' before the API key is required for successful authorization
        'Authorization': `Bearer ${CFBD_API_KEY}`,
      },
    });

    if (!response.ok) {
      context.status = response.status;
      return { error: `Failed to fetch game results for ${teams}` };
    }

    const data = await response.json();

    return { teams, games: data };
  } catch (error) {
    context.status = 500;
    return { error: 'Internal Server Error' };
  }
};
