<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Bezahlen</title>
  <meta
    name="description"
    content="Überweise deinen Tagungsbeitrag"
  />
</svelte:head>

{@render children()}
