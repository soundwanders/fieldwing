// src/routes/stats/+page.server.ts

import type { PageServerLoad } from './$types';
import { CFBD_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const year = url.searchParams.get('year') || '';

	try {
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
		let apiUrl = `/stats/player/season?year=${encodeURIComponent(year)}`;

		// Filter out optional parameters that are not provided
		const queryParams = optionalParamsList
			.map((param) => {
				const value = url.searchParams.get(param);
				return value ? `${param}=${encodeURIComponent(value)}` : null;
			})
			.filter((param) => param !== null)
			.join('&');

		// Append the constructed query parameters to the URL
		if (queryParams) {
			apiUrl += `&${queryParams}`;
		}

		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${CFBD_API_KEY}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch matchup data. Status: ${response.status}`);
		}

		const playerStatsData = await response.json();

		return {
			playerStatsData
		};
	} catch (error) {
		console.error(error);
		return {
			error: 'Internal Server Error'
		};
	}
};
