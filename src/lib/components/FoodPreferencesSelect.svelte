<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import Button, { Label } from '@smui/button';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Textfield from '@smui/textfield';
  import Chip, { Set, TrailingAction, Text, LeadingIcon } from '@smui/chips';

  type Item = {
    id: number;
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
  let options: Item[] = $state([
    {
      id: 0,
      label: 'Vegan',
      icon: 'compost',
    },
    {
      id: 1,
      label: 'Vegetarisch',
      icon: 'compost',
    },
    {
      id: 2,
      label: 'Glutenfrei',
      icon: 'grain',
    },
    {
      id: 3,
      label: 'Laktosefrei',
      icon: 'local_drink',
    },
    {
      id: 4,
      label: 'Nussallergie',
      icon: 'no_meals',
    },
  ]);
  let newLabel = $state('');

  for (const selectedPreference of selectedPreferences) {
    if (options.findIndex((el) => el.label === selectedPreference) === -1) {
      options = [
        ...options,
        {
          id: options[options.length - 1].id + 1,
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
      (option) => selected.findIndex((el) => el.id === option.id) === -1,
    ),
  );

  $effect(() => {
    selectedPreferences = selected.map((el) => el.label);
  });

  let value: Item | undefined = $state();
  let text = $state('');

  const addObject = () => {
    const newObject = {
      id: options[options.length - 1].id + 1,
      label: newLabel,
      icon: 'local_hospital',
    };
    options = [...options, newObject];
    selected.push(newObject);
    // value = newObject;
    dialogOpen = false;
  };

  const handleSelection = (event: CustomEvent<Item>) => {
    // Don't actually select the item.
    event.preventDefault();
    selected.push(event.detail);
  };
</script>

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
  label="Darauf achte ich">
  {#snippet noMatches()}
    <Text>Hinzufügen</Text>
  {/snippet}
</Autocomplete>

<Set
  class={'absolute translate-y-14' + (disabled ? ' opacity-50' : '')}
  style="display: inline-block;"
  key={(item) => (item && item?.id ? item.id.toString() : '')}
  bind:chips={selected}>
  {#snippet chip(item)}
    <Chip
      chip={item.id}
      onclick={() => (selected = selected.filter((el) => el.id !== item.id))}>
      <LeadingIcon class="material-icons">{item.icon}</LeadingIcon>
      <Text tabindex={item.id}>{item.label}</Text>
      <TrailingAction icon$class="material-icons">cancel</TrailingAction>
    </Chip>
  {/snippet}
</Set>

<Dialog
  bind:open={dialogOpen}
  aria-labelledby="autocomplete-dialog-title"
  aria-describedby="autocomplete-dialog-content">
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title id="autocomplete-dialog-title">Ernährungsbedürfnisse</Title>
  <Content id="autocomplete-dialog-content">
    <Textfield
      bind:value={newLabel}
      label="Label" />
  </Content>
  <Actions>
    <Chip
      chip="cancel"
      onclick={() => (dialogOpen = false)}>
      <Label>Abbrechen</Label>
    </Chip>
    <Chip
      chip="add"
      onclick={addObject}>
      <Label>Hinzufügen</Label>
    </Chip>
  </Actions>
</Dialog>
