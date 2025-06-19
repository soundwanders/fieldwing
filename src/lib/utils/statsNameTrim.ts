// src/lib/utils/statsNameTrim.ts

import { TEAM_NAME_MAPPINGS, normalizeTeamName, getTeamVariations } from '$lib/utils/teamMapping';

/**
 * Converts user input to the school name format expected by CFBD API
 * mapping common variations and nicknames to official school names.
 * @param input - The user input string (team name, nickname, etc.)
 * @returns The standardized school name or an empty string if no match found.
 */
export function statsNameTrim(input: string): string {
	if (!input || typeof input !== 'string') {
		return '';
	}

	// Clean and normalize the input
	const cleanInput = input
		.toLowerCase()
		.trim()
		.replace(/[^\w\s&]/g, '') // Remove special characters except & and spaces
		.replace(/\s+/g, ' ') // Normalize multiple spaces
		.trim();

	// Return early if empty after cleaning
	if (!cleanInput) {
		return input;
	}

	// Use the normalizeTeamName function from teamMapping
	const normalizedResult = normalizeTeamName(cleanInput);

	// If we found a match in the comprehensive mappings
	if (normalizedResult !== cleanInput) {
		console.log(`🔧 statsNameTrim: "${input}" → "${normalizedResult}"`);
		return normalizedResult;
	}

	// Direct mapping lookup (redundant but kept for backwards compatibility)
	if (TEAM_NAME_MAPPINGS[cleanInput]) {
		console.log(`🔧 statsNameTrim: "${input}" → "${TEAM_NAME_MAPPINGS[cleanInput]}"`);
		return TEAM_NAME_MAPPINGS[cleanInput];
	}

	// Partial matching for common patterns
	for (const [key, value] of Object.entries(TEAM_NAME_MAPPINGS)) {
		// Check if the clean input contains or matches key patterns
		if (cleanInput.includes(key) || key.includes(cleanInput)) {
			console.log(`🔧 statsNameTrim (partial): "${input}" → "${value}"`);
			return value;
		}
	}

	// Fallback: if it looks like a school name (contains common school words), keep it
	const schoolIndicators = ['university', 'college', 'state', 'tech', 'institute', 'a&m', 'am'];

	const hasSchoolIndicator = schoolIndicators.some((indicator) => cleanInput.includes(indicator));

	if (hasSchoolIndicator) {
		// Return a cleaned version of the original input
		const cleaned = input
			.replace(/\b(university|college|of|the)\b/gi, '')
			.replace(/\s+/g, ' ')
			.trim();

		console.log(`🔧 statsNameTrim (school): "${input}" → "${cleaned}"`);
		return cleaned;
	}

	// If no mapping found and doesn't look like a school name, return original
	console.log(`🔧 statsNameTrim (no change): "${input}" → "${input}"`);
	return input;
}

/**
 * Helper function to add new team mappings at runtime
 * Useful for testing or adding support for new teams
 * Note: This modifies the in-memory copy only, not the source file
 */
export function addTeamMapping(variations: string[], officialName: string): void {
	variations.forEach((variation) => {
		const key = variation.toLowerCase().trim();
		// This would need to be handled differently since TEAM_NAME_MAPPINGS is now imported
		// For now, we'll log a warning
		console.warn(`⚠️ Runtime team mapping additions are not supported with the new team mapping system. 
		Please add new mappings to lib/utils/teamMapping.ts instead.`);
	});
	console.log(`ℹ️ To add team mappings for ${officialName}, please update the teamMapping.ts file`);
}

/**
 * Get all available team mappings for debugging
 */
export function getTeamMappings(): Record<string, string> {
	return { ...TEAM_NAME_MAPPINGS };
}

/**
 * Search for possible team matches (fuzzy search)
 * Useful for suggesting corrections to users
 */
export function findSimilarTeams(input: string, limit: number = 5): string[] {
	if (!input || typeof input !== 'string') {
		return [];
	}

	const cleanInput = input.toLowerCase().trim();
	const matches: Array<{ team: string; score: number }> = [];

	// Get unique team names
	const uniqueTeams = Array.from(new Set(Object.values(TEAM_NAME_MAPPINGS)));

	uniqueTeams.forEach((team) => {
		const teamLower = team.toLowerCase();
		let score = 0;

		// Exact match
		if (teamLower === cleanInput) {
			score = 100;
		}
		// Contains input
		else if (teamLower.includes(cleanInput)) {
			score = 80;
		}
		// Input contains team name
		else if (cleanInput.includes(teamLower)) {
			score = 70;
		}
		// Check against all variations using the new getTeamVariations function
		else {
			const variations = getTeamVariations(team);
			for (const variation of variations) {
				if (variation.includes(cleanInput)) {
					score = Math.max(score, 60);
					break;
				}
			}
		}

		if (score > 0) {
			matches.push({ team, score });
		}
	});

	return matches
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((match) => match.team);
}

/**
 * Enhanced function to check if a string is likely a team name
 * Uses the comprehensive team mapping to improve accuracy
 */
export function isLikelyTeamName(input: string): boolean {
	if (!input || typeof input !== 'string') {
		return false;
	}

	const cleanInput = input.toLowerCase().trim();

	// Check if it's in our mappings
	if (TEAM_NAME_MAPPINGS[cleanInput]) {
		return true;
	}

	// Check partial matches
	for (const key of Object.keys(TEAM_NAME_MAPPINGS)) {
		if (cleanInput.includes(key) || key.includes(cleanInput)) {
			return true;
		}
	}

	// Check if it contains common team/school indicators
	const indicators = [
		'university',
		'college',
		'state',
		'tech',
		'institute',
		'a&m',
		'am',
		'school',
		'academy'
	];

	return indicators.some((indicator) => cleanInput.includes(indicator));
}

/**
 * Get all official team names (no duplicates)
 * Useful for populating dropdowns or autocomplete
 */
export function getAllOfficialTeamNames(): string[] {
	return Array.from(new Set(Object.values(TEAM_NAME_MAPPINGS))).sort();
}

/**
 * Get all variations for a specific team
 * Wrapper around the imported getTeamVariations for consistency
 */
export function getTeamNicknames(officialName: string): string[] {
	return getTeamVariations(officialName);
}
