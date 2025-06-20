// src/routes/player-stats/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// The client handles all data fetching using the API route
	return {
		searchParams: Object.fromEntries(url.searchParams.entries())
	};
};