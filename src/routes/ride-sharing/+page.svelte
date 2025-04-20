<script lang="ts">
  import RideSharingTable from '$lib/components/RideSharingTable.svelte';

  let { data } = $props();
</script>

<div class="size-full flex justify-center items-center py-4">
  <div class="max-w-screen-2xl portrait:w-[90vw] landscape:min-w-[60vw]">
    <RideSharingTable {data} />
  </div>
</div>
