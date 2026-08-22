import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Pinned explicitly so the serverless runtime never depends on
			// whichever Node version Vercel happens to build with.
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
