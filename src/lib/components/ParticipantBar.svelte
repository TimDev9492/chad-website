<script lang="ts">
  import { PARTICIPANT_LIMIT } from '$lib/content/constants';
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

  const getParticipantCount = async () => {
    const { count, error } = await supabase
      .from('public_participants')
      .select('public_id', { count: 'exact', head: true });
    if (error) {
      console.error('Error fetching participant count:', error);
      loadError = true;
      return -1;
    }
    return count!;
  };

  onMount(async () => {
    count = await getParticipantCount();
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
