// src/lib/types/api.ts

// Base API Response Structure
export interface APIResponse<T> {
	data: T;
	success: boolean;
	error?: string;
	timestamp?: string;
}

// Game-related Types
export interface Game {
	id: number;
	season: number;
	week: number;
	season_type: string;
	start_date: string;
	neutral_site: boolean;
	conference_game: boolean;
	attendance?: number;
	venue_id?: number;
	venue: string;
	home_id: number;
	home_team: string;
	home_conference?: string;
	home_division?: string;
	home_points: number;
	home_line_scores?: number[];
	home_post_win_prob?: number;
	home_pregame_elo?: number;
	home_postgame_elo?: number;
	away_id: number;
	away_team: string;
	away_conference?: string;
	away_division?: string;
	away_points: number;
	away_line_scores?: number[];
	away_post_win_prob?: number;
	away_pregame_elo?: number;
	away_postgame_elo?: number;
	excitement_index?: number;
	highlights?: string;
	notes?: string;
	completed: boolean;
}

export interface GameSearchParams {
	year?: string | number;
	week?: string | number;
	team?: string;
	home?: string;
	away?: string;
	conference?: string;
	division?: string;
	id?: string | number;
	seasonType?: 'regular' | 'postseason' | 'both';
}

// Player Stats Types
export interface PlayerStat {
	playerId: number;
	player: string;
	team: string;
	conference: string;
	category: string;
	statType: string;
	stat: number | string;
	season: number;
	seasonType: string;
	week?: number;
	game?: number;
}

export interface PlayerStatsSearchParams {
	year: string | number;
	team?: string;
	conference?: string;
	startWeek?: string | number;
	endWeek?: string | number;
	seasonType?: 'regular' | 'postseason' | 'both';
	category?: PlayerStatCategory;
}

export type PlayerStatCategory =
	| 'passing'
	| 'rushing'
	| 'receiving'
	| 'defense'
	| 'kicking'
	| 'punting'
	| 'kickReturns'
	| 'puntReturns'
	| 'interceptions'
	| 'fumbles';

// Team Stats Types
export interface TeamStat {
	team: string;
	conference: string;
	statName: string;
	statValue: number | string;
	season: number;
	seasonType: string;
}

export interface TeamStatsSearchParams {
	year: string | number;
	team?: string;
	conference?: string;
	startWeek?: string | number;
	endWeek?: string | number;
	seasonType?: 'regular' | 'postseason' | 'both';
}

// Head-to-Head Matchup Types
export interface MatchupGame {
	season: number;
	week?: number;
	seasonType: string;
	date: string;
	neutralSite: boolean;
	venue: string;
	homeTeam: string;
	homeScore: number;
	awayTeam: string;
	awayScore: number;
	winner: string;
}

export interface TeamMatchup {
	team1: string;
	team2: string;
	startYear: number;
	endYear: number;
	team1Wins: number;
	team2Wins: number;
	ties: number;
	games: MatchupGame[];
}

export interface MatchupSearchParams {
	team1: string;
	team2: string;
	minYear?: string | number;
	maxYear?: string | number;
}

// Conference and Team Types
export interface Conference {
	id: number;
	name: string;
	short_name?: string;
	abbreviation?: string;
}

export interface Team {
	id: number;
	school: string;
	mascot: string;
	abbreviation?: string;
	alt_name1?: string;
	alt_name2?: string;
	alt_name3?: string;
	conference: string;
	division?: string;
	color?: string;
	alt_color?: string;
	logos?: string[];
}

// Error Types
export interface APIError {
	message: string;
	status: number;
	code?: string;
	details?: Record<string, any>;
}

// Pagination Types
export interface PaginationParams {
	limit?: number;
	skip?: number;
	page?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// Type Guards for Runtime Validation
export function isGame(obj: any): obj is Game {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof obj.id === 'number' &&
		typeof obj.season === 'number' &&
		typeof obj.week === 'number' &&
		typeof obj.home_team === 'string' &&
		typeof obj.away_team === 'string' &&
		typeof obj.completed === 'boolean'
	);
}

export function isPlayerStat(obj: any): obj is PlayerStat {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof obj.playerId === 'number' &&
		typeof obj.player === 'string' &&
		typeof obj.team === 'string' &&
		typeof obj.category === 'string' &&
		typeof obj.statType === 'string'
	);
}

export function isTeamStat(obj: any): obj is TeamStat {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof obj.team === 'string' &&
		typeof obj.statName === 'string' &&
		typeof obj.statValue !== 'undefined'
	);
}

export function isMatchupGame(obj: any): obj is MatchupGame {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		typeof obj.season === 'number' &&
		typeof obj.homeTeam === 'string' &&
		typeof obj.awayTeam === 'string' &&
		typeof obj.homeScore === 'number' &&
		typeof obj.awayScore === 'number'
	);
}

// API Response Validation
export function validateAPIResponse<T>(
	response: any,
	validator: (data: any) => data is T
): response is APIResponse<T> {
	return (
		typeof response === 'object' &&
		response !== null &&
		Array.isArray(response.data) &&
		response.data.every(validator)
	);
}

// Helper Types for Components
export interface ComponentError {
	message: string;
	code?: string;
	recoverable: boolean;
}

export interface LoadingState {
	isLoading: boolean;
	error: ComponentError | null;
	data: any;
}

export interface SearchState<T> {
	query: string;
	results: T[];
	isSearching: boolean;
	error: string | null;
}
