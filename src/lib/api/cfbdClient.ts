// src/lib/api/cfbdClient.ts

import { CFBD_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

// Define types for our API client options
interface RequestOptions {
  timeout?: number;      // How long to wait before giving up (milliseconds)
  retries?: number;      // How many times to retry failed requests
  cache?: boolean;       // Whether to cache this request
}

// Define the structure of cached data
interface CachedData {
  data: any;
  timestamp: number;     // When this was cached
  ttl: number;          // Time to live (how long cache is valid)
}

// Main API client class
class CFBDApiClient {
  private baseURL = 'https://api.collegefootballdata.com';
  private requestCount = 0;           // Track how many requests we've made
  private lastRequestTime = 0;        // When was our last request
  private readonly RATE_LIMIT_DELAY = 100; // Wait 100ms between requests
  private cache = new Map<string, CachedData>(); // Our simple cache storage

  /**
   * Private method to handle rate limiting
   * This ensures we don't overwhelm the API with too many requests
   */
  private async rateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // If we made a request too recently, wait a bit
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }
    
    // Update our tracking
    this.lastRequestTime = Date.now();
    this.requestCount++;
    
    // Make the actual request with our API key
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${CFBD_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Generate a unique cache key for each request
   * This helps us identify cached data later
   */
  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  /**
   * Check if we have valid cached data for this request
   */
  private getCachedData(cacheKey: string) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    // Check if the cache has expired
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Store data in our cache
   */
  private setCachedData(cacheKey: string, data: any, ttl: number = 300000): void {
    // Default TTL is 5 minutes (300000 milliseconds)
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Main request method - this is the heart of our API client
   * It handles caching, retries, timeouts, and error handling
   */
  async request<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 10000, retries = 2, cache = true } = options;
    
    // Clean up parameters - remove empty values that would mess up the API
    const cleanParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Build the full URL
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = this.getCacheKey(endpoint, cleanParams);

    // Check cache first (if caching is enabled)
    if (cache) {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }

    let lastError: Error | undefined = undefined;
    
    // Retry logic - try the request multiple times if it fails
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Set up timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`API Request (attempt ${attempt + 1}): ${url}`);
        
        const response = await this.rateLimitedFetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        if (cache) {
          this.setCachedData(cacheKey, data);
          console.log(`Cached response for ${endpoint}`);
        }
        
        return data;
      } catch (err) {
        lastError = err as Error;
        console.error(`Request attempt ${attempt + 1} failed:`, lastError?.message);
        
        // If we have more retries left, wait before trying again
        if (attempt < retries) {
          // Exponential backoff: wait longer each time (1s, 2s, 4s, etc.)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we get here, all retries failed
    console.error(`API request failed after ${retries + 1} attempts:`, lastError);
    throw error(500, `Failed to fetch data: ${lastError?.message ?? 'Unknown error'}`);
  }

  /**
   * Specific API methods for each endpoint
   * These make it easy to call the API without remembering exact parameter names
   */
  
  async getGames(params: { 
    year?: string; 
    week?: string; 
    team?: string; 
    seasonType?: string;
  } = {}) {
    return this.request('/games', params);
  }

  async getPlayerStats(params: { 
    year: string;                    // Required
    team?: string; 
    conference?: string; 
    startWeek?: string; 
    endWeek?: string; 
    category?: string;
    seasonType?: string;
  }) {
    return this.request('/stats/player/season', params);
  }

  async getTeamStats(params: {
    year: string;                    // Required
    team?: string;
    conference?: string;
    startWeek?: string;
    endWeek?: string;
  }) {
    return this.request('/stats/season', params);
  }

  async getTeamMatchup(params: { 
    team1: string;                   // Required
    team2: string;                   // Required
    minYear?: string; 
    maxYear?: string;
  }) {
    return this.request('/teams/matchup', params);
  }

  /**
   * Utility methods for monitoring and debugging
   */
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
}

export const cfbdApi = new CFBDApiClient();