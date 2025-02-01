<script lang="ts">
  import IconInput from '$lib/components/IconInput.svelte';
  import Button, { Label, Icon } from '@smui/button';
  import { isHttpSuccess, isValidEmailAddress } from '$lib/utils.js';
  import { applyAction, enhance } from '$app/forms';
  import LinearProgress from '@smui/linear-progress';
  import Divider from '$lib/components/Divider.svelte';
  import { toastStore } from '$lib/toastStore';
  import PageFormWrapper from '$lib/components/PageFormWrapper.svelte';
  import HelperText from '@smui/textfield/helper-text';

  let waitingForResponse = $state(false);
  let email = $state('');
  let validEmail = $derived(isValidEmailAddress(email));
</script>

<LinearProgress
  color="secondary"
  indeterminate
  closed={!waitingForResponse}
/>
<PageFormWrapper>
  <form
    method="POST"
    class="flex flex-col justify-evenly items-center gap-4 portrait:gap-8"
    use:enhance={() => {
      waitingForResponse = true;

      return async ({ result, update }) => {
        waitingForResponse = false;
        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
        await applyAction(result);
        if (!result.status) return;
        const success: boolean = isHttpSuccess(result.status);
        if (success) update({ invalidateAll: true });
        if ((result as any).data?.message)
          toastStore.set({
            level: success ? 'success' : 'error',
            message: (result as any).data?.message,
          });
      };
    }}
  >
    <div class="mdc-typography--headline6">Anmelden</div>
    <Divider />
    <IconInput
      iconName="email"
      text="Email"
      type="email"
      input$name="email"
      variant="outlined"
      required
      invalid={email && !validEmail}
      disabled={waitingForResponse}
      bind:value={email}
    ></IconInput>
    <IconInput
      iconName="key"
      text="Password"
      type="password"
      input$name="password"
      variant="outlined"
      disabled={waitingForResponse}
      required
    >
      {#snippet helper()}
        <HelperText persistent>
          <a href="/">Passwort vergessen?</a>
        </HelperText>
      {/snippet}
    </IconInput>
    <span class="flex flex-col gap-1">
      <Button
        variant="raised"
        color="primary"
        disabled={waitingForResponse}
      >
        <Icon class="material-icons">person</Icon>
        <Label>Anmelden</Label>
      </Button>
      <a
        class="mdc-typography--caption text-center"
        href="/register">Du hast noch keinen Account?</a
      >
    </span>
  </form>
</PageFormWrapper>
