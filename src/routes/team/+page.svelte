<script lang="ts">
  import ParticipantIcon from '$lib/components/ParticipantIcon.svelte';
  import RoundImage from '$lib/components/RoundImage.svelte';
  import { DEFAULT_AVATAR_URL } from '$lib/content/constants';
  import { raiseToast } from '$lib/toastStore';
  import { getRegisteredParticipants } from '$lib/utils.js';
  import Button, { Icon } from '@smui/button';
  import Dialog, { Content } from '@smui/dialog';
  import { onMount } from 'svelte';
  import type { RegisteredParticipants } from '../../app.js';
  import { teamImageMentions, teamMentions } from '$lib/content/team.js';

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
    let registeredParticipants: RegisteredParticipants = [];
    try {
      registeredParticipants = await getRegisteredParticipants(supabase);
    } catch (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message: 'Fehler beim Laden der Teilnehmer!',
      });
      return;
    }
    participants = registeredParticipants.map((participant: any) => ({
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

<div class="size-full flex justify-center p-8">
  <div class="max-w-screen-lg flex flex-col items-center gap-16">
    <div
      class="chad-typography-gradient font-extrabold chad-text-heading text-wrap text-center pb-1 rich-font"
    >
      CHAD Team
    </div>
    <div class="flex flex-wrap justify-center gap-8">
      {#each teamImageMentions as teamImageMention}
        <div class="flex flex-col items-center w-32">
          <RoundImage
            src={teamImageMention.imgSrc}
            alt={teamImageMention.memberName}
          />
          <span class="chad-text-base mt-2">{teamImageMention.memberName}</span>
          <span class="text-center chad-text-sm text-gray-500"
            >{teamImageMention.category}</span
          >
        </div>
      {/each}
    </div>
    <div class="grid grid-cols-2 portrait:grid-cols-1 gap-8">
      {#each teamMentions as teamMention}
        <div>
          <span class="chad-text-base font-bold">{teamMention.category}</span>
          <ul class="list-decimal list-inside">
            {#each teamMention.members as member}
              <li class="text-gray-600">{member}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
</div>
