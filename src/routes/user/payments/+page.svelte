<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import { Label } from '@smui/common';
  import type { Database } from '../../../types/database.types.js';
  import { onMount } from 'svelte';

  let { data } = $props();
  let { userAppData, countries } = $derived(data);

  let selectedCountry = $state<
    Database['public']['Tables']['countries']['Row'] | null
  >(
    // svelte-ignore state_referenced_locally
    countries.find(
      (country) =>
        country.iso_code === userAppData.residential_address.country_iso,
    ) || null,
  );
</script>

<div class="size-full flex justify-center items-center">
  <div
    class="landscape:w-[60vw] portrait:w-[90vw] flex flex-col gap-4 items-center chad-card chad-shadow"
  >
    <div class="chad-typography-gradient font-extrabold text-3xl">
      Bezahlung
    </div>
    <div class="font-medium text-base text-center">
      Um dich für die Tagung anzumelden, musst du folgenden Betrag auf das
      angegebene Konto überweisen!
    </div>
    <div class="chad-typography-gradient font-extrabold text-8xl py-4">
      {selectedCountry ? selectedCountry.price_tag : '60,00€'}
    </div>
    <!-- ₣ -->
    <div class="text-xl font-bold">Kontoverbindung:</div>
    <div
      class="chad-card bg-gradient-to-br from-[#FFB800] to-[#FF6A00] shadow-xl shadow-[#FF6A00]"
    >
      <div
        class="landscape:grid landscape:grid-cols-[auto_1fr] landscape:gap-x-8 landscape:items-center portrait:flex portrait:flex-col"
      >
        <div class="font-bold text-xl">Kontoinhaber:</div>
        <code class="font-medium text-base portrait:mb-2">Chad e.V.</code>
        <div class="font-bold text-xl">IBAN:</div>
        <code class="font-medium text-base portrait:mb-2"
          >DE12345678901234567890</code
        >
        <div class="font-bold text-xl">BIC:</div>
        <code class="font-medium text-base portrait:mb-2">DEUTDEDBXXX</code>
        <div class="font-bold text-xl">Verwendungszweck:</div>
        <code class="font-medium text-base"
          >{userAppData.payment_reference} - {userAppData.first_name}
          {userAppData.last_name}</code
        >
      </div>
    </div>
    {#if countries.length && selectedCountry}
      <SegmentedButton
        class="mt-8"
        segments={countries}
        singleSelect
        bind:selected={selectedCountry}
        key={(segment) => segment.iso_code}
      >
        {#snippet segment(segment)}
          <Segment {segment}>
            <Label>{segment.flag_emoji} {segment.iso_code}</Label>
          </Segment>
        {/snippet}
      </SegmentedButton>
    {/if}
  </div>
</div>
