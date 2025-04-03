<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Mein Account</title>
  <meta
    name="description"
    content="Verwalte deinen Account"
  />
</svelte:head>

{@render children()}
