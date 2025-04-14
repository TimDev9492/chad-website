<script lang="ts">
  import { PARTICIPANT_LIMIT } from '$lib/content/constants';
  import { getRegisteredParticipants } from '$lib/utils';
  import LinearProgress from '@smui/linear-progress';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { onMount } from 'svelte';

  let {
    supabase,
  }: {
    supabase: SupabaseClient;
  } = $props();

  let loading = $state(true);
  let loadError = $state(false);
  let count = $state(0);
  let progress = $derived(count / PARTICIPANT_LIMIT);

  onMount(async () => {
    let participants;
    try {
      participants = await getRegisteredParticipants(supabase);
    } catch (error) {
      console.error(error);
      loadError = true;
      loading = false;
      return;
    }
    count = participants.length;
    loading = false;
  });
</script>

<div class="w-full flex flex-col gap-1">
  {#if !loadError}
    <div class="w-full flex justify-between chad-text-sm text-gray-500">
      <div>Angemeldete Teilnehmer</div>
      <div>
        <span class="text-black chad-text-base">{loading ? '...' : count}</span
        >/{PARTICIPANT_LIMIT}
        <span class="text-gray-400">({PARTICIPANT_LIMIT - count} frei)</span>
      </div>
    </div>
    <div class="w-full">
      <LinearProgress
        indeterminate={loading}
        {progress}
      />
    </div>
  {:else}
    <div class="flex items-center gap-2 text-red-500 chad-text-sm">
      <div class="material-icons chad-text-base">warning</div>
      <span>Teilnehmerzahl konnte nicht geladen werden</span>
    </div>
  {/if}
</div>
