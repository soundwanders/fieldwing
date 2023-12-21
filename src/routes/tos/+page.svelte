<script>
	import { theme } from '$lib/stores/theme';
</script>

<section class="wrapper">
	<div class="terms-container" class:light={!$theme} class:dark={$theme}>
		<div class="terms-padding">
			<h2>Fieldwing Terms of Service</h2>

			<ol>
				<li>
					<strong>Acceptance of Terms</strong><br />
					By using our College Football App, you agree to comply with these Terms of Service. If you
					do not agree, please refrain from using the app.
				</li>

				<li>
					<strong>App Usage</strong><br />
					Our app is designed for personal, non-commercial use. Any unauthorized use or reproduction
					of the app's content is strictly prohibited.
				</li>

				<li>
					<strong>Data Accuracy</strong><br />
					While we strive to provide accurate information, we are not responsible for inaccuracies or
					errors in the app's content. Users are encouraged to verify information independently.
				</li>

				<li>
					<strong>User Data Privacy Policy</strong><br />
					It's important to note that we do not collect or store any personal information from users
					who visit our site. We do not request or retain any user data, both in the browser or on our
					servers.
				</li>

				<li>
					<strong>Code of Conduct</strong><br />
					Users must adhere to a respectful and positive code of conduct within the app. Any form of
					harassment, abuse, or inappropriate behavior will result in account suspension.
				</li>

				<li>
					<strong>Open-Source Code of Ethics</strong><br />
					While the code for our College Football App is open-source and freely accessible, users are
					prohibited from redistributing or claiming it as their own. If you'd like to use the code in
					any way, please reach out and I'd be happy to discuss it!
				</li>

				<li>
					<strong>NCAA Rights Disclaimer</strong><br />
					We do not own any rights to NCAA teams, schools, logos, or other NCAA proprietary content.
					All rights are reserved by the NCAA.
					<br />
					All content, trademarks, and intellectual property in the app are owned by us. Users are prohibited
					from using, copying, or distributing any content without explicit written permission.
				</li>

				<li>
					<strong>Changes to Terms</strong><br />
					We may update these Terms of Service from time to time. Users will be notified of any changes,
					and continued use constitutes acceptance of the revised terms.
				</li>

				<li>
					<strong>Contact Information</strong><br />
					For any questions or concerns regarding these terms, please contact us.
				</li>
			</ol>

			<p>Thank you for using <strong>Fieldwing</strong>, we appreciate you!</p>
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
		border: 1px solid #d1d5db;
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
