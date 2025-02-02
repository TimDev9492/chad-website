<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import Divider from '$lib/components/Divider.svelte';
  import IconInput from '$lib/components/IconInput.svelte';
  import PageFormWrapper from '$lib/components/PageFormWrapper.svelte';
  import { isHttpSuccess, isValidEmailAddress } from '$lib/utils';
  import Button, { Icon, Label } from '@smui/button';
  import LinearProgress from '@smui/linear-progress';
  import { toastStore } from '$lib/toastStore';

  let waitingForResponse = $state(false);
  let password1 = $state('');
  let password2 = $state('');

  let validPassword = $derived(password1 && password1 === password2);
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
    <div class="mdc-typography--headline6">Password zurücksetzen</div>
    <Divider />
    <IconInput
      iconName="key"
      text="Neues Passwort"
      type="password"
      input$name="password"
      variant="outlined"
      required
      invalid={!password1}
      disabled={waitingForResponse}
      bind:value={password1}
    />
    <IconInput
      iconName="replay"
      text="Password wiederholen"
      type="password"
      variant="outlined"
      required
      invalid={!validPassword}
      disabled={waitingForResponse}
      bind:value={password2}
    />
    <span class="flex flex-col items-center">
      <Button
        variant="raised"
        color="primary"
        disabled={!validPassword || waitingForResponse}
      >
        <Icon class="material-icons">lock_reset</Icon>
        <Label>Password ändern</Label>
      </Button>
      {#if password2 && !validPassword}
        <div class="mdc-typography--caption text-red-600">
          Passwörter stimmen nicht überein!
        </div>
      {/if}
    </span>
  </form>
</PageFormWrapper>
