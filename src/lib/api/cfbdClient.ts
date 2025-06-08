// src/lib/api/cfbdClient.ts (Fixed Imports and Errors)

import { CFBD_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

// Fixed imports: Separate type imports from value imports
import type {
  Game,
  PlayerStat,
  TeamStat,
  TeamMatchup,
  GameSearchParams,
  PlayerStatsSearchParams,
  TeamStatsSearchParams,
  MatchupSearchParams,
  APIError
} from '$lib/types/api';

// Import type guards as VALUES (not types)
import {
  isGame,
  isPlayerStat,
  isTeamStat,
  isMatchupGame
} from '$lib/types/api';

interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  validateResponse?: boolean;
}

interface CachedData<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CFBDApiClient {
  private baseURL = 'https://api.collegefootballdata.com';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_DELAY = 100;
  private cache = new Map<string, CachedData>();

  private async rateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
    
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${CFBD_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  private getCachedData<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data as T;
  }

  private setCachedData<T>(cacheKey: string, data: T, ttl: number = 300000): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private validateResponse<T>(
    data: any,
    validator?: (item: any) => item is T
  ): T[] {
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array');
    }

    if (validator) {
      const invalidItems = data.filter(item => !validator(item));
      if (invalidItems.length > 0) {
        console.warn('Some API response items failed validation:', invalidItems.length);
      }
      return data.filter(validator);
    }

    return data;
  }

  async request<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    options: RequestOptions = {},
    validator?: (item: any) => item is T
  ): Promise<T[]> {
    const { timeout = 10000, retries = 2, cache = true, validateResponse = true } = options;
    
    const cleanParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = this.getCacheKey(endpoint, cleanParams);

    if (cache) {
      const cachedData = this.getCachedData<T[]>(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }

    // Fixed: Initialize lastError properly
    let lastError: Error = new Error('Unknown error occurred');
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`API Request (attempt ${attempt + 1}): ${url}`);
        
        const response = await this.rateLimitedFetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const apiError: APIError = {
            message: `API request failed: ${response.status} ${response.statusText}`,
            status: response.status
          };
          throw new Error(apiError.message);
        }

        const rawData = await response.json();
        
        let validatedData: T[];
        if (validateResponse && validator) {
          validatedData = this.validateResponse(rawData, validator);
        } else {
          validatedData = rawData;
        }
        
        if (cache) {
          this.setCachedData(cacheKey, validatedData);
          console.log(`Cached response for ${endpoint}`);
        }
        
        return validatedData;
      } catch (err) {
        lastError = err as Error;
        console.error(`Request attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`API request failed after ${retries + 1} attempts:`, lastError);
    throw error(500, `Failed to fetch data: ${lastError.message}`);
  }

  // Typed API methods with validation
  async getGames(params: GameSearchParams = {}): Promise<Game[]> {
    return this.request('/games', params, { validateResponse: true }, isGame);
  }

  async getPlayerStats(params: PlayerStatsSearchParams): Promise<PlayerStat[]> {
    if (!params.year) {
      throw new Error('Year parameter is required for player statistics');
    }
    return this.request('/stats/player/season', params, { validateResponse: true }, isPlayerStat);
  }

  async getTeamStats(params: TeamStatsSearchParams): Promise<TeamStat[]> {
    if (!params.year) {
      throw new Error('Year parameter is required for team statistics');
    }
    return this.request('/stats/season', params, { validateResponse: true }, isTeamStat);
  }

  async getTeamMatchup(params: MatchupSearchParams): Promise<TeamMatchup> {
    if (!params.team1 || !params.team2) {
      throw new Error('Both team1 and team2 parameters are required for matchups');
    }
    
    // Create a special request method for single-object responses
    const cleanParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${this.baseURL}/teams/matchup${queryString ? `?${queryString}` : ''}`;
    const cacheKey = this.getCacheKey('/teams/matchup', cleanParams);

    // Check cache first
    const cachedData = this.getCachedData<TeamMatchup>(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for /teams/matchup`);
      return cachedData;
    }

    let lastError: Error = new Error('Unknown error occurred');
    
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        console.log(`API Request (attempt ${attempt + 1}): ${url}`);
        
        const response = await this.rateLimitedFetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // The matchup endpoint returns a single object, not an array
        const matchupData = await response.json() as TeamMatchup;
        
        if (!matchupData) {
          throw new Error('No matchup data found');
        }

        // Validate matchup games if present
        if (matchupData.games && Array.isArray(matchupData.games)) {
          matchupData.games = matchupData.games.filter(isMatchupGame);
        }

        // Cache the result
        this.setCachedData(cacheKey, matchupData);
        console.log(`Cached response for /teams/matchup`);
        
        return matchupData;
      } catch (err) {
        lastError = err as Error;
        console.error(`Request attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`API request failed after 3 attempts:`, lastError);
    throw error(500, `Failed to fetch matchup data: ${lastError.message}`);
  }
  
  // Utility methods
  getRequestCount(): number {
    return this.requestCount;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('API cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/games', { year: new Date().getFullYear(), week: 1 }, { 
        timeout: 5000, 
        retries: 1, 
        cache: false 
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const cfbdApi = new CFBDApiClient();

// Export types for use in components
export type { Game, PlayerStat, TeamStat, TeamMatchup, APIError };