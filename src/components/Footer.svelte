<footer class="footer">
	<nav>
		<a href="#tos">Terms of Service</a>
		<a href="#github">Github</a>
		<a href="#faq">FAQ</a>
	</nav>

	<div id="made-with-love">
		<p>Made with ❤️</p>
	</div>
</footer>

<style module>
	.footer {
		border-top: 1px solid #4a5568;
		padding: 2rem;
	}

	.footer nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}

	.footer a {
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.2s ease-in-out;
		color: var(--text-color);
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
	}
</style>
