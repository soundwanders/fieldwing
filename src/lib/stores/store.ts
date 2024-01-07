// store.ts
import { writable } from 'svelte/store';

export const selectedTeams = writable<string[]>([]);
export const selectedMatchupTeams = writable<string[]>([]);
export const searchedTeams = writable<string[]>([]);
export const gameResults = writable<{ team: any; games: any }[]>([]);
export const selectedWeek = writable<number>(1);
