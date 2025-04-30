<script lang="ts">
  import { type SupabaseClient } from '@supabase/supabase-js';
  import SpotifySearch from './SpotifySearch.svelte';
  import { type SongSearchResult, type UserAppData } from '../../app';
  import {
    getSongSuggestions,
    type SongSuggestion,
    submitSongSuggestion,
  } from '$lib/appAdapter';
  import { raiseToast } from '$lib/toastStore';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import LinearProgress from '@smui/linear-progress';
  import { onMount } from 'svelte';
  import { formatSecondsSmartFormat } from '$lib/utils';
  import Ripple from '@smui/ripple';

  let songSuggestions = $state<SongSuggestion[]>([]);
  let loading = $state<boolean>(false);

  let {
    supabase,
    userAppData,
  }: {
    supabase: SupabaseClient;
    userAppData: UserAppData;
  } = $props();

  onMount(() => {
    pullData();
  });

  const pullData = async () => {
    console.log('Fetching song suggestions...');
    loading = true;
    try {
      const suggestions = await getSongSuggestions(supabase);
      songSuggestions = suggestions;
      loading = false;
    } catch (error) {
      console.error('Error fetching song suggestions:', error);
      loading = false;
    }
  };
</script>

<div class="flex flex-col gap-8">
  {#if userAppData.public_id}
    <SpotifySearch
      {pullData}
      onSubmit={async (song: SongSearchResult) => {
        try {
          await submitSongSuggestion(supabase, song, userAppData.public_id!);
          raiseToast({
            level: 'success',
            message: 'Song erfolgreich eingeschickt!',
          });
        } catch (error) {
          console.error('Error submitting song suggestion:', error);
          raiseToast({
            level: 'error',
            message: 'Fehler beim Einschicken des Songs!',
          });
        }
      }}
    />
    <div
      class="max-h-[50vh] overflow-y-scroll grid grid-cols-[1fr_auto] chad-shadow p-4 rounded gap-x-4"
    >
      {#each songSuggestions as suggestion}
        {@render suggestionCell(suggestion)}
        {@render actionRow(
          userAppData.role === 'admin' ||
            userAppData.public_id === suggestion.submitted_by,
          true,
        )}
      {/each}
    </div>
  {/if}
</div>

{#snippet suggestionCell(suggestion: SongSuggestion)}
  <div class="flex justify-between h-12 w-full">
    <div class="h-full flex p-1 gap-2">
      <img
        class="h-full object-contain"
        src={suggestion.cover_image_url}
        alt={suggestion.name}
      />
      <div
        class="flex flex-col justify-evenly overflow-hidden whitespace-nowrap"
      >
        <div class="font-bold">
          {suggestion.name}
        </div>
        <div class="font-thin italic text-sm">
          {suggestion.artists.join(', ')}
        </div>
      </div>
    </div>
    <div class="h-full flex items-center">
      <div class="text-sm text-gray-500">
        {formatSecondsSmartFormat(suggestion.duration)}
      </div>
    </div>
  </div>
{/snippet}

{#snippet actionRow(deletable: boolean, liked: boolean)}
  <div class="size-full flex items-center gap-2">
    <button
      use:Ripple={{ surface: true }}
      class={'material-icons rounded-full p-2 ' +
        (liked ? 'text-pink-300' : 'text-gray-300')}>favorite</button
    >
    {#if deletable}
      <button
        use:Ripple={{ surface: true }}
        class="material-icons rounded-full p-2 text-red-500">delete</button
      >
    {/if}
  </div>
{/snippet}
