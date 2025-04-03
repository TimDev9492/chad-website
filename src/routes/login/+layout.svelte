<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>CHAD • Login</title>
  <meta
    name="description"
    content="Melde dich mit deinem CHAD Konto an"
  />
</svelte:head>

{@render children()}
