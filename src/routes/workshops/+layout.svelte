<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Workshops</title>
  <meta
    name="description"
    content="Sieh dir die Tagungsworkshops an"
  />
</svelte:head>

{@render children()}
