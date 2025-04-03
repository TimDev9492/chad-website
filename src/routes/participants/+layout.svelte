<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Teilnehmer</title>
  <meta
    name="description"
    content="Schau dir die Teilnehmerliste an"
  />
</svelte:head>

{@render children()}
