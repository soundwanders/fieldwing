// media.ts
export function media(query: string): boolean {
	if (typeof window !== 'undefined') {
		const mql = window.matchMedia(query);
		return mql.matches;
	}

	// Default to false in SSR
	return false;
}
