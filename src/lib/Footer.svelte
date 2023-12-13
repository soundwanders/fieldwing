<script>
	import { theme } from '$lib/stores/theme';
</script>

<footer class="footer">
	<nav class:light={!$theme} class:dark={$theme}>
		<a href="#tos">Terms of Service</a>
		<a href="#github">Github</a>
		<a href="#faq">FAQ</a>
	</nav>

	<div id="made-with-love">
		<p>
			made with
			<span style:font-size="0.7rem" style:padding="0 1px"> ❤️ </span>
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
