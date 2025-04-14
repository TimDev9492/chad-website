<script lang="ts">
  import ParticipantIcon from '$lib/components/ParticipantIcon.svelte';
  import RoundImage from '$lib/components/RoundImage.svelte';
  import { DEFAULT_AVATAR_URL } from '$lib/content/constants';
  import { raiseToast } from '$lib/toastStore';
  import Button, { Icon } from '@smui/button';
  import Dialog, { Content } from '@smui/dialog';
  import { onMount } from 'svelte';

  let { data } = $props();
  let { supabase, userAppData } = $derived(data);

  type ParticipantData = {
    public_id: string;
    first_name: string;
    last_name: string;
    stake_name: string;
    ward_name: string;
    avatar_url: string;
  };

  let participants = $state<ParticipantData[] | null>(null);
  let open = $state(false);
  let dialogParticipant = $state<ParticipantData>({
    public_id: '',
    first_name: '',
    last_name: '',
    stake_name: '',
    ward_name: '',
    avatar_url: '',
  });

  const deleteProfilePicture = async (public_id: string) => {
    const { data, error } = await supabase
      .from('public_infos')
      .update({ avatar_url: DEFAULT_AVATAR_URL })
      .eq('public_id', public_id)
      .select();
    console.log({ data, error });
    if (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message: 'Fehler beim Löschen des Profilbildes',
      });
    } else if (data !== null && data.length === 0) {
      console.error('RLS prevents the row from being updated.');
      raiseToast({
        level: 'error',
        message: 'Fehler beim Löschen des Profilbildes',
      });
    } else {
      await pullData();
      open = false;
      raiseToast({
        level: 'success',
        message: 'Profilbild erfolgreich gelöscht',
      });
    }
  };

  const pullData = async () => {
    const { data, error } = await supabase
      .from('public_participants')
      .select('*');
    if (error) {
      console.error(error);
      return;
    }
    participants = data.map((participant) => ({
      public_id: participant.public_id,
      first_name: participant.first_name,
      last_name: participant.last_name,
      stake_name: participant.stake_name,
      ward_name: participant.ward_name,
      avatar_url: participant.avatar_url,
    }));
    if (participants.length < 5) {
      participants = participants.concat(
        Array(5 - participants.length).fill(null),
      );
    }
  };

  onMount(async () => {
    await pullData();
  });
</script>

<Dialog
  class="z-[500]"
  bind:open
  aria-labelledby="avatar closeup"
  aria-describedby="avatar closeup"
  surface$class="landscape:!max-h-[90vh] landscape:!w-[80vh] portait:!w-[90vw]"
>
  <Content>
    {#if userAppData.role === 'admin'}
      <div class="w-full flex justify-center mb-2">
        <Button
          variant="outlined"
          style="color: red;"
          href="/participants"
          onclick={() => deleteProfilePicture(dialogParticipant.public_id)}
        >
          <Icon class="material-icons">delete</Icon>Profilbild löschen</Button
        >
      </div>
    {/if}
    <div class="w-full aspect-square flex flex-grow">
      <RoundImage
        alt="avatar closeup"
        src={dialogParticipant.avatar_url}
      />
    </div>
    <div
      class="flex portrait:flex-col items-center gap-4 pt-4 landscape:flex-row landscape:justify-between"
    >
      <div class="flex flex-col portrait:text-center">
        <span class="font-bold chad-text-lg">Name</span>
        <span class="chad-text-base"
          >{dialogParticipant.first_name} {dialogParticipant.last_name}</span
        >
      </div>
      <div class="flex flex-col portrait:text-center">
        <span class="font-bold chad-text-lg">Gemeinde</span>
        <span class="chad-text-base">{dialogParticipant.ward_name}</span>
      </div>
      <div class="flex flex-col portrait:text-center">
        <span class="font-bold chad-text-lg">Pfahl</span>
        <span class="chad-text-base">{dialogParticipant.stake_name}</span>
      </div>
    </div>
  </Content>
</Dialog>

<div class="size-full flex flex-col justify-center items-center gap-8 p-8">
  <div
    class="chad-typography-gradient font-extrabold chad-text-heading text-wrap text-center pb-1"
  >
    Angemeldete Teilnehmer
  </div>
  <div
    class="grid landscape:min-w-[800px] landscape:w-[50vw]
    landscape:grid-cols-5 portrait:w-full portrait:grid-cols-3
    items-center justify-items-center gap-4"
  >
    {#if participants}
      {#each participants as participant}
        <div class="size-full">
          <ParticipantIcon
            {participant}
            onclick={(participant) => {
              dialogParticipant = participant;
              open = true;
            }}
          />
        </div>
      {/each}
    {:else}
      {#each { length: 5 }}
        <ParticipantIcon participant={null} />
      {/each}
    {/if}
  </div>
</div>
