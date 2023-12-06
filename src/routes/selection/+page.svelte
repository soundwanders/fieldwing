<script>
	import Selection from '../../components/GameSelection.svelte';
	import Footer from '$lib/Footer.svelte';
	import Searchbar from '../../components/Searchbar.svelte';
	import '../../styles/main.css';

	let leagues = ['All', 'FBS', 'FCS'];
	let selectedLeague = '';
</script>

<div class="selection-page">
	<main>
		<section>
			<Searchbar />
			<Selection {leagues} {selectedLeague} />
		</section>
	</main>

	<Footer />
</div>

<style>
	section {
		min-height: 100vh;
		
	}
</style>
