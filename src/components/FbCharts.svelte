<!-- FbCharts.svelte -->

<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  interface Game {
    home_points: number;
    // Add other properties as needed
  }

  export let games: { team: string; data: Game[] }[] = [];

  export let width = 640;
  export let height = 400;
  export let marginTop = 20;
  export let marginRight = 20;
  export let marginBottom = 20;
  export let marginLeft = 20;

  let gx: SVGGElement;
  let gy: SVGGElement;

  let x: any;
  let y: any;

  // Function to initialize the line
  function initializeLine() {
    return d3.line<Game>().x((d, i) => x(i)).y(d => y(d.home_points));
  }

  // $: ensures that line is reactive and updated when games change
  $: line = initializeLine();

  // Initialize scales on mount
  onMount(() => {
    x = d3.scaleLinear<number>().range([marginLeft, width - marginRight]);
    y = d3.scaleLinear<number>().range([height - marginBottom, marginTop]);
  });

  // Update scales and axes when data changes
  afterUpdate(() => {
    console.log('Updating chart with data:', games);

    if (games && games.length > 0) {
      console.log('Data for the first team:', games[0]);

      x.domain([0, games[0].data.length - 1]);
      y.domain(d3.extent(games.flatMap(g => g.data), d => d.home_points) as [number, number]);

      console.log('x domain:', x.domain());
      console.log('y domain:', y.domain());

      d3.select(gy).call(d3.axisLeft(y));
      d3.select(gx).call(d3.axisBottom(x));

      console.log('Chart generation completed successfully!');
    }
  });
</script>

<svg width={width} height={height}>
  <g bind:this={gx} transform={`translate(0,${height - marginBottom})`} />
  <g bind:this={gy} transform={`translate(${marginLeft},0)`} />
  {#if games && games.length > 0}
    <path fill="none" stroke="currentColor" stroke-width="1.5" d={line(games.flatMap(g => g.data) || [])} />
    <g fill="white" stroke="currentColor" stroke-width="1.5">
      {#each games as { team, data }, i}
        {#each data as game, j}
          <circle cx={x(i + j / data.length)} cy={y(game.home_points)} r="2.5" />
        {/each}
      {/each}
    </g>
  {/if}
</svg>
