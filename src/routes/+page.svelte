<script>
	import { theme } from '$lib/stores/theme.js';
	import Footer from '../components/Footer.svelte';
	import '../styles/main.css';
</script>

<div class="landing-page" class:light={!$theme} class:dark={$theme}>
	<main class="landing-main">
		<div class="landing-hero">
			<h2>Stay Updated With Live Scores</h2>
			<p>Get real-time updates on your favorite sports teams</p>
			<button type="button" class="sign-up" class:light={!theme} class:dark={theme}>
				Sign Up Now
			</button>
		</div>

		<div class="landing-details">
			<div class="landing-updates">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
				<h3>Real-Time Updates</h3>
				<p>Stay in the game with your favorite teams!</p>
			</div>

			<div class="landing-notifications">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
					<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</svg>
				<h3>Notifications</h3>
				<p>Receive weekly notifications, straight from the sideline.</p>
			</div>

			<div class="landing-favorites">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon
						points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
					/>
				</svg>
				<h3>Favorites</h3>
				<p>Follow your favorite teams and get personalized updates.</p>
			</div>
		</div>
	</main>

	<Footer />
</div>

<style>
	.landing-page {
		display: flex;
		flex-direction: column;
		width: 100vw;
		min-height: 100vh;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.landing-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 2rem;
	}

	.landing-hero {
		text-align: center;
		gap: 1rem;
	}

	.landing-hero h2 {
		font-size: 2.25rem;
		font-weight: bold;
	}

	.landing-hero p {
		font-size: 1.125rem;
	}

	.sign-up {
		border: none;
		outline: none;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.landing-details {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	.landing-details > div {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.landing-details svg {
		height: 3rem;
		width: 3rem;
		opacity: 0.75;
	}

	.landing-favorites {
		padding-bottom: 2rem;
	}

	.light {
		background-color: #f9f9f9;
		color: #1a202c;
	}

	.dark {
		background-color: #1a202c;
		color: #f9f9f9;
	}
</style>
