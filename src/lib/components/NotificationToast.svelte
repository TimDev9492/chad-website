<script lang="ts">
  import Snackbar, { Actions, Label } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import { toastStore, type Level } from '$lib/toastStore';

  let snackbar: Snackbar;
  let level = $state<Level>('info');
  let content = $state('');

  toastStore.subscribe((data) => {
    if (data === null) return;
    level = data.level;
    content = data.message;
    snackbar.open();
  });
</script>

<div class="z-[1000]">
  <Snackbar
    bind:this={snackbar}
    class={level}
  >
    <Label>{content}</Label>
    <Actions>
      <IconButton
        class="material-icons"
        title="Dismiss">close</IconButton
      >
    </Actions>
  </Snackbar>
</div>
