<script lang="ts">
  import Select, { Option } from '@smui/select';
  import type { Database } from '../../types/database.types';

  type Country = Database['public']['Tables']['countries']['Row'];

  let {
    countries,
    selectedCountry = $bindable(),
    displayTransform,
    classes,
    label,
    disabled,
  }: {
    countries: Country[];
    selectedCountry: Country | null;
    displayTransform: (country: Country) => string;
    classes?: string;
    label?: string;
    disabled: boolean;
  } = $props();
</script>

<Select
  {disabled}
  required
  invalid={!selectedCountry}
  key={(country: Country) => (country != null ? country.country_code : '')}
  bind:value={selectedCountry}
  {label}
  class={classes}>
  {#each countries as country (country.iso_code)}
    <Option value={country}>{displayTransform(country)}</Option>
  {/each}
</Select>
