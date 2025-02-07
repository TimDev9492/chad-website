<script lang="ts">
  import ParticipantIcon from '$lib/components/ParticipantIcon.svelte';
  import RoundImage from '$lib/components/RoundImage.svelte';
  import Dialog, { Content } from '@smui/dialog';
  import { onMount } from 'svelte';

  let { data } = $props();
  let { supabase } = $derived(data);

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
  let closeUpSrc = $state('');

  onMount(async () => {
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
  });
</script>

<Dialog
  bind:open
  aria-labelledby="avatar closeup"
  aria-describedby="avatar closeup"
  surface$class="landscape:!max-w-[100vw] landscape:!size-[80vh] portait:!size-[90vw]"
>
  <Content>
    <RoundImage
      alt="avatar closeup"
      src={closeUpSrc}
    />
  </Content>
</Dialog>

<div class="size-full flex flex-col justify-center items-center gap-8 p-8">
  <div class="mdc-typography--headline3 text-wrap w-full text-center">
    Angemeldete Teilnehmer
  </div>
  <div
    class={`grid landscape:min-w-[800px] landscape:w-[50vw]
    landscape:grid-cols-5 portrait:w-full portrait:grid-cols-3
    items-center justify-items-center gap-4`}
  >
    {#if participants}
      {#each participants as participant}
        <div class="size-full">
          <ParticipantIcon
            {participant}
            onclick={(participant) => {
              closeUpSrc = participant.avatar_url;
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
