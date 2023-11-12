<script lang="ts">
	export let leagues: string[];
	export let selectedLeague: string;
</script>

<select bind:value={selectedLeague}>
	{#each leagues as league}
		<option value={league}>{league}</option>
	{/each}
</select>
