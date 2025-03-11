<script lang="ts">
  import { onMount } from 'svelte';
  import { getWorkshopsWithTimeslots } from '$lib/appAdapter';
  import { format } from 'date-fns';
  import { de, enUS } from 'date-fns/locale';
  import {
    type Workshop,
    type WorkshopParticipant,
    type WorkshopsByTime,
  } from '../../app';
  import WorkshopCard from '$lib/components/WorkshopCard.svelte';
  import List, { Graphic, Item, Text } from '@smui/list';
  import Tab, { Icon, Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import Button from '@smui/button';
  import { toastStore } from '$lib/toastStore.js';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import { useSupabaseTable } from '$lib/tableState.svelte';

  let { data } = $props();
  let { supabase, user, userAppData } = $derived(data);

  let groupedWorkshops = $state<WorkshopsByTime | null>(null);
  let activeTimeSlot = $state<string>('');
  let loadingWorkshopId = $state<string | null>(null);
  let conflictingWorkshops = $state<Workshop[] | null>(null);
  let confirmDialogOpen = $state<boolean>(false);
  const { rows: workshopParticipants } = useSupabaseTable<WorkshopParticipant>(
    // svelte-ignore state_referenced_locally
    supabase,
    'workshop_participants',
    {
      compareRecords: (a, b) =>
        a.public_id === b.public_id && a.workshop_id === b.workshop_id,
    },
  );
  let userWorkshops: string[] = $derived.by(() => {
    const userWorkshopIds = [];
    for (const workshopParticipant of workshopParticipants) {
      if (workshopParticipant.public_id === userAppData.public_id) {
        userWorkshopIds.push(workshopParticipant.workshop_id);
      }
    }
    return userWorkshopIds;
  });
  let participantModalWorkshop = $state<Workshop | null>(null);
  let participantModalOpen = $state<boolean>(false);
  let participantModalNames = $derived.by(async () => {
    if (participantModalWorkshop === null) return [];
    const { data, error } = await supabase
      .from('public_infos')
      .select('first_name, last_name')
      .in(
        'public_id',
        workshopParticipants
          .filter(
            (participation) =>
              participation.workshop_id === participantModalWorkshop!.id,
          )
          .map((participation) => participation.public_id),
      )
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true });
    if (error) {
      console.error(error);
      return [];
    }
    return data.map(
      (participant) => `${participant.first_name} ${participant.last_name}`,
    );
  });

  onMount(async () => {
    const workshops = await getWorkshopsWithTimeslots(supabase, (date) =>
      // @ts-expect-error
      format(date, 'eeee HH:mm', { locale: de }),
    );
    activeTimeSlot = Object.keys(workshops)[0];
    groupedWorkshops = workshops;
  });

  const showParticipantModal = (workshopId: string) => {
    participantModalWorkshop = groupedWorkshops![activeTimeSlot].find(
      (workshop) => workshop.id === workshopId,
    )!;
    participantModalOpen = true;
  };

  const getParticipantCount = (workshopId: string) => {
    return workshopParticipants.filter(
      (participant) => participant.workshop_id === workshopId,
    ).length;
  };

  const triggerSignUp = async (workshopId: string) => {
    loadingWorkshopId = workshopId;
    const { data, error } = await supabase.rpc('get_conflicting_workshops', {
      user_public_id: userAppData.public_id,
      new_workshop_id: workshopId,
    });
    if (error) {
      console.error(error);
      toastStore.set({
        level: 'error',
        message: 'Fehler beim Anmelden',
      });
      loadingWorkshopId = null;
      return;
    }
    if (data.length > 0) {
      conflictingWorkshops = data;
      confirmDialogOpen = true;
    } else {
      await signUpUserForWorkshop(loadingWorkshopId!);
      loadingWorkshopId = null;
    }
  };

  const triggerLeave = async (workshopId: string) => {
    loadingWorkshopId = workshopId;
    const { data, error } = await supabase
      .from('workshop_participants')
      .delete()
      .eq('public_id', userAppData.public_id)
      .eq('workshop_id', workshopId);
    if (error) {
      console.error(error);
      toastStore.set({
        level: 'error',
        message: 'Fehler beim Abmelden',
      });
      loadingWorkshopId = null;
      return;
    }
    toastStore.set({
      level: 'success',
      message: 'Erfolgreich abgemeldet',
    });
    loadingWorkshopId = null;
  };

  const confirmDialogCloseHandler = async (
    e: CustomEvent<{ action: string }>,
  ) => {
    switch (e.detail.action) {
      case 'confirm':
        await signUpUserForWorkshop(loadingWorkshopId!);
        loadingWorkshopId = null;
        break;
      case 'cancel':
      default:
        // This means the user clicked the scrim or pressed Esc/Cancel to close the dialog.
        // The actions will be "close".
        loadingWorkshopId = null;
        conflictingWorkshops = null;
        break;
    }
    confirmDialogOpen = false;
  };

  const signUpUserForWorkshop = async (workshopId: string) => {
    const { data, error } = await supabase
      .from('workshop_participants')
      .insert([
        {
          public_id: userAppData.public_id,
          workshop_id: workshopId,
        },
      ]);
    if (error) {
      console.error(error);
      toastStore.set({
        level: 'error',
        message: 'Fehler beim Anmelden',
      });
      return;
    }
    toastStore.set({
      level: 'success',
      message: 'Erfolgreich angemeldet',
    });
  };
</script>

<div class="size-full flex justify-center">
  <div
    class="grid landscape:grid-cols-[3fr_1fr] landscape:max-w-[100rem] landscape:py-16 gap-16 portrait:grid-cols-1 portrait:py-8"
  >
    <div
      class="w-full grid landscape:grid-cols-2 portrait:grid-cols-1 items-start gap-8"
    >
      {#if groupedWorkshops == null}
        <WorkshopCard workshop={null} />
        <WorkshopCard workshop={null} />
      {:else}
        {#each groupedWorkshops[activeTimeSlot] as workshop}
          <div class="relative">
            <WorkshopCard
              {workshop}
              loading={loadingWorkshopId === workshop.id}
              participants={getParticipantCount(workshop.id)}
              onParticipantsIconClick={() => {
                showParticipantModal(workshop.id);
              }}
            />
            {#if !userWorkshops.includes(workshop.id)}
              {#if getParticipantCount(workshop.id) < workshop.capacity}
                <Button
                  variant="raised"
                  color="primary"
                  class="absolute top-2 right-2 !bg-yellow-300"
                  disabled={loadingWorkshopId !== null}
                  onclick={() => triggerSignUp(workshop.id)}
                >
                  <Label>Anmelden</Label>
                  <Icon class="material-icons">person_add_alt</Icon>
                </Button>
              {:else}
                <Button
                  variant="raised"
                  color="primary"
                  class="absolute top-2 right-2 !bg-gray-200"
                  disabled
                >
                  <Label>Voll</Label>
                  <Icon class="material-icons">groups</Icon>
                </Button>
              {/if}
            {:else}
              <Button
                variant="raised"
                color="primary"
                class="absolute top-2 right-2 !bg-red-500"
                disabled={loadingWorkshopId !== null}
                onclick={() => triggerLeave(workshop.id)}
              >
                <Label>Abmelden</Label>
                <Icon class="material-icons">person_remove</Icon>
              </Button>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
    <div class="fixed right-64 portrait:hidden">
      <div class="font-thin text-gray-500">Zeit Slots</div>
      <div class="relative">
        <List>
          {#if groupedWorkshops !== null}
            {#each Object.keys(groupedWorkshops) as timeSlot}
              <Item
                activated={timeSlot === activeTimeSlot}
                onclick={() => (activeTimeSlot = timeSlot)}
              >
                <Graphic
                  class="material-icons"
                  aria-hidden="true">today</Graphic
                >
                <Text>{timeSlot}</Text>
                <div class="w-16"></div>
              </Item>
            {/each}
          {/if}
        </List>
        <div
          class="absolute border-l-2 border-orange-500 left-0 top-2 h-[calc(100%-1rem)]"
        ></div>
      </div>
    </div>
    <div
      class="landscape:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-300"
    >
      <TabBar
        tabs={Object.keys(groupedWorkshops ?? {})}
        key={(tab) => tab}
        active={activeTimeSlot}
      >
        {#snippet tab(tab)}
          <Tab
            {tab}
            onclick={() => (activeTimeSlot = tab)}
          >
            <Icon class="material-icons">today</Icon>
            <Label>{tab}</Label>
          </Tab>
        {/snippet}
      </TabBar>
    </div>
  </div>
</div>
<Dialog
  open={confirmDialogOpen}
  aria-labelledby="event-title"
  aria-describedby="event-content"
  onSMUIDialogClosed={confirmDialogCloseHandler}
>
  <Title id="event-title">⚠️ Bist du sicher?</Title>
  <Content id="event-content">
    <div>
      Wenn du dich für diesen Workshop anmeldest, wirst du von folgenden
      Workshops abgemeldet:
    </div>
    <ul class="list-disc list-inside mt-2">
      {#each conflictingWorkshops! as workshop}
        <li>{workshop.title}</li>
      {/each}
    </ul>
  </Content>
  <Actions>
    <Button action="cancel">
      <Label>Abbrechen</Label>
    </Button>
    <Button
      action="confirm"
      defaultAction
    >
      <Label>Bestätigen</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  open={participantModalOpen}
  aria-labelledby="event-title"
  aria-describedby="event-content"
  onSMUIDialogClosed={() => (participantModalOpen = false)}
>
  <Title id="event-title">Teilnehmerliste</Title>
  <Content id="event-content">
    <div>
      Diese Leute sind für den Workshop "{participantModalWorkshop?.title}"
      angemeldet:
    </div>
    <ul class="list-disc list-inside mt-2">
      {#await participantModalNames}
        <div
          class="animate-pulse bg-gray-300 h-2 rounded-full w-1/3 mt-4"
        ></div>
        <div
          class="animate-pulse bg-gray-300 h-2 rounded-full w-1/2 mt-2"
        ></div>
        <div
          class="animate-pulse bg-gray-300 h-2 rounded-full w-2/5 mt-2"
        ></div>
      {:then names}
        {#if names!.length === 0}
          <li>Keine Teilnehmer</li>
        {:else}
          {#each names! as name}
            <li>{name}</li>
          {/each}
        {/if}
      {/await}
    </ul>
  </Content>
  <Actions>
    <Button action="close">
      <Label>Schließen</Label>
    </Button>
  </Actions>
</Dialog>
