// src/lib/stores/store.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

// Define interfaces for type safety
interface GameResult {
  team: any;
  games: any;
}

// Create stores with proper TypeScript types
export const selectedTeams: Writable<string[]> = writable<string[]>([]);
export const selectedMatchupTeams: Writable<string[]> = writable<string[]>([]);
export const searchedTeams: Writable<string[]> = writable<string[]>([]);
export const gameResults: Writable<GameResult[]> = writable<GameResult[]>([]);
export const selectedWeek: Writable<number> = writable<number>(1);

// Enhanced store with cleanup helpers
function createManagedStore<T>(initialValue: T) {
  const { subscribe, set, update } = writable<T>(initialValue);
  
  return {
    subscribe,
    set,
    update,
    reset: () => set(initialValue),
    // Helper for safe updates with error handling
    safeUpdate: (updater: (value: T) => T) => {
      try {
        update(updater);
      } catch (error) {
        console.error('Store update failed:', error);
      }
    }
  };
}

// Enhanced stores with additional functionality
export const managedSelectedTeams = createManagedStore<string[]>([]);
export const managedGameResults = createManagedStore<GameResult[]>([]);

// Store cleanup helper
export function resetAllStores(): void {
  selectedTeams.set([]);
  selectedMatchupTeams.set([]);
  searchedTeams.set([]);
  gameResults.set([]);
  selectedWeek.set(1);
  
  managedSelectedTeams.reset();
  managedGameResults.reset();
}

// Subscription manager for components
export class SubscriptionManager {
  private subscriptions: (() => void)[] = [];

  add(unsubscribe: () => void): void {
    this.subscriptions.push(unsubscribe);
  }

  cleanup(): void {
    this.subscriptions.forEach(unsub => {
      try {
        unsub();
      } catch (error) {
        console.error('Error during subscription cleanup:', error);
      }
    });
    this.subscriptions = [];
  }
}