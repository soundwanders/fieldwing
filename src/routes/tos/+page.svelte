<script>
	import { theme } from '$lib/stores/theme';
	import '../../styles/main.css';
</script>

<section class="wrapper">
	<div class="terms-container" class:light={!$theme} class:dark={$theme}>
		<div class="terms-padding">
			<h2>Fieldwing Terms of Service</h2>

			<ol>
				<li>
					<strong>Acceptance of Terms</strong><br />
					By using the Fieldwing website, you agree to comply with these Terms of Service. If you do
					not agree, please refrain from using the app. This web app is designed for personal, non-commercial
					use. Any unauthorized use or reproduction of the app's content is strictly prohibited.
				</li>

				<li>
					<strong>Data Accuracy</strong><br />
					While I strive to provide accurate information, I am not responsible for inaccuracies or errors
					in the app's content. Users are encouraged to verify information independently, as our data
					comes from a third-party API (the College Football Database).
				</li>

				<li>
					<strong>User Data Privacy Policy</strong><br />
					It's important to note that Fieldwing does not collect or store any personal information from
					users who visit the site. Fieldwing will never request your data or retain user data, both
					in the browser and on the server.
				</li>

				<li>
					<strong>NCAA Rights Disclaimer</strong><br />
					I do not own any rights to NCAA teams, schools, logos, or other NCAA proprietary content. All
					rights are reserved by the NCAA.
					<br />
					All content, trademarks, and intellectual property in the app are owned by us. Users are prohibited
					from using, copying, or distributing any content without explicit written permission.
				</li>

				<li>
					<strong>Contact Information</strong><br />
					For any questions or concerns regarding these terms, please contact me.
				</li>
			</ol>

			<p>Thank you for using <strong>Fieldwing</strong>, I appreciate you!</p>
		</div>
	</div>
</section>

<style module>
	.wrapper {
		width: 100vw;
		height: 100vh;
		background-color: var(--background-color);
		background-image: var(--background-image);
		color: var(--text-color);
		padding: 0;
		margin: 0;
	}

	.terms-container {
		width: 60%;
		padding: 1rem 1.5rem;
		margin: 0 auto;
		border: 1px solid #c3c8d0;
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: background-color 0.2s ease;
	}

	h2 {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
		text-align: center;
		margin-top: 0.25rem;
		margin-bottom: 1.5rem;
	}

	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: 1.5rem;
	}

	.light {
		--text-color: #1a202c;
	}

	.dark {
		--text-color: #f9f9f9;
	}

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
			height: 100%;
		}

		.terms-container {
			width: 100%;
			margin: 0 auto;
			padding: 0;
		}

		.terms-padding {
			padding: 0.5rem 2rem;
		}
	}
</style>
