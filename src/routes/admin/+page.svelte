<script lang="ts">
  import Button, { Icon } from '@smui/button';
  import { raiseToast, toastStore } from '$lib/toastStore';
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import LinearProgress from '@smui/linear-progress';
  import { type PaymentStatus } from '../../app.js';
  import FormField from '@smui/form-field';
  import Checkbox from '@smui/checkbox';
  import ParticipantBar from '$lib/components/ParticipantBar.svelte';

  let { data } = $props();
  let { session, supabase } = $derived(data);

  const paymentStatuses: PaymentStatus[] = [
    'CONFIRMED',
    'PENDING_APPROVAL',
    'UNPAID',
  ] as const;
  const paymentStatusDescription: Record<PaymentStatus, string> = {
    CONFIRMED: 'Angemeldet / Zahlung Bestätigt',
    PENDING_APPROVAL: 'Benutzer, die auf Zahlungsbestätigung warten',
    UNPAID: 'Benutzer, die noch nicht überwiesen haben',
  } as const;

  let excelLoading = $state(false);
  let excelPaymentStatuses = $state<PaymentStatus[]>(['CONFIRMED']);

  const fetchExcelTriggerDownload = async () => {
    const response = await fetch(
      `${PUBLIC_SUPABASE_URL}/functions/v1/create-participant-excel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify($state.snapshot(excelPaymentStatuses)),
      },
    );
    if (!response.ok) {
      const { message } = await response.json();
      toastStore.set({
        level: 'error',
        message: `${message} (${response.status})`,
      });
      return;
    }
    const blob = await response.blob();

    // download excel file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chad-tagung-teilnehmer.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
</script>

<div class="absolute w-full z-10">
  <LinearProgress
    color="secondary"
    indeterminate
    closed={!excelLoading}
  />
</div>
<div class="size-full flex justify-center p-4 landscape:p-8">
  <div class="w-full max-w-screen-lg flex flex-col items-center gap-4">
    <div class="w-full">
      <Button
        variant="raised"
        color="secondary"
        href="/admin/confirm-payment"
        style="width: 100%;"
      >
        <Icon class="material-icons">euro</Icon>Zahlung Bestätigen</Button
      >
    </div>
    <div class="w-full grid grid-cols-2 landscape:grid-cols-4 gap-4">
      <div class="w-full aspect-square chad-card chad-shadow">
        user accounts
      </div>
      <div class="w-full aspect-square chad-card chad-shadow">
        forms filled in
      </div>
      <div class="w-full aspect-square chad-card chad-shadow">
        waiting for payment
      </div>
      <div class="w-full aspect-square chad-card chad-shadow flex items-end">
        <ParticipantBar {supabase} />
      </div>
    </div>
    <div class="w-full grid grid-cols-1 landscape:grid-cols-2 gap-4">
      <div class="chad-card chad-shadow">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <span class="font-bold chad-text-lg"
              >Teilnehmerliste herunterladen</span
            >
            <span class="chad-text-base text-gray-500"
              >Welche Benutzer sollen enthalten sein?</span
            >
          </div>
          <div class="flex flex-col gap-4">
            {#each paymentStatuses as option}
              <FormField>
                <Checkbox
                  disabled={excelLoading}
                  bind:group={excelPaymentStatuses}
                  value={option}
                />
                {#snippet label()}
                  <div class="flex flex-col">
                    <span>{option}</span>
                    <span class="text-gray-500 chad-text-sm"
                      >{paymentStatusDescription[option]}</span
                    >
                  </div>
                {/snippet}
              </FormField>
            {/each}
          </div>
          <Button
            disabled={excelLoading || excelPaymentStatuses.length === 0}
            onclick={async () => {
              excelLoading = true;
              try {
                await fetchExcelTriggerDownload();
              } catch (error) {
                console.error(error);
                raiseToast({
                  level: 'error',
                  message: `Fehler beim Herunterladen der Excel-Datei!`,
                });
              }
              excelLoading = false;
            }}
            variant="raised"
            color="secondary"
          >
            <Icon class="material-icons">download</Icon>Herunterladen</Button
          >
        </div>
      </div>
    </div>
  </div>
</div>
