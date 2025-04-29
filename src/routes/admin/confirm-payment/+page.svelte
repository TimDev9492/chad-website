<script lang="ts">
  import Textfield from '@smui/textfield';
  import Button, { Label } from '@smui/button';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { toastStore } from '$lib/toastStore';
  import Ripple from '@smui/ripple';

  let { form } = $props();

  let clipboardMeta = $state<{
    content: string | null;
    timeoutId: NodeJS.Timeout | null;
  }>({
    content: null,
    timeoutId: null,
  });

  const registerClipboard = (value: string) => {
    if (clipboardMeta.timeoutId) {
      clearTimeout(clipboardMeta.timeoutId);
    }
    clipboardMeta = {
      content: value,
      timeoutId: setTimeout(() => {
        clipboardMeta = {
          content: null,
          timeoutId: null,
        };
      }, 3000),
    };
  };

  onMount(() => {
    if (form && form.message) {
      setTimeout(() => {
        toastStore.set({
          level: page.status === 200 ? 'success' : 'error',
          message: form.message,
        });
      }, 200);
    }
  });
</script>

<div class="size-full flex flex-col justify-center items-center gap-4 p-4">
  <form
    method="POST"
    class="chad-card chad-shadow flex flex-col items-center gap-4"
  >
    <div class="text-2xl font-medium">Verwendungszweck</div>
    <Textfield
      input$name="payment_reference"
      type="number"
      value=""
      label="Code"
      variant="outlined"
      required
    />
    <Button
      color="secondary"
      variant="raised"
    >
      <Label>Zahlung bestätigen</Label>
    </Button>
  </form>
  {#if form?.confirmedUserData}
    <div
      class="chad-card chad-shadow flex flex-col items-center gap-2 chad-text-base"
    >
      <span class="text-2xl pb-4">Angemeldeter Nutzer:</span>
      <div class="w-full grid landscape:grid-cols-2 portrait:gird-cols-1">
        {@render valueRow(
          'Name',
          `${form.confirmedUserData.firstName} ${form.confirmedUserData.lastName}`,
          false,
        )}
        {@render valueRow('E-Mail', form.confirmedUserData.email, true)}
        {@render valueRow('Telefonnummer', form.confirmedUserData.phone, true)}
        {@render valueRow(
          'Code',
          form.confirmedUserData.paymentReference,
          false,
        )}
      </div>
    </div>
  {/if}
</div>

{#snippet valueRow(key: string, value: string, clipboard: boolean)}
  <span class="text-gray-500">{key}</span>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    use:Ripple={{ surface: clipboard }}
    onclick={async () => {
      if (!clipboard) return;
      try {
        await navigator.clipboard.writeText(value);
        registerClipboard(value);
      } catch (error) {
        console.error(error);
      }
    }}
    class={'w-full flex justify-between gap-2 items-center text-gray-700 rounded-full landscape:px-2 portrait:mb-2' +
      (clipboard ? ' cursor-pointer' : '')}
  >
    <code>{value}</code>
    {#if clipboard}
      <div class="material-icons text-gray-400 chad-text-base text-center">
        {clipboardMeta.content === value ? 'check' : 'content_copy'}
      </div>
    {/if}
  </div>
{/snippet}
