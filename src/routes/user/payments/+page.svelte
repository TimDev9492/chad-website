<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import { Icon, Label } from '@smui/common';
  import type { Database } from '../../../types/database.types.js';
  import {
    BANK_ACCOUNT_DETAILS,
    CONTACT,
    PARTICIPANT_LIMIT,
  } from '$lib/content/constants.js';
  import ParticipantBar from '$lib/components/ParticipantBar.svelte';
  import Button from '@smui/button';
  import { notifyPaymentApproval } from '$lib/utils.js';
  import { raiseToast } from '$lib/toastStore.js';

  let { data } = $props();
  let { userAppData, countries, price, supabase, participantCount, hasPaid } =
    $derived(data);

  let selectedCountry = $state<
    Database['public']['Tables']['countries']['Row'] | null
  >(
    // svelte-ignore state_referenced_locally
    countries.find(
      (country) =>
        country.iso_code === userAppData.residential_address.country_iso,
    ) || null,
  );
  let priceStr = $derived(
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );

  let approvalNotificationLoading = $state(false);
  const notifyApproval = async () => {
    approvalNotificationLoading = true;
    try {
      const updatedPaymentInfos = await notifyPaymentApproval(supabase);
      if (updatedPaymentInfos.length === 0) {
        raiseToast({
          level: 'info',
          message: 'Deine Zahlung wurde bereits eingereicht.',
        });
      } else {
        raiseToast({
          level: 'success',
          message:
            'Deine Zahlung wurde erfolgreich eingereicht! Innerhalb der nächsten 24 Stunden solltest du angemeldet sein.',
        });
      }
    } catch (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message:
          'Es ist ein Fehler aufgetreten! Bitte versuche es später noch einmal.',
      });
    }
    approvalNotificationLoading = false;
  };

  const currencySymbolFallback = '€';
</script>

<div class="size-full flex justify-center p-4">
  <div class="size-full max-w-screen-lg flex flex-col gap-4 justify-center">
    <div
      class=" portrait:w-[90vw] flex flex-col gap-4 items-center chad-card chad-shadow"
    >
      <div
        class="chad-typography-gradient font-extrabold chad-text-heading pb-2"
      >
        Bezahlung
      </div>

      {#if participantCount === -1}
        <div
          class="grid grid-cols-[auto_1fr] gap-8 landscape:max-w-[40vw] items-center"
        >
          <div class="material-icons text-yellow-400 text-8xl">warning</div>
          <div class="chad-text-base font-medium">
            Es ist unerwarteter Fehler aufgetreten! Du kannst probieren, die
            Seite neu zu laden. Falls das nicht hilft, schreib uns eine <a
              class="text-blue-400"
              href="chad-website@timdev.de">E-Mail</a
            >
            und wir beheben das Problem.
          </div>
        </div>
      {:else if participantCount >= PARTICIPANT_LIMIT}
        <div
          class="grid grid-cols-[auto_1fr] gap-8 landscape:max-w-[40vw] items-center"
        >
          <div class="material-icons text-blue-200 text-8xl">groups</div>
          <div class="chad-text-base font-medium">
            Leider sind keine Plätze mehr frei! Vielleicht melden sich noch ein
            paar Leute ab, dann kannst du dich wieder anmelden. Schau einfach
            regelmäßig hier vorbei! Viel Erfolg!
          </div>
        </div>
        <ParticipantBar {supabase} />
      {:else if !hasPaid}
        <div class="font-medium chad-text-base text-center">
          Um dich für die Tagung anzumelden, musst du folgenden Betrag auf das
          angegebene Konto überweisen!
        </div>
        <div
          class="chad-typography-gradient font-extrabold chad-text-giga py-4"
        >
          {priceStr}{selectedCountry
            ? `${selectedCountry.currency_symbol}`
            : currencySymbolFallback}
        </div>
        <div class="chad-text-lg font-bold">Kontoverbindung:</div>
        <div
          class="chad-card bg-gradient-to-br from-[#FFB800] to-[#FF6A00] shadow-xl shadow-[#FF6A00] portrait:min-w-[80%]"
        >
          <div
            class="landscape:grid landscape:grid-cols-[auto_1fr] landscape:gap-x-8 landscape:items-center portrait:flex portrait:flex-col"
          >
            <div class="font-bold chad-text-lg">Kontoinhaber:</div>
            <code class="font-medium chad-text-base portrait:mb-2"
              >{BANK_ACCOUNT_DETAILS.ACCOUNT_HOLDER}</code
            >
            <div class="font-bold chad-text-lg">IBAN:</div>
            <code class="font-medium chad-text-base portrait:mb-2"
              >{BANK_ACCOUNT_DETAILS.IBAN}</code
            >
            <div class="font-bold chad-text-lg">BIC:</div>
            <code class="font-medium chad-text-base portrait:mb-2"
              >{BANK_ACCOUNT_DETAILS.BIC}</code
            >
            <div class="font-bold chad-text-lg">Verwendungszweck:</div>
            <code class="font-medium chad-text-base"
              >{userAppData.payment_reference} - {userAppData.first_name}
              {userAppData.last_name}</code
            >
          </div>
        </div>
        {#if countries.length && selectedCountry}
          <SegmentedButton
            class="mt-8"
            segments={countries.filter((country) => !country.is_placeholder)}
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
        {#if userAppData.payment_status === 'UNPAID'}
          <div class="my-4">
            <Button
              variant="raised"
              color="primary"
              disabled={approvalNotificationLoading}
              onclick={notifyApproval}
            >
              <Icon class="material-icons">payments</Icon>Ich habe überwiesen
            </Button>
          </div>
        {:else}
          <div class="flex gap-2 items-center text-green-500">
            <div class="material-icons">info</div>
            <span class="text-balance content"
              >Du hast angegeben, dass du bereits überwiesen hast.
            </span>
          </div>
        {/if}
        <div class="font-thin text-sm text-gray-500 text-center">
          Die Zahlung muss von einem Mitglied aus dem Orga-Team manuell geprüft
          und bestätigt werden. Dies kann einige Studen bis wenige Tage dauern.
          Falls du Fragen hast, oder glaubst, es ist etwas schief gelaufen,
          <a
            class="text-blue-400"
            href={`mailto:${CONTACT.EMAIL}\n` +
              `?subject=${encodeURIComponent(`Problem mit Bezahlung ${userAppData.payment_reference}`)}\n` +
              `&body=${encodeURIComponent(`Hallo Chad-Team,

          ich habe folgendes Problem mit meiner Bezahlung:
          
          --- PROBLEM BESCHREIBEN ---
          
          Hier sind meine Daten:

          Vorname: ${userAppData.first_name}
          Nachname: ${userAppData.last_name}
          E-Mail: ${userAppData.email}
          Telefonnummer: ${userAppData.phone_number}
          Zahlungsreferenz: ${userAppData.payment_reference}`)}`}
            >schreib uns gerne eine Mail</a
          >!
        </div>
        <ParticipantBar {supabase} />
      {:else}
        <div
          class="grid grid-cols-[auto_1fr] gap-8 landscape:max-w-[40vw] items-center"
        >
          <div class="material-icons text-green-400 text-8xl">check_circle</div>
          <div class="chad-text-base font-medium">
            Deine Bezahlung wurde bereits bestätigt, damit bist du offiziell für
            die Tagung angemeldet!
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
