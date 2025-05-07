<script lang="ts">
  import { type SupabaseClient } from '@supabase/supabase-js';
  import SpotifySearch from './SpotifySearch.svelte';
  import { type SongSearchResult, type UserAppData } from '../../app';
  import {
    deleteSongSuggestion,
    getSongSuggestionsWithLikes,
    type LikedSongSuggestion,
    likeSong,
    submitSongSuggestion,
    unlikeSong,
  } from '$lib/appAdapter';
  import { raiseToast } from '$lib/toastStore';
  import { onMount } from 'svelte';
  import Ripple from '@smui/ripple';
  import LinearProgress from '@smui/linear-progress';

  let songSuggestions = $state<LikedSongSuggestion[]>([]);
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
    loading = true;
    try {
      const suggestions = await getSongSuggestionsWithLikes(supabase);
      songSuggestions = suggestions;
      loading = false;
    } catch (error) {
      console.error('Error fetching song suggestions:', error);
      loading = false;
    }
  };

  const toggleLike = async (songId: string) => {
    loading = true;

    const isLiked =
      songSuggestions.findIndex(
        (suggestion) =>
          suggestion.id === songId &&
          suggestion.song_suggestion_likes.includes(
            userAppData.public_id ?? '',
          ),
      ) !== -1;

    if (isLiked) {
      try {
        await unlikeSong(supabase, songId, userAppData.public_id!);
      } catch (error) {
        console.error('Error unliking song:', error);
      }
    } else {
      try {
        await likeSong(supabase, songId, userAppData.public_id!);
      } catch (error) {
        console.error('Error liking song:', error);
      }
    }

    await pullData();
    loading = false;
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
  {:else}
    <div></div>
  {/if}
  <div
    class="max-h-[50vh] overflow-y-scroll overflow-x-hidden chad-shadow px-4 py-2 rounded gap-x-4 gap-y-2"
  >
    <div>
      <LinearProgress
        indeterminate
        closed={!loading}
      />
    </div>
    {#each songSuggestions as suggestion}
      <div class="relative my-2">
        {@render suggestionCell(suggestion)}
        <div class="absolute -right-4 top-1/2 -translate-y-1/2 bg-white">
          {@render actionRow(
            suggestion,
            userAppData.role === 'admin' ||
              (userAppData.public_id === suggestion.submitted_by &&
                (suggestion.song_suggestion_likes.length === 0 ||
                  (suggestion.song_suggestion_likes.length === 1 &&
                    suggestion.song_suggestion_likes[0] ===
                      userAppData.public_id))),
            suggestion.song_suggestion_likes.includes(
              userAppData.public_id ?? '',
            ),
            userAppData.public_id != null,
          )}
        </div>
      </div>
    {/each}
  </div>
</div>

{#snippet suggestionCell(suggestion: LikedSongSuggestion)}
  <div class="flex justify-between h-12">
    <div class="h-full flex gap-2">
      <img
        class="h-full object-contain"
        src={suggestion.cover_image_url}
        alt={suggestion.name}
      />
      <div
        class="flex flex-col justify-evenly overflow-hidden whitespace-nowrap"
      >
        <div class="font-bold portrait:text-xs">
          {suggestion.name}
        </div>
        <div class="font-thin italic text-sm portrait:text-xs">
          {suggestion.artists.join(', ')}
        </div>
      </div>
    </div>
  </div>
{/snippet}

{#snippet actionRow(
  song: LikedSongSuggestion,
  deletable: boolean,
  liked: boolean,
  likable: boolean,
)}
  <div class="h-full flex items-center gap-2">
    <button
      use:Ripple={{ surface: true }}
      onclick={async () => {
        if (likable) await toggleLike(song.id);
      }}
      class={'flex items-center gap-1 rounded-full p-2 relative ' +
        (liked ? 'text-pink-400 bg-pink-200' : 'text-gray-300 bg-gray-100')}
    >
      <span class="chad-text-sm text-gray-500"
        >{song.song_suggestion_likes.length}</span
      >
      <span class="material-icons chad-text-base">favorite</span>
    </button>
    {#if deletable}
      <button
        use:Ripple={{ surface: true }}
        onclick={async () => {
          loading = true;
          try {
            await deleteSongSuggestion(supabase, song.id);
          } catch (error) {
            console.error('Error deleting song suggestion:', error);
            raiseToast({
              level: 'error',
              message: 'Fehler beim Löschen des Songs!',
            });
          }
          await pullData();
          loading = false;
        }}
        class="material-icons rounded-full p-2 text-red-500">delete</button
      >
    {/if}
  </div>
{/snippet}
