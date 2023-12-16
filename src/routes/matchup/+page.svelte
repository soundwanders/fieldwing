<script>
	import Matchup from '../../components/MatchupSelection.svelte';
	import Footer from '$lib/Footer.svelte';
	import Searchbar from '../../components/Searchbar.svelte';
	import '../../styles/main.css';
</script>

<div class="selection-page">
	<main>
		<section>
			<Searchbar />
			<Matchup />
		</section>
	</main>

	<Footer />
</div>

<style>
	section {
		min-height: 100vh;
	}
</style>
