<script lang="ts">
  import Textfield from '@smui/textfield';
  import Button, { Label } from '@smui/button';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { toastStore, raiseToast } from '$lib/toastStore';

  let { form } = $props();

  console.log(form, page.status);

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

<div class="size-full flex justify-center items-center">
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
</div>
