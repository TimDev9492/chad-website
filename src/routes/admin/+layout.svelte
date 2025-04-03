<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Admin Panel</title>
  <meta
    name="description"
    content="Admin Control Panel"
  />
</svelte:head>

{@render children()}
