// src/routes/player-stats/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  // pass URL search params to the client, Smart Data Provider handles the rest
  return {
    searchParams: Object.fromEntries(url.searchParams.entries())
  };
};