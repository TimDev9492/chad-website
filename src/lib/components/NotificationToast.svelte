<script lang="ts">
  import Snackbar, { Actions, Label } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';

  type Level = 'info' | 'success' | 'warning' | 'error';

  let snackbar: Snackbar;
  let level = $state<Level>('info');
  let content = $state('');

  export const raise: (level: Level, message?: string) => void = (l, c) => {
    level = l;
    if (c) content = c;
    snackbar.open();
  };
</script>

<Snackbar
  bind:this={snackbar}
  class={level}>
  <Label>{content}</Label>
  <Actions>
    <IconButton
      class="material-icons"
      title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>
