<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import { Icon, Label } from '@smui/common';
  import type { Database } from '../../../types/database.types.js';
  import { CONTACT, PARTICIPANT_LIMIT } from '$lib/content/constants.js';
  import ParticipantBar from '$lib/components/ParticipantBar.svelte';
  import Button from '@smui/button';
  import { notifyPaymentApproval } from '$lib/utils.js';
  import { raiseToast } from '$lib/toastStore.js';
  import { openDialog } from '$lib/dialogStore.js';
  import Ripple from '@smui/ripple';

  let { data } = $props();
  let {
    userAppData,
    countries,
    price,
    checkoutLink,
    supabase,
    participantCount,
    hasPaid,
  } = $derived(data);

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
  let paymentNotified = $state(false);
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
        paymentNotified = true;
        raiseToast({
          level: 'success',
          message: 'Deine Zahlung wurde erfolgreich eingereicht!',
        });
        openDialog({
          title: '⚠️ Du bist noch nicht angemeldet!',
          content: signUpInfo,
          actions: [
            {
              label: 'OK',
            },
          ],
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

{#snippet signUpInfo()}
  <span>
    Deine Zahlung muss noch bestätigt werden. Dies kann ein paar Stunden bis
    wenige Tage dauern. Sobald du fertig angemeldet bist, erhälst du eine
    E-Mail. Bei Fragen oder Bedenken, {@render mailHelpLink('kontaktiere uns')}!
  </span>
{/snippet}

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
          Um dich für die Tagung anzumelden, musst du diesen Betrag überweisen!
        </div>
        <div
          class="chad-typography-gradient font-extrabold chad-text-giga py-4"
        >
          {priceStr}{selectedCountry
            ? `${selectedCountry.currency_symbol}`
            : currencySymbolFallback}
        </div>
        {@render userPaymentReference()}
        <button
          onclick={() => {
            openDialog({
              content: dialogContent,
              actions: [
                {
                  label: 'Weiter',
                  action: () => (window.open(checkoutLink), '_blank'),
                },
              ],
            });
          }}
          use:Ripple={{ surface: true }}
          class="mt-4 !text-black rounded-full p-8 rich-font bg-gradient-to-br from-[#FFB800] to-[#FF6A00] shadow-xl shadow-[#FF6A00]"
        >
          <div class="flex items-center gap-4 tracking-widest">
            <div class="material-icons chad-text-subheading">payments</div>
            <span class="chad-text-subheading uppercase">Bezahlen</span>
          </div>
        </button>
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
        {#if userAppData.payment_status === 'UNPAID' && !paymentNotified}
          <div class="my-4">
            <Button
              variant="raised"
              color="primary"
              disabled={approvalNotificationLoading}
              onclick={notifyApproval}
            >
              <Icon class="material-icons">credit_score</Icon>Ich habe
              überwiesen
            </Button>
          </div>
        {:else}
          <div class="flex gap-2 items-center text-green-500">
            <div class="material-icons">info</div>
            <span class="content text-center text-balance"
              >Du hast angegeben, dass du bereits überwiesen hast.
            </span>
          </div>
        {/if}
        <div class="font-thin text-sm text-gray-500 text-center">
          Die Zahlung muss von einem Mitglied aus dem Orga-Team manuell geprüft
          und bestätigt werden. Dies kann einige Studen bis wenige Tage dauern.
          Falls du Fragen hast, oder glaubst, es ist etwas schief gelaufen,
          {@render mailHelpLink('schreib uns gerne eine Mail')}!
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

{#snippet mailHelpLink(text: string)}
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
          Anmelde-Code: ${userAppData.payment_reference}`)}`}>{text}</a
  >
{/snippet}

{#snippet userPaymentReference()}
  <div class="flex flex-col items-center gap-2 chad-text-lg">
    <span>Dein Anmelde-Code:</span>
    <code class="font-bold">{userAppData.payment_reference}</code>
    <Button
      variant="raised"
      color="secondary"
      onclick={async () => {
        await navigator.clipboard.writeText(
          userAppData.payment_reference ?? 'ERROR',
        );
        raiseToast({
          level: 'info',
          message: 'Anmelde-Code kopiert!',
        });
      }}
    >
      <Icon class="material-icons">content_copy</Icon>Kopieren
    </Button>
  </div>
{/snippet}

{#snippet dialogContent()}
  <div class="flex flex-col items-center gap-4">
    <span class="chad-text-lg text-center text-balance"
      >Bei der Bezahlung musst du deinen Anmelde-Code angeben!</span
    >
    {@render userPaymentReference()}
  </div>
{/snippet}
