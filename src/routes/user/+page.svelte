<script lang="ts">
  import IconButton from '@smui/icon-button';

  let { data } = $props();
  let { infosProvided, hasPaid } = $derived(data);
</script>

<div class="size-full flex justify-center items-center p-4">
  <div
    class="chad-card chad-shadow portrait:max-w-[90vw] landscape:max-w-[60vw] flex flex-col items-center gap-4"
  >
    <div
      class="chad-typography-gradient font-extrabold chad-text-subheading mb-2"
    >
      Nächste Schritte zur Anmeldung
    </div>
    {@render todo(infosProvided, 'Formular ausfüllen', '/user/info')}
    {@render todo(hasPaid, 'Tagungsbeitrag bezahlen', '/user/payments')}
  </div>
</div>

{#snippet todo(done: boolean, text: string, href: string)}
  <div class="flex items-center gap-2 w-full pl-4">
    {#if done}
      <div class="material-icons text-green-400">check_circle</div>
    {:else}
      <div class="material-icons text-red-400">cancel</div>
    {/if}
    <a
      {href}
      class="chad-text-base text-nowrap overflow-hidden text-ellipsis text-blue-500 hover:underline"
      >{text}</a
    >
    <IconButton
      class="material-icons text-gray-400"
      size="button"
      {href}
    >
      north_east
    </IconButton>
  </div>
{/snippet}
