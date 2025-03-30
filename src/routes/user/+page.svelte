<script lang="ts">
  import IconButton, { Icon } from '@smui/icon-button';
  import { phone } from 'phone';

  let { data } = $props();
  let { user, userAppData } = $derived(data);
</script>

<div class="size-full flex justify-center items-center">
  <div
    class="chad-card chad-shadow portrait:max-w-[90vw] landscape:max-w-[60vw] flex flex-col items-center gap-4"
  >
    <div class="chad-typography-gradient font-extrabold text-2xl mb-2">
      Nächste Schritte zur Anmeldung
    </div>
    {@render todo(
      phone(userAppData.phone_number ?? '').isValid,
      'Formular ausfüllen',
      '/user/info',
    )}
    {@render todo(
      userAppData.has_paid ?? false,
      'Tagungsbeitrag bezahlen',
      '/user/payments',
    )}
  </div>
</div>

{#snippet todo(done: boolean, text: string, href: string)}
  <div class="flex items-center gap-2 w-full pl-4">
    {#if done}
      <div class="material-icons text-green-400">check_circle</div>
    {:else}
      <div class="material-icons text-red-400">cancel</div>
    {/if}
    <span class="font-thin text-base">{text}</span>
    <IconButton
      class="material-icons text-gray-400"
      size="button"
      {href}
    >
      north_east
    </IconButton>
  </div>
{/snippet}
