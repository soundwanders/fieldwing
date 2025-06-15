// src/lib/utils/matchupExport.ts
import type { MatchupGame, Game } from '$lib/types/api';

/**
 * Convert MatchupGame objects to a format compatible with the standard Game export
 */
export function convertMatchupGamesToExportFormat(matchupGames: MatchupGame[]): Game[] {
	return matchupGames.map((game) => ({
		id: game.id || parseInt(`${game.season}${game.week || 0}${Math.random() * 1000}`),
		season: game.season,
		week: game.week || 0,
		season_type: game.seasonType || 'regular',
		start_date: game.date || game.startDate || '',
		neutral_site: game.neutralSite || false,
		conference_game: game.conferenceGame || false,
		attendance: game.attendance || undefined,
		venue_id: undefined,
		venue: game.venue || 'Unknown Venue',
		home_id: 0, // We don't have IDs in matchup data
		home_team: game.homeTeam,
		home_conference: undefined,
		home_division: undefined,
		home_points: game.homeScore || 0,
		home_line_scores: undefined,
		home_post_win_prob: undefined,
		home_pregame_elo: undefined,
		home_postgame_elo: undefined,
		away_id: 0, // We don't have IDs in matchup data
		away_team: game.awayTeam,
		away_conference: undefined,
		away_division: undefined,
		away_points: game.awayScore || 0,
		away_line_scores: undefined,
		away_post_win_prob: undefined,
		away_pregame_elo: undefined,
		away_postgame_elo: undefined,
		excitement_index: undefined,
		highlights: game.highlights || undefined,
		notes: game.notes || undefined,
		completed: true // Matchup games are historical, so they're completed
	}));
}

/**
 * Generate a descriptive filename for matchup exports
 */
export function generateMatchupExportFilename(
<<<<<<< HEAD
	team1: string, 
	team2: string, 
	minYear?: string, 
=======
	team1: string,
	team2: string,
	minYear?: string,
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	maxYear?: string
): string {
	const t1 = team1?.replace(/\s+/g, '-').toLowerCase() || 'team1';
	const t2 = team2?.replace(/\s+/g, '-').toLowerCase() || 'team2';
<<<<<<< HEAD
	
	let filename = `${t1}-vs-${t2}-head-to-head`;
	
=======

	let filename = `${t1}-vs-${t2}-head-to-head`;

>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	if (minYear && maxYear && minYear !== maxYear) {
		filename += `-${minYear}-${maxYear}`;
	} else if (minYear || maxYear) {
		filename += `-${minYear || maxYear}`;
	} else {
		filename += '-all-time';
	}
<<<<<<< HEAD
	
=======

>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	return filename;
}

/**
 * Get summary statistics for matchup games
 */
export function getMatchupSummary(games: MatchupGame[], team1: string, team2: string) {
<<<<<<< HEAD
	const team1Wins = games.filter(game => game.winner === team1).length;
	const team2Wins = games.filter(game => game.winner === team2).length;
	const ties = games.filter(game => game.winner === 'Tie').length;
	
	const years = games.map(game => game.season);
	const startYear = years.length > 0 ? Math.min(...years) : 0;
	const endYear = years.length > 0 ? Math.max(...years) : 0;
	
=======
	const team1Wins = games.filter((game) => game.winner === team1).length;
	const team2Wins = games.filter((game) => game.winner === team2).length;
	const ties = games.filter((game) => game.winner === 'Tie').length;

	const years = games.map((game) => game.season);
	const startYear = years.length > 0 ? Math.min(...years) : 0;
	const endYear = years.length > 0 ? Math.max(...years) : 0;

>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
	return {
		totalGames: games.length,
		team1Wins,
		team2Wins,
		ties,
		startYear,
		endYear,
		seriesRecord: `${team1Wins}-${team2Wins}${ties > 0 ? `-${ties}` : ''}`
	};
<<<<<<< HEAD
}
=======
}
>>>>>>> dd21d6302e1808b766e17463f32c855f7b78910a
