<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import { Text } from '@smui/list';
  import Icon from '@smui/textfield/icon';

  type StakeData = {
    id: number;
    name: string;
  };

  type Stake = StakeData & {
    wards: {
      id: number;
      name: string;
    }[]
  };

  type Ward = {
    id: number;
    name: string;
    stake: StakeData;
  }

  let {
    stakes,
    selected = $bindable(),
    disabled = false,
  }: {
    stakes: Stake[];
    selected: Ward | null;
    disabled?: boolean
  } = $props();

  // When options are objects, you need to wrap them in a $state rune, so that
  // Svelte can compare the objects properly.
  // transform stakes with wards into wards with stakedata
  const wards: Ward[] = [];
  for (const stake of stakes) {
    for (const ward of stake.wards) {
      wards.push({
        id: ward.id,
        name: ward.name,
        stake: {
          id: stake.id,
          name: stake.name,
        },
      });
    }
  }
  let options: Ward[] = $state<Ward[]>(wards);

  let value: Ward | undefined = $state();

  $effect(() => {
    selected = value ?? null;
  });
</script>

<div class="w-full grid grid-cols-1">
  <Autocomplete
    style="width: 100%"
    textfield$style="width: 100%"
    {options}
    {disabled}
    getOptionLabel={(option: Ward) => (option ? option.name : '')}
    bind:value
    label="Deine Gemeinde">
    {#snippet loading()}
      <!--
        This doesn't get used except for async loading, but I'm putting it in
        here to show you.
      -->
      <Text>Lade...</Text>
    {/snippet}
    {#snippet error()}
      <!--
        This doesn't get used except for async loading, but I'm putting it in
        here to show you.
      -->
      <Text>Fehler beim Laden der Daten</Text>
    {/snippet}
    {#snippet match(item: Ward)}
      <Icon class="material-icons">church</Icon>
      <Text>
        {item.name}
        <div class="mdc-typography--caption">Pfahl {item.stake.name}</div>
      </Text>
    {/snippet}
    {#snippet noMatches()}
      <Text>Keine Kirche gefunden!</Text>
    {/snippet}
  </Autocomplete>
</div>
