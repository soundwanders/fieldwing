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
			<Searchbar />
			<Selection {conferences} {selectedConference} />
		</section>
	</main>

	<Footer />
</div>

<style>
	section {
		min-height: 100vh;
	}
</style>
