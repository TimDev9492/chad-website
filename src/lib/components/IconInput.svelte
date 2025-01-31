<script lang="ts">
  import TextField from '@smui/textfield';
  import { Icon } from '@smui/common';

  let {
    iconName,
    text,
    value = $bindable(''),
    ...textFieldProps
  }: {
    iconName: string;
    text: string;
    value?: string;
    [key: string]: any;
  } = $props();
</script>

<div class="margins">
  <TextField
    bind:value
    {...textFieldProps}>
    {#snippet label()}
      <Icon
        class="material-icons"
        style="font-size: 1em; line-height: normal; vertical-align: top;"
        >{iconName}</Icon>
      {text}
    {/snippet}
  </TextField>
</div>
