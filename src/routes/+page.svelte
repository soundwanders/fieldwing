<script>
	import { theme } from '$lib/stores/theme.js';
	import Footer from '$lib/Footer.svelte';
	import '../styles/main.css';
</script>

<main class="container" class:light={!$theme} class:dark={$theme}>
	<div class="landing-page" class:light={!$theme} class:dark={$theme}>
		<div class="main-container">
			<section class="landing-container">
				<article class="landing-hero">
					<h2>Your Front Row Seat to College Football Data</h2>
					<p>Browse game results and explore statistics for all NCAA college football teams</p>
					<a href="/game-results" role="button" aria-label="Get Started">
						<button type="button" class="get-started" class:light={!$theme} class:dark={$theme}>
							Get Started
						</button>
					</a>
				</article>

				<div class="landing-image-wrapper">
					<figure>
						<img src="/gameday.svg" alt="Game Day" class="hero-image" aria-hidden="true" />
					</figure>
				</div>
			</section>

			<section class="landing-container">
				<article class="landing-details">
					<div class="landing-ctas">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<g id="SVGRepo_bgCarrier" stroke-width="0" />
							<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
							<g id="SVGRepo_iconCarrier">
								<path
									d="M21 8L19 20H5L3 8M21 8L15.5 12.5L12 7M21 8C21.8284 8 22.5 7.32843 22.5 6.5C22.5 5.67157 21.8284 5 21 5C20.1716 5 19.5 5.67157 19.5 6.5C19.5 7.32843 20.1716 8 21 8ZM12 7L8.5 12.5L3 8M12 7C12.8284 7 13.5 6.32843 13.5 5.5C13.5 4.67157 12.8284 4 12 4C11.1716 4 10.5 4.67157 10.5 5.5C10.5 6.32843 11.1716 7 12 7ZM3 8C3.82843 8 4.5 7.32843 4.5 6.5C4.5 5.67157 3.82843 5 3 5C2.17157 5 1.5 5.67157 1.5 6.5C1.5 7.32843 2.17157 8 3 8Z"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
						</svg>

						<h3>Explore Legacies</h3>
						<p>Dive into the rich history of college football</p>
					</div>

					<div class="landing-ctas">
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
							aria-hidden="true"
						>
							<polygon
								points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
							/>
						</svg>

						<h3>Witness Rivalries</h3>
						<p>Witness the intensity of historic rivalries through head-to-head matchups</p>
					</div>

					<div class="landing-ctas">
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
							aria-hidden="true"
						>
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
							<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
						</svg>

						<h3>Unlock Updates</h3>
						<p>Stay connected during the season with current data for your favorite teams</p>
					</div>
				</article>
			</section>
		</div>

		<Footer />
	</div>
</main>

<style module>
	.container {
		min-height: 100vh;
		width: 100vw;
		background-color: var(--background-color);
		background-image: var(--background-image);
		color: var(--text-color);
		animation: fadeIn 0.8s forwards ease-out;
		transition: background-color 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.landing-page {
		display: flex;
		flex-direction: column;
		min-height: 90vh;
		width: 100%;
		background-color: var(--background-color);
		background-image: var(--background-image);
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
		padding: 0 1rem 1rem 1rem;
		gap: 2rem;
	}

	.landing-hero {
		width: 60%;
		text-align: center;
	}

	.landing-image-wrapper {
		width: 40%;
		padding: 0;
	}

	.hero-image {
		width: 68%;
	}

	.landing-hero h2 {
		font-size: 3.75rem;
		font-weight: bold;
		line-height: 1;
		text-wrap: balance;
		word-wrap: break-word;
		max-width: 70%;
		padding: 0 4rem;
		margin: 0 auto;
		margin-top: 2rem;
	}

	.landing-hero p {
		font-size: 1.125rem;
		line-height: 1.75rem;
		margin: 1.875rem 0;
	}

	.get-started {
		font-size: 1.125rem;
		line-height: 1.75rem;
		padding: 0.25rem 0.5rem;
		border: none;
		outline: none;
		border-radius: 0.5rem;
		background-color: var(--get-started-background-color);
		color: var(--get-started-text-color);
		cursor: pointer;
	}

	.get-started:hover {
		opacity: 0.9;
	}

	.get-started:active {
		transform: translateY(1px);
	}

	.landing-ctas {
		text-align: center;
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
		margin-top: 3rem;
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

	.landing-ctas:last-of-type {
		padding-bottom: 2rem;
	}

	.light {
		--text-color: #1a202c;
		--get-started-background-color: #293545;
		--get-started-text-color: #f9f9f9;
	}

	.dark {
		--text-color: #f9f9f9;
		--get-started-background-color: #cbd5e1;
		--get-started-text-color: #09090b;
	}

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		.container {
			min-height: 100%;
			width: 100%;
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
			max-width: 100%;
			font-size: 2rem;
			line-height: 2.5rem;
			padding: 1.5rem 0 0 0;
			margin-top: 0;
		}

		.landing-image-wrapper {
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

		.landing-details:first-of-type {
			margin-top: -0.5rem;
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
