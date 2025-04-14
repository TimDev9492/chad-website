<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import { Label } from '@smui/button';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Textfield from '@smui/textfield';
  import Chip, { Set, TrailingAction, Text, LeadingIcon } from '@smui/chips';
  import { DEFAULT_FOOD_PREFERENCES } from '$lib/content/constants';

  type Item = {
    label: string;
    icon: string;
  };

  let {
    selectedPreferences = $bindable(),
    disabled,
  }: {
    selectedPreferences: string[];
    disabled: boolean;
  } = $props();

  let dialogOpen = $state(false);
  // When options are objects, you need to wrap them in a $state rune, so that
  // Svelte can compare the objects properly.
  let options: Item[] = DEFAULT_FOOD_PREFERENCES;
  let newLabel = $state('');

  for (const selectedPreference of selectedPreferences) {
    if (options.findIndex((el) => el.label === selectedPreference) === -1) {
      options = [
        ...options,
        {
          label: selectedPreference,
          icon: 'local_hospital',
        },
      ];
    }
  }

  let selected: Item[] = $state(
    options.filter((option) => selectedPreferences.includes(option.label)),
  );
  let available = $derived(
    options.filter(
      (option) => selected.findIndex((el) => el.label === option.label) === -1,
    ),
  );

  $effect(() => {
    selectedPreferences = selected.map((el) => el.label);
  });

  let value: Item | undefined = $state();
  let text = $state('');

  const addObject = () => {
    if (options.findIndex((option) => option.label === newLabel) !== -1) {
      // don't add options that already exist
      dialogOpen = false;
      return;
    }
    const newObject = {
      label: newLabel,
      icon: 'local_hospital',
    };
    options = [...options, newObject];
    selected.push(newObject);
    // value = newObject;
    dialogOpen = false;
  };

  const removeSelected = (item: Item) => {
    selected = selected.filter((el) => el.label !== item.label);
  };

  const handleSelection = (event: CustomEvent<Item>) => {
    // Don't actually select the item.
    event.preventDefault();
    selected.push(event.detail);
  };
</script>

<div class="w-full flex flex-col">
  <Autocomplete
    {disabled}
    style="width: 100%;"
    textfield$style="width: 100%;"
    options={available}
    getOptionLabel={(option) => (option ? `${option.label}` : '')}
    bind:value
    bind:text
    noMatchesActionDisabled={false}
    onSMUIAutocompleteNoMatchesAction={() => {
      newLabel = text;
      dialogOpen = true;
    }}
    onSMUIAutocompleteSelected={handleSelection}
    label="Darauf achte ich"
  >
    {#snippet noMatches()}
      <Text>Hinzufügen</Text>
    {/snippet}
  </Autocomplete>
  <Set
    class={disabled ? ' opacity-50' : ''}
    style="display: inline-block;"
    key={(item) => item?.label ?? ''}
    bind:chips={selected}
  >
    {#snippet chip(item)}
      <Chip
        chip={item.label}
        onclick={() => removeSelected(item)}
      >
        <LeadingIcon class="material-icons">{item.icon}</LeadingIcon>
        <Text tabindex={selected.findIndex((opt) => opt.label === item.label)}
          >{item.label}</Text
        >
        <TrailingAction
          onclick={() => removeSelected(item)}
          icon$class="material-icons">cancel</TrailingAction
        >
      </Chip>
    {/snippet}
  </Set>
</div>

<Dialog
  class="z-[500]"
  bind:open={dialogOpen}
  aria-labelledby="autocomplete-dialog-title"
  aria-describedby="autocomplete-dialog-content"
>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title id="autocomplete-dialog-title">Ernährungsbedürfnisse</Title>
  <Content id="autocomplete-dialog-content">
    <Textfield
      bind:value={newLabel}
      label="Label"
    />
  </Content>
  <Actions>
    <Chip
      chip="cancel"
      onclick={() => (dialogOpen = false)}
    >
      <Label>Abbrechen</Label>
    </Chip>
    <Chip
      chip="add"
      onclick={addObject}
    >
      <Label>Hinzufügen</Label>
    </Chip>
  </Actions>
</Dialog>
