<script>
	import Selection from '../../components/GameSelection.svelte';
	import Searchbar from '../../components/Searchbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../../styles/main.css';

	let conferences = ['All', 'FBS', 'FCS'];
	let selectedConference = '';
</script>

<div class="selection-page">
	<main>
		<section>
			<div class="goalpost-wrapper">
				<img src="/goalpost.png" alt="Game selection decoration" />
			</div>
		
			<Searchbar />
			<Selection {conferences} {selectedConference} />
		</section>
	</main>

	<Footer />
</div>

<style>
	section {
		min-height: 100vh;
		animation: fadeIn 0.8s forwards;
		transition: background-color 0.2s ease; 
	}

	.goalpost-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-bottom: 1.5rem;
	}

	.goalpost-wrapper img {
		max-width: 8%;
		height: auto;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Media query for mobile devices */
	@media (max-width: 768px) {
		section {
			width: 100%;
			min-height: 100%;
			height: 100%;
		}

		.goalpost-wrapper img {
			max-width: 33%;
			height: auto;
		}
	}
</style>
