// +page.server.ts
import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';
import { getCurrentWeek } from '$lib/utils/getCurrentWeek';
import { mascotNames } from '$lib/utils/mascots';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		// Access the teams parameter from the query string
		const teams = url.searchParams.get('teams');
		const week = url.searchParams.get('week');

		// Ensure that teams is a string
		const teamsString = teams || '';

		// Split the teams string into an array
		const teamArray = teamsString.split(',');

		// Create a variable to store the current year, will be used in the fetch url
		const currentYear = new Date().getFullYear();

		// Use the selected week or default to the current week
		const selectedWeek = week || getCurrentWeek();

		// Make multiple API calls concurrently using Promise.all
		const fetchGameResultsPromises = teamArray.map(async (fullTeamName: string) => {
			const schoolName = getSchoolName(fullTeamName);
			const url = `https://api.collegefootballdata.com/games?year=${currentYear}&week=${selectedWeek}&team=${encodeURIComponent(
				schoolName
			)}`;

			try {
				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${CFBD_API_KEY}`
					}
				});

				if (!res.ok) {
					throw new Error(`Failed to fetch game results for ${schoolName}. Status: ${res.status}`);
				}

				const data = await res.json();

				return { team: schoolName, data };
			} catch (error) {
				console.error(error);
				return { team: schoolName, error: `Failed to fetch game results for ${schoolName}` };
			}
		});

		// Wait for all API calls to complete
		const results = await Promise.all(fetchGameResultsPromises);

		return {
			gameResults: results
		};
	} catch (error) {
		console.error(error);
		return {
			error: 'Internal Server Error'
		};
	}
};

// Function to extract the school mascots/team names from the full team name
function getSchoolName(fullTeamName: string): string {
	// Split the full team name into parts
	const parts = fullTeamName.split(' ');

	// Iterate over the parts to filter out mascots from the team name
	let filteredParts: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		const remainingSubstring = parts.slice(i).join(' ');

		console.log(`Iteration ${i}: parts: ${parts}, remainingSubstring: ${remainingSubstring}`);

		if (!mascotNames.includes(remainingSubstring)) {
			filteredParts.push(parts[i]);
		}
	}

	return filteredParts.join(' ');
}
