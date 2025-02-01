<script lang="ts">
  import Select, { Option } from '@smui/select';
  import type { Database } from '../../types/database.types';
  import Textfield from '@smui/textfield';
  import CountrySelect from './CountrySelect.svelte';

  type Country = Database['public']['Tables']['countries']['Row'];

  let {
    countries,
    selectedCountry = $bindable(),
    phoneNumber = $bindable(),
    disabled,
  }: {
    countries: Country[];
    selectedCountry: Country | null;
    phoneNumber: string | null;
    disabled: boolean;
  } = $props();

  // check if phoneNumber consists of only digits
  let validPhoneSuffix = $derived(/^\d+$/.test(phoneNumber ?? ''));
</script>

<div class="flex items-center gap-2">
  <!--
      Note: you need to provide a function as `key` that returns a unique string
      for each option.

      It *must* be a string. (Hence `${fruit ? fruit.id : ''}` in this
      example. That returns a string for the numberic `id` field and `null` and
      `undefined` values even.)
      
      If the string is empty (""), the label will stop floating when that option
      is selected and the component is unfocused. Therefore, the option for that
      value shouldn't have any text, or the floating label will overlap it.
    -->
  <CountrySelect
    {disabled}
    {countries}
    bind:selectedCountry
    label="Vorwahl"
    classes="w-[120px]"
    displayTransform={(country) =>
      `${country.flag_emoji} ${country.country_code}`}
  />
  <Textfield
    {disabled}
    required
    invalid={!validPhoneSuffix}
    bind:value={phoneNumber}
    label="Nummer"
    type="tel"
  />
</div>
