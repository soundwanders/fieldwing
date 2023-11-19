<!-- +page.svelte -->

<script context="module" lang="ts">
  export { load } from './+page.server';
</script>

<script lang="ts">
  import TeamDetails from '../../components/TeamDetails.svelte';
</script>

<main>
  <h1>Your College Football Teams</h1>

  <TeamDetails />
</main>