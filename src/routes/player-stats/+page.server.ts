// src/routes/player-stats/+page.server.ts

import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, url }) => {
	const year = url.searchParams.get('year') || '';

	try {
		const limit = Number(url.searchParams.get('itemsPerPage')) || 15; // Default to 15 items per page
		const skip = Number(url.searchParams.get('skip')) || 0;

		// Define the list of optional parameters
		const optionalParamsList = [
			'team',
			'conference',
			'startWeek',
			'endWeek',
			'seasonType',
			'category'
		];

		// Construct the URL based on user input
		let apiUrl = `https://api.collegefootballdata.com/stats/player/season?year=${encodeURIComponent(
			year
		)}&limit=${limit}&skip=${skip}`;

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

		async function getPlayers(limit: number = 15, skip: number = 0) {
			const response = await fetch(`${apiUrl}&limit=${limit}&skip=${skip}`, {
				headers: {
					Authorization: `Bearer ${CFBD_API_KEY}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch player data. Status: ${response.status}`);
			}

			const playerStatsData = await response.json();
			const totalItems = playerStatsData.length;

			return {
				total: totalItems,
				playerStatsData
			};
		}

		return {
			playerData: await getPlayers(limit, skip)
		};
	} catch (error) {
		console.error(error);
		return {
			error: 'Internal Server Error'
		};
	}
};
