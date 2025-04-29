<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Anreise</title>
  <meta
    name="description"
    content="Infos zur Anreise und Übernachtung"
  />
</svelte:head>

{@render children()}
