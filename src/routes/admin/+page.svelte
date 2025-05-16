<script lang="ts">
  import Button, { Icon } from '@smui/button';
  import { raiseToast, toastStore } from '$lib/toastStore';
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import LinearProgress from '@smui/linear-progress';
  import { type PaymentStatus } from '../../app.js';
  import FormField from '@smui/form-field';
  import Checkbox from '@smui/checkbox';
  import { getRegisteredParticipants } from '$lib/utils.js';
  import { PARTICIPANT_LIMIT } from '$lib/content/constants.js';

  let { data } = $props();
  let { session, supabase } = $derived(data);

  const paymentStatuses: PaymentStatus[] = [
    'CONFIRMED',
    'PENDING_APPROVAL',
    'UNPAID',
  ] as const;
  const paymentStatusDescription: Record<PaymentStatus, string> = {
    CONFIRMED: 'Angemeldet / Zahlung bestätigt',
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

  const getWebsiteAccountCount = async () => {
    const { count, error } = await supabase
      .from('public_infos')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { count } as { count: number };
  };

  const getFormsFilledCount = async () => {
    const { data: count, error } = await supabase.rpc('get_forms_filled_count');
    if (error) throw error;
    const { count: total, error: publicInfosError } = await supabase
      .from('public_infos')
      .select('*', { count: 'exact', head: true });
    if (publicInfosError) throw error;
    return { count, total };
  };

  const getWaitingForPaymentCount = async () => {
    const { data, error } = await supabase.rpc('get_payment_status_count', {
      requested_status: 'PENDING_APPROVAL',
    });
    if (error) throw error;
    return { count: data };
  };

  const getParticipantCount = async () => {
    const registered = await getRegisteredParticipants(supabase, {
      throwOnError: true,
    });
    return { count: registered.length, total: PARTICIPANT_LIMIT };
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
      {@render countCard(
        'account_circle',
        'Website Accounts',
        getWebsiteAccountCount,
      )}
      {@render countCard(
        'assignment',
        'Formulare ausgefüllt',
        getFormsFilledCount,
      )}
      {@render countCard(
        'pending_actions',
        'Unbestätigte Zahlungen',
        getWaitingForPaymentCount,
      )}
      {@render countCard(
        'contact_emergency',
        'Angemeldete Teilnehmer',
        getParticipantCount,
      )}
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

{#snippet countCard(
  icon: string,
  title: string,
  countFunc: () => Promise<{ count: number; total?: number }>,
)}
  <div
    class="w-full aspect-square chad-card chad-shadow flex flex-col justify-between overflow-hidden"
  >
    <div class="material-icons chad-text-heading text-gray-500">
      {icon}
    </div>
    <div class="flex flex-col gap-2 portrait:items-end">
      <div class="chad-text-subheading">
        {#await countFunc()}
          <span>...</span>
        {:then { count, total }}
          <div class="flex items-end gap-1">
            <span>{count}</span>
            {#if total}
              <span class="chad-text-base text-gray-400 pb-[0.1em]"
                >/{total}</span
              >
            {/if}
          </div>
        {:catch error}
          <span class="text-red-500">Fehler</span>
        {/await}
      </div>
      <span
        class="chad-text-base text-gray-500 text-balance portrait:text-right"
        >{title}</span
      >
    </div>
  </div>
{/snippet}
