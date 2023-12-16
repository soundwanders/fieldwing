<script>
	import { theme } from '$lib/stores/theme.js';
	import Footer from '$lib/Footer.svelte';
	import '../styles/main.css';
</script>

<div class="container" class:light={!$theme} class:dark={$theme}>
	<div class="landing-page" class:light={!$theme} class:dark={$theme}>
		<main class="main-container">
			<div class="landing-container">
				<div class="landing-hero">
					<h2>Your Front Row Seat to College Football Data</h2>
					<p>Browse game results and explore statistics for all your favorite teams</p>
					<a href="/selection" role="button" aria-label="Get Started">
						<button type="button" class="get-started" class:light={!$theme} class:dark={$theme}>
							Get Started
						</button>
					</a>
				</div>

				<div class="landing-image">
					<img src="/gameday.svg" alt="Game Day" class="hero-image" />
				</div>
			</div>

			<div class="landing-container">
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

						<h3>Explore Legacies</h3>
						<p>Dive into the rich history of college football with comprehensive game results</p>
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

						<h3>Witness Rivalries</h3>
						<p>Witness the intensity of historic rivalries through head-to-head matchups</p>
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

						<h3>Unlock Updates</h3>
						<p>Stay connected every week with current data for all your favorite teams</p>
					</div>
				</div>
			</div>
		</main>

		<Footer />
	</div>
</div>

<style>
	.container {
		width: 100vw;
		min-height: 100vh;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.landing-page {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 90vh;
		background-color: var(--background-color);
		color: var(--text-color);
	}

	.main-container {
		width: 100%;
	}

	.landing-container {
		width: 100%;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 2rem;
		margin-top: -2rem;
	}

	.landing-hero {
		width: 60%;
		text-align: center;
	}

	.landing-image {
		width: 40%;
		padding: 0;
	}

	.hero-image {
		width: 68%;
	}

	.landing-hero h2 {
		font-size: 3.75rem;
		line-height: 1;
		padding: 0 4rem;
		font-weight: bold;
		text-wrap: balance;
		word-wrap: break-word;
		max-width: 70%;
		margin: 0 auto;
	}

	.landing-hero p {
		font-size: 1.125rem;
		line-height: 1.75rem;
		margin: 1.875rem 0;
	}

	.get-started {
		border: none;
		outline: none;
		font-size: 1.125rem;
		line-height: 1.75rem;
		padding: 4px 8px;
		border-radius: 0.5rem;
		background-color: var(--get-started-background-color);
		color: var(--get-started-text-color);
		cursor: pointer;
	}

	.get-started.light {
		background-color: var(--get-started-background-color-light);
		color: var(--get-started-text-color-light);
	}

	.get-started.dark {
		background-color: var(--get-started-background-color-dark);
		color: var(--get-started-text-color-dark);
	}

	.get-started:hover {
		opacity: 0.9;
	}

	.get-started:active {
		transform: translateY(1px);
	}

	.landing-details {
		width: 85%;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		padding: 2rem 0 14rem 0;
		text-wrap: balance;
	}

	.landing-details > div {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 0 2rem;
		margin-top: 2.5rem;
	}

	.landing-details > div > p {
		margin-top: -1rem;
		text-align: center;
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

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		.container {
			width: 100%;
			min-height: 100%;
		}

		.landing-container {
			margin-top: 0;
			padding: 0;
		}

		.landing-hero {
			width: 100%;
			padding: 1.5rem;
			padding-top: 0;
		}

		.landing-hero h2 {
			font-size: 2rem;
			line-height: 2.5rem;
			padding: 1.5rem 0 0 0;
			max-width: 100%;
		}

		.landing-image {
			display: none;
		}

		.landing-page {
			min-height: 100%;
		}

		.landing-details {
			margin: 0.5rem auto;
			flex-direction: column;
			align-items: center;
			padding: 2rem;
		}

		.landing-details > div {
			margin-top: 0;
		}

		.landing-details > div > p {
			font-size: 0.875rem;
			line-height: 1.25rem;
		}

		.landing-details:last-child {
			padding-bottom: 4rem;
		}

		.get-started {
			font-size: 1rem;
			line-height: 1.5rem;
			margin-bottom: 1rem;
		}
	}
</style>
