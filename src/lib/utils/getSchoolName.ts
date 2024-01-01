import { mascotNames } from '$lib/utils/mascots';

// Function to extract the school name from the full team name
export function getSchoolName(fullTeamName: string): string {
  // Split the full team name into parts
  const parts = fullTeamName.split(' ');

  // Iterate over the parts to filter out mascots from the team name
  const filteredParts: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const remainingSubstring = parts.slice(i).join(' ');

    if (!mascotNames.includes(remainingSubstring)) {
      filteredParts.push(parts[i]);
    }
  }

  return filteredParts.join(' ');
}