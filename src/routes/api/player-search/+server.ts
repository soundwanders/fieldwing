// src/routes/api/player-search/+server.ts
import { json } from '@sveltejs/kit';
import { cfbdApi } from '$lib/api/cfbdClient';
import type { RequestHandler } from './$types';
import type { PlayerSearchParams } from '$lib/types/api';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchTerm = url.searchParams.get('searchTerm');
		const team = url.searchParams.get('team');
		const position = url.searchParams.get('position');
		const year = url.searchParams.get('year');

		console.log('🔍 Player search API called with params:', {
			searchTerm,
			position,
			team,
			year
		});

		if (!searchTerm || searchTerm.trim().length < 2) {
			return json(
				{
					success: false,
					error: 'Search term must be at least 2 characters long',
					data: []
				},
				{ status: 400 }
			);
		}

		// Clean up the search term
		const cleanSearchTerm = searchTerm.trim();

		// Prepare search parameters for CFBD API
		const searchParams: PlayerSearchParams = {
			searchTerm: cleanSearchTerm
		};

		// Add optional filters
		if (team && team.trim()) {
			searchParams.team = team.trim();
		}

		if (position && position.trim()) {
			searchParams.position = position.trim();
		}

		if (year && year.trim()) {
			const yearNum = parseInt(year.trim());
			if (!isNaN(yearNum)) {
				searchParams.year = yearNum;
			}
		}

		console.log('📡 Calling CFBD API with search params:', searchParams);

		// Call CFBD API for player search
		const standardResults = await cfbdApi.searchPlayers(searchParams);
		console.log(`✅ Standard search returned ${standardResults.length} players`);

		// For common names like "Ricky Williams", search across multiple years to catch historical players
		let additionalResults: any[] = [];
		const isCommonName = cleanSearchTerm.split(' ').length >= 2; // First and last name

		if (isCommonName && !year && standardResults.length < 10) {
			console.log('🔍 Searching additional years for historical players...');
			
			// Search key years when famous players were active
			const searchYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 
							   2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 
							   2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995];

			const searchPromises = searchYears.slice(0, 15).map(async (searchYear) => {
				try {
					const yearSearchParams: PlayerSearchParams = {
						searchTerm: cleanSearchTerm,
						year: searchYear
					};
					
					// Add other filters if they exist
					if (team && team.trim()) {
						yearSearchParams.team = team.trim();
					}
					if (position && position.trim()) {
						yearSearchParams.position = position.trim();
					}
					
					const yearResults = await cfbdApi.searchPlayers(yearSearchParams);
					console.log(`📅 Found ${yearResults.length} players for "${cleanSearchTerm}" in ${searchYear}`);
					return yearResults;
				} catch (error) {
					console.log(`⚠️ Error searching year ${searchYear}:`, error);
					return [];
				}
			});

			try {
				const allYearResults = await Promise.all(searchPromises);
				additionalResults = allYearResults.flat();
				console.log(`📊 Additional historical search found ${additionalResults.length} total results`);
			} catch (error) {
				console.error('❌ Error in multi-year search:', error);
			}
		}

		// Combine and deduplicate results
		const allResults = [...standardResults, ...additionalResults];
		
		// Remove duplicates based on player name + team + position combination
		const uniqueResults = allResults.filter((player, index, arr) => {
			return index === arr.findIndex(p => 
				p.name === player.name && 
				p.team === player.team && 
				p.position === player.position
			);
		});

		console.log(`✅ Final result: ${uniqueResults.length} unique players found`);

		// Sort results by relevance (exact matches first, then partial matches)
		uniqueResults.sort((a, b) => {
			const aExact = a.name.toLowerCase() === cleanSearchTerm.toLowerCase();
			const bExact = b.name.toLowerCase() === cleanSearchTerm.toLowerCase();
			
			if (aExact && !bExact) return -1;
			if (!aExact && bExact) return 1;
			
			// Then by how well the name matches
			const aIncludes = a.name.toLowerCase().includes(cleanSearchTerm.toLowerCase());
			const bIncludes = b.name.toLowerCase().includes(cleanSearchTerm.toLowerCase());
			
			if (aIncludes && !bIncludes) return -1;
			if (!aIncludes && bIncludes) return 1;
			
			// Finally alphabetically
			return a.name.localeCompare(b.name);
		});

		return json({
			success: true,
			data: uniqueResults,
			searchInfo: {
				searchTerm: cleanSearchTerm,
				standardResults: standardResults.length,
				historicalResults: additionalResults.length,
				totalUnique: uniqueResults.length,
				searchedYears: isCommonName && !year ? 15 : 1
			}
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