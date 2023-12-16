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

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		section {
			min-height: 100%;
			width: 100%;
			height: 100%;
		}
	}
</style>
