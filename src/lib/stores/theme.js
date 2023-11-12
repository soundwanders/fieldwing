// theme.js
import { writable } from 'svelte/store';

// Check if localStorage is available
const isLocalStorageAvailable = (() => {
	try {
		localStorage.setItem('test', 'test');
		localStorage.removeItem('test');
		return true;
	} catch (e) {
		return false;
	}
})();

// Create the writable store
export const theme = writable(
	isLocalStorageAvailable && localStorage.getItem('theme') === 'dark' ? true : false
);
