<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Team</title>
  <meta
    name="description"
    content="Das Team hinter der CHAD Tagung."
  />
</svelte:head>

{@render children()}
