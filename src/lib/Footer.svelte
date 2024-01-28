<script>
	import { theme } from '$lib/stores/theme';
</script>

<footer class="footer">
	<nav class:light={!$theme} class:dark={$theme}>
		<a href="/tos" role="button" aria-label="Go to Terms of Service">Terms of Service</a>
		<a
			href="https://github.com/soundwanders"
			role="button"
			target="_blank"
			aria-label="Go to Github Repository">Github</a
		>
		<a
			href="https://api.collegefootballdata.com/api/docs/?url=/api-docs.json"
			role="button"
			target="_blank"
			aria-label="Go to API documentation">API</a
		>
	</nav>

	<div id="made-with-love">
		<p>
			made with
			<span style:font-size="0.7rem" style:padding="0 1px" aria-label="love"> ❤️ </span>
		</p>
	</div>
</footer>

<style module>
	.footer {
		border-top: 1px solid #9ca3af;
		padding: 2rem;
	}

	.footer nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		color: inherit;
		font-size: 0.75rem;
		line-height: 1rem;
	}

	.footer a {
		text-decoration: none;
		transition: color 0.2s ease-in-out;
		color: inherit;
	}

	.footer a:hover {
		text-decoration: underline;
		color: #3c89d0;
	}

	#made-with-love {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 1rem 0;
		font-size: 0.75rem;
		line-height: 1rem;
	}
</style>
