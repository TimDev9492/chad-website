<script lang="ts">
  let { data } = $props();
  let { user, userAppData } = $derived(data);
</script>

<h1>Private page for user: {user?.email}</h1>
