// src/lib/stores/store.ts
import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import type { Game } from '$lib/types/api';
import type { AppStore } from '$lib/types/components';

// Game Results Types
export interface GameResult {
	team: string;
	data: Game[];
	error: string | null;
}

// Store State Interfaces
export interface SelectedTeamsState {
	teams: string[];
	isLoading: boolean;
	error: string | null;
}

export interface WeekState {
	selectedWeek: number;
	selectedYear: number;
	isValid: boolean;
}

// Stores have full type safety
export const selectedTeams: Writable<string[]> = writable<string[]>([]);
export const selectedMatchupTeams: Writable<string[]> = writable<string[]>([]);
export const searchedTeams: Writable<string[]> = writable<string[]>([]);
export const gameResults: Writable<GameResult[]> = writable<GameResult[]>([]);
export const selectedWeek: Writable<number> = writable<number>(1);
export const selectedYear: Writable<number> = writable<number>(new Date().getFullYear());

// Create store with type safety and validation
function createValidatedStore<T>(
	initialValue: T,
	validator?: (value: T) => boolean
): Writable<T> & {
	safeUpdate: (updater: (value: T) => T) => boolean;
	reset: () => void;
	validate: (value: T) => boolean;
} {
	const { subscribe, set, update } = writable<T>(initialValue);

	const validate = (value: T): boolean => {
		return validator ? validator(value) : true;
	};

	return {
		subscribe,
		set: (value: T) => {
			if (validate(value)) {
				set(value);
			} else {
				console.warn('Invalid value provided to store:', value);
			}
		},
		update,
		safeUpdate: (updater: (value: T) => T): boolean => {
			try {
				let success = false;
				update((currentValue) => {
					const newValue = updater(currentValue);
					if (validate(newValue)) {
						success = true;
						return newValue;
					}
					return currentValue;
				});
				return success;
			} catch (error) {
				console.error('Store update failed:', error);
				return false;
			}
		},
		reset: () => set(initialValue),
		validate
	};
}

// Validated stores
export const validatedSelectedWeek = createValidatedStore<number>(
	1,
	(week: number) => week >= 1 && week <= 14 && Number.isInteger(week)
);

export const validatedSelectedYear = createValidatedStore<number>(
	new Date().getFullYear(),
	(year: number) => year >= 1900 && year <= new Date().getFullYear() + 1
);

// Derived stores with type safety
export const weekYearState: Readable<WeekState> = derived(
	[validatedSelectedWeek, validatedSelectedYear],
	([$week, $year]) => ({
		selectedWeek: $week,
		selectedYear: $year,
		isValid: $week >= 1 && $week <= 14 && $year >= 1900
	})
);

export const selectedTeamsCount: Readable<number> = derived(
	selectedTeams,
	($teams) => $teams.length
);

export const hasSelectedTeams: Readable<boolean> = derived(
	selectedTeams,
	($teams) => $teams.length > 0
);

export const gameResultsWithStats: Readable<{ total: number; successful: number; failed: number }> =
	derived(gameResults, ($results) => {
		const total = $results.length;
		const successful = $results.filter((r) => r.error === null).length;
		const failed = $results.filter((r) => r.error !== null).length;
		return { total, successful, failed };
	});

// Subscription manager with type safety
export class TypedSubscriptionManager {
	private subscriptions: Array<() => void> = [];

	add<T>(store: Readable<T>, callback: (value: T) => void): void {
		const unsubscribe = store.subscribe(callback);
		this.subscriptions.push(unsubscribe);
	}

	addMultiple(subscriptions: Array<() => void>): void {
		this.subscriptions.push(...subscriptions);
	}

	cleanup(): void {
		this.subscriptions.forEach((unsub) => {
			try {
				unsub();
			} catch (error) {
				console.error('Error during subscription cleanup:', error);
			}
		});
		this.subscriptions = [];
	}

	get count(): number {
		return this.subscriptions.length;
	}
}

// Store action creators with type safety
export const storeActions = {
	// Team selection actions
	addTeam: (team: string): void => {
		if (typeof team === 'string' && team.trim().length > 0) {
			selectedTeams.update((teams) => (teams.includes(team) ? teams : [...teams, team]));
		}
	},

	removeTeam: (team: string): void => {
		selectedTeams.update((teams) => teams.filter((t) => t !== team));
	},

	toggleTeam: (team: string): void => {
		selectedTeams.update((teams) =>
			teams.includes(team) ? teams.filter((t) => t !== team) : [...teams, team]
		);
	},

	clearTeams: (): void => {
		selectedTeams.set([]);
	},

	// Game results actions
	setGameResults: (results: GameResult[]): void => {
		gameResults.set(results);
	},

	addGameResult: (result: GameResult): void => {
		gameResults.update((results) => [...results, result]);
	},

	clearGameResults: (): void => {
		gameResults.set([]);
	},

	// Week/Year actions
	setWeek: (week: number): boolean => {
		return validatedSelectedWeek.safeUpdate(() => week);
	},

	setYear: (year: number): boolean => {
		return validatedSelectedYear.safeUpdate(() => year);
	},

	// Reset all stores
	resetAll: (): void => {
		selectedTeams.set([]);
		selectedMatchupTeams.set([]);
		searchedTeams.set([]);
		gameResults.set([]);
		validatedSelectedWeek.reset();
		validatedSelectedYear.reset();
	}
};

// Store state getters with type safety
export const getStoreState = () => {
	let state: Partial<AppStore> = {};

	// Get current values synchronously
	const unsubscribers = [
		selectedTeams.subscribe((teams) => (state.selectedTeams = teams)),
		validatedSelectedWeek.subscribe((week) => (state.selectedWeek = week)),
		validatedSelectedYear.subscribe((year) => (state.selectedYear = year))
	];

	// Clean up immediately
	unsubscribers.forEach((unsub) => unsub());

	return state as AppStore;
};
