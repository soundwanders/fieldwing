<script>
	import Selections from '../../components/Selections.svelte';
	import Footer from '../../components/Footer.svelte';
	import '../../styles/main.css';

	let leagues = ['All', 'FBS', 'FCS'];
	let selectedLeague = '';
</script>

<div class="selection-page">
	<main>
		<section>
			<Selections {leagues} {selectedLeague} />
		</section>
	</main>

	<Footer />
</div>
