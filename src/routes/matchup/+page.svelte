<script>
	import Matchup from '../../components/MatchupSelection.svelte';
	import Footer from '$lib/Footer.svelte';
	import Searchbar from '../../components/Searchbar.svelte';
	import '../../styles/main.css';

	let conferences = ['All', 'FBS', 'FCS'];
	let selectedConference = '';
</script>

<div class="selection-page">
	<main>
		<section>
			<Searchbar />
			<Matchup {conferences} {selectedConference} />
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
			width: 100%;
			min-height: 100%;
			height: 100%;
		}
	}
</style>
