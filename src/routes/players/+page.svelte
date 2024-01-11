<script lang="ts">
  import StatSearch from "../../components/StatSearch.svelte";
	import Footer from '$lib/Footer.svelte';
	import '../../styles/main.css';
</script>

<div class="selection-page">
	<main>
		<section>
      <StatSearch />
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
			min-height: 100%;
			height: 100%;
			width: 100%;
		}
	}
</style>
