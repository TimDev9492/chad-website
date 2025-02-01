<script lang="ts">
  import Select, { Option } from '@smui/select';
  import type { Database } from '../../types/database.types';

  type Country = Database['public']['Tables']['countries']['Row'];

  let { countries, selectedCountry = $bindable(), displayTransform, classes, label }: {
    countries: Country[];
    selectedCountry: Country | null;
    displayTransform: (country: Country) => string;
    classes?: string;
    label?: string;
  } = $props();
</script>

<Select
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
