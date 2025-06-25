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

		// If a specific year is provided, only search that year
		if (year && year.trim()) {
			const yearNum = parseInt(year.trim());
			if (!isNaN(yearNum)) {
				console.log(`🎯 Searching specific year: ${yearNum}`);
				
				const searchParams: PlayerSearchParams = {
					searchTerm: cleanSearchTerm,
					year: yearNum
				};

				// Add optional filters
				if (team && team.trim()) {
					searchParams.team = team.trim();
				}
				if (position && position.trim()) {
					searchParams.position = position.trim();
				}

				const results = await cfbdApi.searchPlayers(searchParams);
				console.log(`✅ Found ${results.length} players for "${cleanSearchTerm}" in ${yearNum}`);

				return json({
					success: true,
					data: results,
					searchInfo: {
						searchTerm: cleanSearchTerm,
						year: yearNum,
						totalResults: results.length
					}
				});
			}
		}

		// No year specified - search across multiple years for comprehensive results
		console.log('🔍 No year specified, searching across multiple years...');
		
		// First try current/recent years (more likely to have data)
		const currentYear = new Date().getFullYear();
		const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
		
		let allResults: any[] = [];
		
		// Search recent years first
		for (const searchYear of recentYears) {
			try {
				const searchParams: PlayerSearchParams = {
					searchTerm: cleanSearchTerm,
					year: searchYear
				};
				
				if (team && team.trim()) {
					searchParams.team = team.trim();
				}
				if (position && position.trim()) {
					searchParams.position = position.trim();
				}
				
				const yearResults = await cfbdApi.searchPlayers(searchParams);
				console.log(`📅 Found ${yearResults.length} players for "${cleanSearchTerm}" in ${searchYear}`);
				allResults.push(...yearResults);
			} catch (error) {
				console.log(`⚠️ Error searching year ${searchYear}:`, error);
			}
		}

		// If we found enough recent players, return those
		if (allResults.length >= 5) {
			// Remove duplicates and return
			const uniqueResults = allResults.filter((player, index, arr) => {
				return index === arr.findIndex(p => 
					p.name === player.name && 
					p.team === player.team && 
					p.position === player.position
				);
			});

			console.log(`✅ Found sufficient recent results: ${uniqueResults.length} players`);
			return json({
				success: true,
				data: uniqueResults.slice(0, 20), // Limit to 20 results
				searchInfo: {
					searchTerm: cleanSearchTerm,
					yearsSearched: recentYears,
					totalResults: uniqueResults.length,
					searchType: 'recent_years'
				}
			});
		}

		// Not enough recent results - search historical years (2000-present)
		console.log('🕰️ Searching historical years for more comprehensive results...');
		
		const historicalYears = [];
		for (let y = currentYear - 4; y >= 2000; y--) {
			historicalYears.push(y);
		}
		
		// Search historical years in batches to avoid timeout
		const batchSize = 10;
		const historicalBatches = [];
		for (let i = 0; i < historicalYears.length; i += batchSize) {
			historicalBatches.push(historicalYears.slice(i, i + batchSize));
		}

		// Search first 2 batches (20 years) for historical players
		for (let batchIndex = 0; batchIndex < Math.min(2, historicalBatches.length); batchIndex++) {
			const batch = historicalBatches[batchIndex];
			
			const batchPromises = batch.map(async (searchYear) => {
				try {
					const searchParams: PlayerSearchParams = {
						searchTerm: cleanSearchTerm,
						year: searchYear
					};
					
					if (team && team.trim()) {
						searchParams.team = team.trim();
					}
					if (position && position.trim()) {
						searchParams.position = position.trim();
					}
					
					const yearResults = await cfbdApi.searchPlayers(searchParams);
					console.log(`📅 Found ${yearResults.length} players for "${cleanSearchTerm}" in ${searchYear}`);
					return yearResults;
				} catch (error) {
					console.log(`⚠️ Error searching year ${searchYear}:`, error);
					return [];
				}
			});

			try {
				const batchResults = await Promise.all(batchPromises);
				allResults.push(...batchResults.flat());
				
				// If we found enough results, stop searching
				if (allResults.length >= 15) {
					console.log(`✅ Found sufficient results after batch ${batchIndex + 1}`);
					break;
				}
			} catch (error) {
				console.error(`❌ Error in batch ${batchIndex + 1}:`, error);
			}
		}

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
			data: uniqueResults.slice(0, 20), // Limit to 20 results
			searchInfo: {
				searchTerm: cleanSearchTerm,
				totalYearsSearched: recentYears.length + Math.min(20, historicalYears.length),
				totalUnique: uniqueResults.length,
				searchType: 'comprehensive'
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