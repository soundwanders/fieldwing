// routes/matchup/+page.server.ts

import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';
import { getSchoolName } from '$lib/utils/getSchoolName';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const team1 = getSchoolName(url.searchParams.get('team1') || '');
		const team2 = getSchoolName(url.searchParams.get('team2') || '');
		const minYear = url.searchParams.get('minYear') || '';
		const maxYear = url.searchParams.get('maxYear') || '';

		// Construct the URL based on user input
		let apiUrl = `https://api.collegefootballdata.com/teams/matchup?team1=${encodeURIComponent(
			team1
		)}&team2=${encodeURIComponent(team2)}`;

		// Append min and max years if they are provided
		if (minYear) {
			apiUrl += `&minYear=${minYear}`;
		}

		if (maxYear) {
			apiUrl += `&maxYear=${maxYear}`;
		}

		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${CFBD_API_KEY}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch matchup data. Status: ${response.status}`);
		}

		const matchupData = await response.json();

		return {
			matchupData
		};
	} catch (error) {
		console.error(error);
		return {
			error: 'Internal Server Error'
		};
	}
};
