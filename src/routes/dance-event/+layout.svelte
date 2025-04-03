<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Tanzabend</title>
  <meta
    name="description"
    content="Infos für den Tanzabend"
  />
</svelte:head>

{@render children()}
