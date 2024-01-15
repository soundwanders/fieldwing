<!-- src/routes/player-stats/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import '../../styles/main.css';

	export let data: { playerData?: any };
	const { playerData } = data;

	let pageSize: number = 16;

	$: totalItems = playerData ? playerData.total : 0;
	$: totalPages = Math.ceil(totalItems / pageSize);
	$: currentPage = Number($page.url.searchParams.get('skip')) / pageSize || 0;

  $: year = $page.url.searchParams.get('year') || '';
  $: team = $page.url.searchParams.get('team') || '';
  $: conference = $page.url.searchParams.get('conference') || '';
  $: startWeek = $page.url.searchParams.get('startWeek') || '';
  $: endWeek = $page.url.searchParams.get('endWeek') || '';
  $: seasonType = $page.url.searchParams.get('seasonType') || '';
  $: category = $page.url.searchParams.get('category') || '';

  let pageTitle: string = 'Player Statistics';

  onMount(() => {
		let formattedTeamName = team.charAt(0).toUpperCase() + team.slice(1);
		let formattedseasonType = seasonType.charAt(0).toUpperCase() + seasonType.slice(1);
		let formattedConference = conference.toUpperCase();

    // Build the title based on the presence of each parameter
    if (year) pageTitle += ` - ${year}`;
    if (team) pageTitle += ` - ${formattedTeamName}`;
    if (conference) pageTitle += ` - ${formattedConference}`;
    if (startWeek) pageTitle += ` - Week ${startWeek}`;
    if (endWeek) pageTitle += ` to ${endWeek}`;
    if (seasonType) pageTitle += ` - ${formattedseasonType}`;
    if (category) pageTitle += ` - ${category}`;
  });

	$: {
		console.log('totalItems:', totalItems);
		console.log('totalPages:', totalPages);
		console.log('pageTitle:', pageTitle);
	}
</script>

<div class="stats-wrapper" class:light={!$theme} class:dark={$theme}>
	<section class="stats-section">
		{#if playerData && playerData.playerStatsData && playerData.playerStatsData.length > 0}
			<div class="header-image-wrapper">
				<img class="players-image" src="/players.png" alt="Player Stats" />
				<h1 class="main-title" class:light={!$theme} class:dark={$theme}>
					{pageTitle}
				</h1>
			</div>

			<div class="player-stats-container">
				{#each playerData.playerStatsData.slice(currentPage * pageSize, (currentPage + 1) * pageSize) as playerStats}
					<article class="player-stats">
						<h2 class="player-name" class:light={!$theme} class:dark={$theme}>
							{playerStats.player}
						</h2>

						{#if playerStats.team}
							<div class="info-container">
								<p><strong>Team:</strong> {playerStats.team}</p>
							</div>
						{/if}

						{#if playerStats.conference}
							<div class="info-container">
								<p><strong>Conference:</strong> {playerStats.conference}</p>
							</div>
						{/if}

						{#if playerStats.startWeek && playerStats.endWeek}
							<div class="info-container">
								<p><strong>Start Week:</strong> {playerStats.startWeek}</p>
								<p><strong>End Week:</strong> {playerStats.endWeek}</p>
							</div>
						{/if}

						{#if playerStats.seasonType}
							<div class="info-container">
								<p><strong>Season Type:</strong> {playerStats.seasonType}</p>
							</div>
						{/if}

						{#if playerStats.category}
							<div class="info-container">
								<p><strong>Category:</strong> {playerStats.category}</p>
							</div>
						{/if}

						{#if playerStats.stats && playerStats.stats.length > 0}
							<div class="stats-container">
								{#each playerStats.stats as stat}
									<p>{stat.label}: {stat.value}</p>
								{/each}
							</div>
						{/if}
					</article>
				{/each}
			</div>

			<!-- Add pagination controls using $page -->
			<div class="pagination" class:light={!$theme} class:dark={$theme}>
				{#each Array(totalPages) as _, idx}
					<a
						href="?limit={pageSize}&skip={pageSize * idx}"
						class="pagination-item {currentPage === idx ? 'active' : ''}"
					>
						{idx + 1}
					</a>
				{/each}
			</div>
		{:else}
			<p class="no-data-message">No player stats data available.</p>
		{/if}
	</section>
</div>

<style module>
	.light {
		--background-color: #f9f9f9;
		--text-color: #1a202c;
		--teams-color: #bb0000;
		--player-name-color: #005ebb;
	}

	.dark {
		--background-color: #1a202c;
		--text-color: #f9f9f9;
		--teams-color: #ff9195;
		--player-name-color: #abaeff;
	}

	.stats-wrapper {
		min-height: 100vh;
		width: 100%;
		display: flex;
		align-items: baseline;
		justify-content: center;
		background-color: var(--background-color);
		background-image: var(--background-image);
		margin: 0;
		padding: 0;
	}

	.stats-section {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100vw;
		color: var(--text-color);
	}

	.header-image-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 2rem;
	}

	.players-image {
		height: auto;
		width: 4%;
		margin-right: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.main-title {
		max-inline-size: 50ch;
		text-wrap: balance;
		text-align: center;
		font-size: 2.25rem;
		line-height: 2.5rem;
	}

	.player-stats-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90%;
		gap: 2rem;
	}

	.player-name {
		color: var(--player-name-color);
	}

	.player-stats {
		flex: 0 0 calc(25% - 1.5rem);
		width: 30%;
		text-align: center;
		margin-bottom: 0.5rem;
		padding: 1.25rem;
		border: 1px solid #c3c8d0;
		border-radius: 0.75rem;
		box-sizing: border-box;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease-in-out;
	}

	.player-stats:hover {
		transform: scale(1.02);
		transition: transform 0.3s ease-out;
	}

	.no-data-message {
		font-size: 1.2rem;
		line-height: 1.5rem;
		color: var(--text-color);
	}

  .pagination {
    display: flex;
		width: 80%;
    list-style: none;
    padding: 0;
		margin: 2rem 0;
		overflow-x: auto;
  }

	.pagination a {
		color: var(--text-color);
		text-decoration: none;
	}

  .pagination-item {
    margin: 0 5px;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
		background-color: var(--background-color);
    transition: background-color 0.3s ease;
  }

  .pagination-item.active {
    background-color: #0051a8;
    color: #fff;
  }

  .pagination-item:hover {
    background-color: #555;
  }

	@media (max-width: 768px) {
		.stats-wrapper {
			min-height: 100%;
			width: 100%;
			margin: 0;
			padding: 0;
		}

		.stats-section {
			flex-direction: column;
			align-items: center;
			gap: 2.5rem;
			min-height: 100%;
			width: 90%;
			margin-top: 0.25rem;
		}

		.header-image-wrapper {
			width: 90%;
			margin-bottom: 1rem;
		}

		.players-image {
			height: auto;
			width: 18%;
			margin-right: 0.5rem;
			margin-bottom: 1.25rem;
		}

		.player-stats {
			flex: 1 1 auto;
		}

		.main-title {
			font-size: 1.25rem;
			line-height: 1.75rem;
		}

		.pagination {
			margin: 1rem 0 4rem 0;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
