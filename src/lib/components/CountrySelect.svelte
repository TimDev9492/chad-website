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
    withPlaceholders = false,
  }: {
    countries: Country[];
    selectedCountry: Country | null;
    displayTransform: (country: Country) => string;
    classes?: string;
    label?: string;
    disabled: boolean;
    withPlaceholders?: boolean;
  } = $props();

  let countryChoices = $derived(
    countries.filter((country) => !country.is_placeholder || withPlaceholders),
  );
</script>

<Select
  {disabled}
  required
  invalid={!selectedCountry}
  key={(country: Country) => (country != null ? country.country_code : '')}
  bind:value={selectedCountry}
  {label}
  class={classes}
  variant="outlined"
>
  {#each countryChoices as country (country.iso_code)}
    <Option value={country}>{displayTransform(country)}</Option>
  {/each}
</Select>
