// src/lib/data/dataQueries.ts - Updated to use internal API routes properly

import { createQuery, createPaginatedQuery } from './DataProvider';
import type {
	Game,
	PlayerStat,
	TeamStat,
	TeamMatchup,
	GameSearchParams,
	PlayerStatsSearchParams,
	TeamStatsSearchParams,
	MatchupSearchParams
} from '$lib/types/api';

// Internal API client for client-side use
class InternalApiClient {
	private async fetchFromApi<T>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> {
		const cleanParams = Object.entries(params)
			.filter(([_, value]) => value !== null && value !== undefined && value !== '')
			.reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});

		const queryString = new URLSearchParams(cleanParams).toString();
		const url = `/api${endpoint}${queryString ? `?${queryString}` : ''}`;

		console.log(`🔄 Fetching from internal API: ${url}`);

		const response = await fetch(url);

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw new Error(error.error || `API request failed: ${response.status}`);
		}

		const result = await response.json();
		return result.data;
	}

	async getPlayerStats(params: PlayerStatsSearchParams): Promise<PlayerStat[]> {
		return this.fetchFromApi<PlayerStat>('/player-stats', params);
	}

	async getTeamStats(params: TeamStatsSearchParams): Promise<TeamStat[]> {
		return this.fetchFromApi<TeamStat>('/team-stats', params);
	}

	async getGames(params: GameSearchParams): Promise<Game[]> {
		return this.fetchFromApi<Game>('/games', params);
	}
}

const internalApi = new InternalApiClient();

// Player Statistics Queries
export const playerStatsQueries = {
	search: (params: PlayerStatsSearchParams & { page?: number; pageSize?: number }) =>
		createPaginatedQuery(
			`playerStats:search:${JSON.stringify(params)}`,
			() => internalApi.getPlayerStats(params),
			params.pageSize || 16
		),

	byCategory: (category: string, year: string, team?: string) =>
		createQuery(
			`playerStats:byCategory:${category}:${year}:${team || 'all'}`,
			() =>
				internalApi.getPlayerStats({
					year,
					category: category as any,
					team: team || undefined
				}),
			{
				staleTime: 5 * 60 * 1000,
				cacheTime: 10 * 60 * 1000
			}
		),

	topPerformers: (category: string, year: string, limit: number = 10) =>
		createQuery(
			`playerStats:topPerformers:${category}:${year}:${limit}`,
			async () => {
				const data = await internalApi.getPlayerStats({ year, category: category as any });
				return data.sort((a, b) => Number(b.stat) - Number(a.stat)).slice(0, limit);
			},
			{
				staleTime: 10 * 60 * 1000,
				cacheTime: 30 * 60 * 1000
			}
		)
};

// Team Statistics Queries
export const teamStatsQueries = {
	search: (params: TeamStatsSearchParams & { page?: number; pageSize?: number }) =>
		createPaginatedQuery(
			`teamStats:search:${JSON.stringify(params)}`,
			() => internalApi.getTeamStats(params),
			params.pageSize || 18
		),

	byTeam: (team: string, year: string) =>
		createQuery(
			`teamStats:byTeam:${team}:${year}`,
			() => internalApi.getTeamStats({ year, team }),
			{
				staleTime: 5 * 60 * 1000,
				cacheTime: 10 * 60 * 1000
			}
		),

	byConference: (conference: string, year: string) =>
		createQuery(
			`teamStats:byConference:${conference}:${year}`,
			() => internalApi.getTeamStats({ year, conference }),
			{
				staleTime: 10 * 60 * 1000,
				cacheTime: 30 * 60 * 1000
			}
		)
};

// Game Queries
export const gameQueries = {
	byTeams: (teams: string[], year: string, week: string) =>
		createQuery(
			`games:byTeams:${teams.join(',')}:${year}:${week}`,
			async () => {
				// For multiple teams, we'll need to make multiple requests
				const results = await Promise.all(
					teams.map((team) => internalApi.getGames({ year, week, team }))
				);
				return results.flat();
			},
			{
				staleTime: 30 * 60 * 1000,
				cacheTime: 2 * 60 * 60 * 1000
			}
		),

	search: (params: GameSearchParams & { page?: number; pageSize?: number }) =>
		createPaginatedQuery(
			`games:search:${JSON.stringify(params)}`,
			() => internalApi.getGames(params),
			params.pageSize || 16
		),

	byId: (gameId: string) =>
		createQuery(`games:byId:${gameId}`, () => internalApi.getGames({ id: gameId }), {
			staleTime: 60 * 60 * 1000,
			cacheTime: 24 * 60 * 60 * 1000
		})
};

// Matchup Queries (these will still use server-side until head-to-head is migrated)
export const matchupQueries = {
	headToHead: (team1: string, team2: string, minYear?: string, maxYear?: string) =>
		createQuery(
			`matchups:headToHead:${team1}:${team2}:${minYear || ''}:${maxYear || ''}`,
			async () => {
				// This will need a server API route too, but for now we'll implement it later
				throw new Error('Head-to-head queries not yet migrated to Smart Data Provider');
			},
			{
				staleTime: 30 * 60 * 1000,
				cacheTime: 2 * 60 * 60 * 1000
			}
		),

	recent: (team: string, count: number = 5) =>
		createQuery(
			`matchups:recent:${team}:${count}`,
			async () => {
				const currentYear = new Date().getFullYear();
				const games = await internalApi.getGames({
					year: currentYear.toString(),
					team
				});
				return games.slice(0, count);
			},
			{
				staleTime: 5 * 60 * 1000,
				cacheTime: 15 * 60 * 1000
			}
		)
};

// Teams Queries
export const teamQueries = {
	byDivision: (division: string = 'fbs') =>
		createQuery(
			`teams:byDivision:${division}`,
			async () => {
				// This will need implementation in the teams API route
				const response = await fetch(`/api/teams?division=${division}`);
				const result = await response.json();
				return result.data;
			},
			{
				staleTime: 24 * 60 * 60 * 1000,
				cacheTime: 7 * 24 * 60 * 60 * 1000
			}
		),

	search: (query: string) =>
		createQuery(
			`teams:search:${query}`,
			async () => {
				// Implementation depends on your team search needs
				return [];
			},
			{
				staleTime: 24 * 60 * 60 * 1000,
				cacheTime: 7 * 24 * 60 * 60 * 1000
			}
		)
};

// Centralized data queries object
export const dataQueries = {
	playerStats: playerStatsQueries,
	teamStats: teamStatsQueries,
	games: gameQueries,
	matchups: matchupQueries,
	teams: teamQueries
};
