<script>
	import TeamSelection from '$lib/components/TeamSelection.svelte';
	import TeamSearchbar from '$lib/components/TeamSearchbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../../styles/main.css';

	let divisions = ['All', 'FBS', 'FCS'];
	let selectedDivision = '';
</script>

<div class="team-selection-page">
	<main>
		<section>
			<figure class="selection-img-wrapper">
				<img class="selection-image" src="/selection.png" alt="Game Results Selection" />
			</figure>

			<TeamSearchbar />
			<TeamSelection {divisions} {selectedDivision} />
		</section>
		<Footer />
	</main>
</div>

<style module>
	section {
		min-height: 100vh;
		transition: background-color 0.2s ease;
	}

	.selection-img-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.selection-image {
		width: 7%;
		height: auto;
	}

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		section {
			min-height: 100%;
			height: 100%;
			width: 100%;
		}

		.selection-image {
			width: 33%;
			height: auto;
		}
	}
</style>
