// store.ts
import { writable } from 'svelte/store';

export const selectedTeams = writable<string[]>([]);
export const searchedTeams = writable<string[]>([]);
export const gameResults = writable<{ team: any; games: any }[]>([]);
