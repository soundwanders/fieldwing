// src/routes/team-stats/+page.server.ts

import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, url }) => {
	const year = url.searchParams.get('year') || '';

	try {
		// Define the list of optional parameters
		const optionalParamsList = ['team', 'conference', 'startWeek', 'endWeek', 'category'];

		// Construct the URL based on user input
		let apiUrl = `https://api.collegefootballdata.com/stats/season?year=${encodeURIComponent(
			year
		)}`;

		// Filter out optional parameters that are not provided
		// Explicitly check for null, undefined, and empty string values before including them in query params
		const queryParams = optionalParamsList
			.filter((param) => {
				const value = url.searchParams.get(param);
				return value !== null && value !== undefined && value !== '';
			})
			.map((param) => {
				const value = url.searchParams.get(param);
				return `${param}=${encodeURIComponent(value || '')}`;
			})
			.join('&');

		// Append the constructed query parameters to the URL
		if (queryParams) {
			apiUrl += `&${queryParams}`;
		}

		console.log('apiurl', apiUrl);

		async function getTeams(limit: number = 15, skip: number = 0) {
			const response = await fetch(`${apiUrl}`, {
				headers: {
					Authorization: `Bearer ${CFBD_API_KEY}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch player data. Status: ${response.status}`);
			}

			const teamStatsData = await response.json();
			const totalItems = teamStatsData.length;

			return {
				total: totalItems,
				teamStatsData
			};
		}

		return {
			teamData: await getTeams()
		};
	} catch (error) {
		console.error(error);
		return {
			error: 'Internal Server Error'
		};
	}
};
