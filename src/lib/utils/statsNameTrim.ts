import { mascotNames } from '$lib/utils/mascots';

// Function to extract the school name from the full team name
export function statsNameTrim(fullTeamName: string): string {
	// Convert the full team name to lowercase for case-insensitive matching
	const lowerCaseName = fullTeamName.toLowerCase();

	// Iterate over mascot names and filter them out
	for (const mascot of mascotNames) {
		const lowerCaseMascot = mascot.toLowerCase();

		// Check if the lowercased team name includes the lowercased mascot name
		if (lowerCaseName.includes(lowerCaseMascot)) {
			// Remove the mascot name from the team name
			const schoolName = fullTeamName.replace(new RegExp(mascot, 'i'), '').trim();

			return schoolName;
		}
	}

	// If no mascot found, return the original team name
	return fullTeamName.trim();
}
