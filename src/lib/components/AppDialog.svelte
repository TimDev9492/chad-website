<script lang="ts">
  import { type DialogData, dialogStore } from '$lib/dialogStore';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';

  let open = $state(false);
  let dialogData = $state<DialogData | null>(null);

  dialogStore.subscribe((data) => {
    if (data === null) return;

    dialogData = data;
    open = true;
  });
</script>

<Dialog
  bind:open
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
  style="z-index: 500;"
>
  {#if dialogData}
    <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
    {#if dialogData?.title}
      <Title id="simple-title">{dialogData!.title}</Title>
    {/if}
    <Content id="simple-content">
      {#if typeof dialogData!.content === 'string'}
        <span>{dialogData!.content}</span>
      {:else}
        {@render dialogData!.content()}
      {/if}
    </Content>
    <Actions>
      {#if dialogData!.actions?.length}
        {#each dialogData!.actions as actionData}
          <Button onclick={async () => await actionData.action?.()}>
            <Label>{actionData.label}</Label>
          </Button>
        {/each}
      {:else}
        <Button>
          <Label>Schließen</Label>
        </Button>
      {/if}
    </Actions>
  {/if}
</Dialog>
