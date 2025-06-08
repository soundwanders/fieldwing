// src/routes/api/teams/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const division = url.searchParams.get('division') || 'fbs';
    
    console.log('🏈 API Route: Fetching teams for division:', division);
    // Note: You'll need to add a getTeams method to your cfbdApi client
    // For now, this is a placeholder - you can implement based on your needs
    
    return json({
      data: [],
      message: 'Teams endpoint not yet implemented'
    });
  } catch (error) {
    console.error('❌ Teams API route error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
};
