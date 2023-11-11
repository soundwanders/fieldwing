<script>
	import Selector from '../../components/Selector.svelte';

	let leagues = ['All', 'FBS', 'FCS'];
	let selectedLeague = '';
</script>

<main>
	<h1>Fieldwing</h1>

	<section>
		<Selector {leagues} {selectedLeague} />
	</section>
</main>

<footer>
	<div id="footer-container">
		<p>Made with ❤️</p>
	</div>
</footer>
