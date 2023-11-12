// store.ts
import { writable } from 'svelte/store';

export const theme = writable<boolean>(false);
export const selectedTeams = writable<string[]>([]);
export const gameResults = writable<{ team: any; games: any }[]>([]);
