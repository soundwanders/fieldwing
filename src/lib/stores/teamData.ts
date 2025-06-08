// src/lib/stores/teamData.ts
import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

// Interfaces with full type safety
export interface TeamData {
  fbs: string[];
  fcs: string[];
  all: string[];
  isLoaded: boolean;
  isLoading: boolean;
  error: TeamDataError | null;
  lastUpdated: Date | null;
}

export interface TeamDataError {
  message: string;
  code: string;
  recoverable: boolean;
}

export type Division = 'fbs' | 'fcs' | 'all';

export interface SearchOptions {
  division?: Division;
  minLength?: number;
  maxResults?: number;
  caseSensitive?: boolean;
}

export interface TeamSearchResult {
  teams: string[];
  total: number;
  query: string;
  division: Division | 'all';
}

function createTeamDataStore() {
  const initialState: TeamData = {
    fbs: [],
    fcs: [],
    all: [],
    isLoaded: false,
    isLoading: false,
    error: null,
    lastUpdated: null
  };

  const { subscribe, set, update } = writable<TeamData>(initialState);

  return {
    subscribe,

    // Load team data with enhanced error handling
    async loadTeams(): Promise<void> {
      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null 
      }));
      
      try {
        console.log('🏈 Loading team data...');
        
        const [fbsModule, fcsModule] = await Promise.all([
          import('$lib/data/fbs.json'),
          import('$lib/data/fcs.json')
        ]);

        const fbsTeams: string[] = fbsModule.default;
        const fcsTeams: string[] = fcsModule.default;

        // Validate team data
        if (!Array.isArray(fbsTeams) || !Array.isArray(fcsTeams)) {
          throw new Error('Invalid team data format');
        }

        if (fbsTeams.length === 0 || fcsTeams.length === 0) {
          throw new Error('Empty team data received');
        }

        const allTeams = [...fbsTeams, ...fcsTeams].sort();

        update(state => ({
          ...state,
          fbs: fbsTeams,
          fcs: fcsTeams,
          all: allTeams,
          isLoaded: true,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        }));

        console.log(`✅ Loaded ${fbsTeams.length} FBS teams, ${fcsTeams.length} FCS teams`);
      } catch (err) {
        const error: TeamDataError = {
          message: err instanceof Error ? err.message : 'Failed to load team data',
          code: 'LOAD_FAILED',
          recoverable: true
        };
        
        console.error('❌ Failed to load team data:', error.message);
        
        update(state => ({
          ...state,
          isLoading: false,
          error
        }));

        throw error;
      }
    },

    // Get teams by division with validation
    getTeamsByDivision(division: Division | string): string[] {
      let teams: string[] = [];
      
      const unsubscribe = subscribe(state => {
        if (!state.isLoaded) {
          console.warn('Team data not loaded yet');
          return;
        }

        switch (division.toLowerCase()) {
          case 'fbs':
            teams = [...state.fbs];
            break;
          case 'fcs':
            teams = [...state.fcs];
            break;
          case 'all':
          default:
            teams = [...state.all];
            break;
        }
      });
      
      unsubscribe();
      return teams;
    },

    searchTeams(
      query: string, 
      options: SearchOptions = {}
    ): TeamSearchResult {
      const {
        division = 'all',
        minLength = 2,
        maxResults = 50,
        caseSensitive = false
      } = options;

      if (!query || query.trim().length < minLength) {
        return {
          teams: [],
          total: 0,
          query: query.trim(),
          division
        };
      }

      const searchQuery = caseSensitive ? query.trim() : query.trim().toLowerCase();
      const sourceTeams = this.getTeamsByDivision(division);
      
      const filteredTeams = sourceTeams.filter(team => {
        const teamName = caseSensitive ? team : team.toLowerCase();
        return teamName.includes(searchQuery);
      });

      const results = filteredTeams.slice(0, maxResults);

      return {
        teams: results,
        total: filteredTeams.length,
        query: query.trim(),
        division
      };
    },

    // Validate team name
    isValidTeam(teamName: string, division?: Division): boolean {
      if (!teamName || typeof teamName !== 'string') {
        return false;
      }

      const teams = division ? this.getTeamsByDivision(division) : this.getTeamsByDivision('all');
      return teams.includes(teamName);
    },

    // Get team info
    getTeamInfo(teamName: string): { division: Division | null; exists: boolean } {
      const fbsTeams = this.getTeamsByDivision('fbs');
      const fcsTeams = this.getTeamsByDivision('fcs');

      if (fbsTeams.includes(teamName)) {
        return { division: 'fbs', exists: true };
      }
      
      if (fcsTeams.includes(teamName)) {
        return { division: 'fcs', exists: true };
      }

      return { division: null, exists: false };
    },

    // Clear error
    clearError(): void {
      update(state => ({ ...state, error: null }));
    },

    // Reset store
    reset(): void {
      set(initialState);
    },

    // Get store statistics
    getStats(): { fbs: number; fcs: number; total: number; isLoaded: boolean } {
      let stats = { fbs: 0, fcs: 0, total: 0, isLoaded: false };
      
      const unsubscribe = subscribe(state => {
        stats = {
          fbs: state.fbs.length,
          fcs: state.fcs.length,
          total: state.all.length,
          isLoaded: state.isLoaded
        };
      });
      
      unsubscribe();
      return stats;
    }
  };
}

export const teamDataStore = createTeamDataStore();

// Enhanced derived stores with type safety
export const isTeamDataLoaded: Readable<boolean> = derived(
  teamDataStore, 
  $teamData => $teamData.isLoaded
);

export const isTeamDataLoading: Readable<boolean> = derived(
  teamDataStore, 
  $teamData => $teamData.isLoading
);

export const teamDataError: Readable<TeamDataError | null> = derived(
  teamDataStore, 
  $teamData => $teamData.error
);

export const teamDataStats: Readable<{ fbs: number; fcs: number; total: number }> = derived(
  teamDataStore,
  $teamData => ({
    fbs: $teamData.fbs.length,
    fcs: $teamData.fcs.length,
    total: $teamData.all.length
  })
);

export const teamDataStatus: Readable<'idle' | 'loading' | 'loaded' | 'error'> = derived(
  teamDataStore,
  $teamData => {
    if ($teamData.error) return 'error';
    if ($teamData.isLoading) return 'loading';
    if ($teamData.isLoaded) return 'loaded';
    return 'idle';
  }
);

// Helper functions with type safety
export async function ensureTeamsLoaded(): Promise<void> {
  let isLoaded = false;
  let isLoading = false;
  
  const unsubscribe = teamDataStore.subscribe(state => {
    isLoaded = state.isLoaded;
    isLoading = state.isLoading;
  });
  
  unsubscribe();
  
  if (!isLoaded && !isLoading) {
    await teamDataStore.loadTeams();
  }
}

export function getTeamsByDivision(division: Division | string): string[] {
  return teamDataStore.getTeamsByDivision(division);
}

export function searchTeams(query: string, options?: SearchOptions): TeamSearchResult {
  return teamDataStore.searchTeams(query, options);
}

export function validateTeamName(teamName: string, division?: Division): boolean {
  return teamDataStore.isValidTeam(teamName, division);
}

export function getTeamDivision(teamName: string): Division | null {
  return teamDataStore.getTeamInfo(teamName).division;
}

// Team data cache management
class TeamDataCache {
  private cache = new Map<string, TeamSearchResult & { timestamp: number }>();
  private readonly maxCacheSize = 100;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  set(key: string, result: TeamSearchResult): void {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      ...result,
      timestamp: Date.now()
    });
  }

  get(key: string): TeamSearchResult | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    // Return without timestamp for external use
    const { timestamp, ...result } = cached;
    return result;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }
}

export const teamSearchCache = new TeamDataCache();