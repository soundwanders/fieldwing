// src/lib/stores/teamData.ts
import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

interface TeamData {
  fbs: string[];
  fcs: string[];
  all: string[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create the main team data store
function createTeamDataStore(): Writable<TeamData> & {
  loadTeams: () => Promise<void>;
  getTeamsByDivision: (division: string) => string[];
  searchTeams: (query: string, division?: string) => string[];
  reset: () => void;
} {
  const initialState: TeamData = {
    fbs: [],
    fcs: [],
    all: [],
    isLoaded: false,
    isLoading: false,
    error: null
  };

  const { subscribe, set, update } = writable<TeamData>(initialState);

  return {
    subscribe,
    set,
    update,

    // Lazy load team data only when needed
    async loadTeams(): Promise<void> {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        console.log('🏈 Loading team data...');
        
        // Load both datasets in parallel
        const [fbsModule, fcsModule] = await Promise.all([
          import('$lib/data/fbs.json'),
          import('$lib/data/fcs.json')
        ]);

        const fbsTeams = fbsModule.default;
        const fcsTeams = fcsModule.default;
        const allTeams = [...fbsTeams, ...fcsTeams].sort();

        update(state => ({
          ...state,
          fbs: fbsTeams,
          fcs: fcsTeams,
          all: allTeams,
          isLoaded: true,
          isLoading: false,
          error: null
        }));

        console.log(`✅ Loaded ${fbsTeams.length} FBS teams, ${fcsTeams.length} FCS teams`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team data';
        console.error('❌ Failed to load team data:', errorMessage);
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
      }
    },

    // Get teams by division
    getTeamsByDivision(division: string): string[] {
      let teams: string[] = [];
      
      update(state => {
        switch (division.toLowerCase()) {
          case 'fbs':
            teams = state.fbs;
            break;
          case 'fcs':
            teams = state.fcs;
            break;
          case 'all':
          default:
            teams = state.all;
            break;
        }
        return state;
      });
      
      return teams;
    },

    // Search teams with optional division filter
    searchTeams(query: string, division?: string): string[] {
      if (!query || query.length < 2) return [];
      
      let teams: string[] = [];
      const searchQuery = query.toLowerCase();
      
      update(state => {
        const sourceTeams = division ? this.getTeamsByDivision(division) : state.all;
        teams = sourceTeams.filter(team => 
          team.toLowerCase().includes(searchQuery)
        );
        return state;
      });
      
      return teams;
    },

    // Reset the store
    reset(): void {
      set(initialState);
    }
  };
}

// Export the singleton instance
export const teamDataStore = createTeamDataStore();

// Derived stores for easy access
export const isTeamDataLoaded: Readable<boolean> = derived(
  teamDataStore, 
  $teamData => $teamData.isLoaded
);

export const isTeamDataLoading: Readable<boolean> = derived(
  teamDataStore, 
  $teamData => $teamData.isLoading
);

export const teamDataError: Readable<string | null> = derived(
  teamDataStore, 
  $teamData => $teamData.error
);

// Helper functions
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

export function getTeamsByDivision(division: string): string[] {
  return teamDataStore.getTeamsByDivision(division);
}

export function searchTeams(query: string, division?: string): string[] {
  return teamDataStore.searchTeams(query, division);
}