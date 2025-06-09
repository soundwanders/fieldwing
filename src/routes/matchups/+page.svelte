<script>
	import MatchupSelection from '$lib/components/MatchupSelection.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../../styles/main.css';

	let divisions = ['All', 'FBS', 'FCS'];
	let selectedDivision = '';
</script>

<div class="matchup-selection-page">
	<main>
		<section>
			<MatchupSelection {divisions} {selectedDivision} />
		</section>
	</main>

	<Footer />
</div>

<style module>
	section {
		min-height: 100vh;
		transition: background-color 0.2s ease;
	}

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		section {
			min-height: 100%;
			height: 100%;
			width: 100%;
		}
	}
</style>
