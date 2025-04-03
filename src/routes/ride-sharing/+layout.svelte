<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Mitfahrgelegenheiten</title>
  <meta
    name="description"
    content="Suche oder biete eine Mitfahrgelegenheit"
  />
</svelte:head>

{@render children()}
