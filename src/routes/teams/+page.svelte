<script lang="ts">
	import TeamStatSearch from '$lib/components/TeamStatSearch.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../../styles/main.css';
</script>

<div class="team-stats-selection-page">
	<main>
		<section>
			<TeamStatSearch />
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
