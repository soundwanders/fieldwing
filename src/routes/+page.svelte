<script>
  import { theme } from '$lib/stores/theme.js';
  import '../styles/main.css';
</script>

<div class="landing-page" class:light={!$theme} class:dark={$theme}>
	<main class="landing-main">
		<div class="landing-hero">
			<h2>Stay Updated With Live Scores</h2>
			<p>Get real-time updates on your favorite sports teams</p>
			<button class="sign-up">Sign Up Now</button>
		</div>

		<div class="landing-updates">
			<div>
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
				<p>Mark your favorite teams and get personalized updates.</p>
			</div>
		</div>
	</main>

	<footer class="landing-footer">
		<nav>
			<a href="#tos">Terms of Service</a>
			<a href="#github">Github</a>
			<a href="#contact">Contact</a>
		</nav>

		<div id="made-with-love">
			<p>Made with ❤️</p>
		</div>
	</footer>
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
	}

	.landing-updates {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 2rem;
	}

	.landing-updates > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.landing-favorites {
    padding-bottom: 2rem;
  }

	.landing-updates svg {
		height: 3rem;
		width: 3rem;
		opacity: 0.75;
	}

	.landing-footer {
		border-top: 1px solid #4a5568;
    padding: 2rem;
	}

	.landing-footer nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}

	.landing-footer a {
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.2s ease-in-out;
		color: var(--text-color);
	}

	.landing-footer a:hover {
		text-decoration: underline;
		color: #3c89d0;
	}

	#made-with-love {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 1rem 0;
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
