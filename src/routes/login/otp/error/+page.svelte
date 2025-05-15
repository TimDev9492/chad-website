<script>
  import IconInput from '$lib/components/IconInput.svelte';
  import { isValidEmailAddress } from '$lib/utils';
  import Button, { Icon, Label } from '@smui/button';

  let email = $state('');
  let validEmail = $derived(isValidEmailAddress(email));
</script>

<div class="size-full flex flex-col justify-center items-center gap-8">
  <div class="mdc-typography--headline4 text-center">
    Anmeldung fehlgeschlagen!
  </div>
  <form
    method="POST"
    class="flex flex-col justify-evenly items-center gap-2"
  >
    <span class="mb-8 text-center text-balance"
      >Möglicherweise ist dein Bestätigungslink nicht mehr gültig.</span
    >
    <IconInput
      iconName="email"
      text="Email"
      type="email"
      input$name="email"
      variant="outlined"
      required
      invalid={email && !validEmail}
      bind:value={email}
    ></IconInput>
    <Button
      variant="raised"
      color="primary"
      disabled={!validEmail}
    >
      <Icon class="material-icons">forward_to_inbox</Icon>
      <Label>Neuer Link</Label>
    </Button>
  </form>
  <a href="/">Zurück zum Start</a>
</div>
