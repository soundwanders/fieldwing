// src/routes/api/player-search/+server.ts
import { json } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { RequestHandler } from './$types';
import type { PlayerSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchTerm = url.searchParams.get('search_term') || url.searchParams.get('q');
		const position = url.searchParams.get('position');
		const team = url.searchParams.get('team');
		const yearParam = url.searchParams.get('year');

		console.log('🔍 Player search API called with params:', {
			searchTerm,
			position,
			team,
			year: yearParam
		});

		// Validate required parameters
		if (!searchTerm || searchTerm.trim().length < 2) {
			return json(
				{
					success: false,
					error: 'Search term is required and must be at least 2 characters',
					data: []
				},
				{ status: 400 }
			);
		}

		// Clean up parameters for CFBD API
		const searchParams: PlayerSearchParams = {
			search_term: searchTerm.trim()
		};

		// Add optional parameters
		if (position && position.trim()) {
			searchParams.position = position.trim();
		}

		if (team && team.trim()) {
			searchParams.team = team.trim();
		}

		if (yearParam && yearParam.trim()) {
			const year = parseInt(yearParam.trim());
			const currentYear = new Date().getFullYear();
			if (!isNaN(year) && year >= 1900 && year <= currentYear + 1) {
				searchParams.year = year;
			}
		}

		console.log('📡 Calling CFBD API with search params:', searchParams);

		// Call CFBD API using our client
		const players = await cfbdApi.searchPlayers(searchParams);

		console.log(`✅ CFBD API returned ${players.length} players`);

		return json({
			success: true,
			data: players,
			total: players.length
		});

	} catch (error) {
		console.error('❌ Player search API error:', error);
		
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		
		return json(
			{
				success: false,
				error: `Failed to search players: ${errorMessage}`,
				data: []
			},
			{ status: 500 }
		);
	}
};