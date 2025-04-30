<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import { Text } from '@smui/list';
  import CircularProgress from '@smui/circular-progress';
  import type { SongSearchResult } from '../../app';
  import { DEFAULT_SONG_COVER_URL } from '$lib/content/constants';
  import { openDialog } from '$lib/dialogStore';
  import { formatSecondsSmartFormat } from '$lib/utils';

  let {
    onSubmit,
    pullData,
  }: {
    onSubmit?: (song: SongSearchResult) => Promise<void>;
    pullData?: () => Promise<void>;
  } = $props();

  let value: SongSearchResult | undefined = $state();
  let selectedSong: SongSearchResult | null = $state(null);

  const searchItems = async (
    input: string,
  ): Promise<false | SongSearchResult[]> => {
    if (input === '') {
      return [];
    }

    if (value != null) {
      // Return an array with just the already selected value to hide the menu.
      // As soon as the user changes the text field, the value is unselected, so
      // the search should run again.
      return [value];
    }

    // Load songs using spotify api...
    let results: SongSearchResult[] | undefined;
    try {
      const response = await fetch(
        `/api/spotify-search?limit=5&q=${encodeURIComponent(input)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search songs');
      }

      results = data.results;
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'An error occurred');
      results = [];
    }

    // Return a list of matches.
    return results!;
  };
</script>

{#snippet confirmSelectedSong()}
  {#if selectedSong !== null}
    <div class="flex gap-4 h-16">
      <img
        class="h-full chad-shadow"
        src={selectedSong.coverImageUrl.length
          ? selectedSong.coverImageUrl
          : DEFAULT_SONG_COVER_URL}
        alt={selectedSong.name}
      />
      <div class="h-full flex flex-col justify-between py-2">
        <span class="chad-text-lg font-bold">{selectedSong.name}</span>
        <div class="chad-text-sm">
          <span class="italic">{selectedSong.artists.join(', ')}</span>
          <span> • </span>
          <span>{formatSecondsSmartFormat(selectedSong.duration)}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex gap-4 h-16">
      <img
        class="h-full chad-shadow"
        src={DEFAULT_SONG_COVER_URL}
        alt="Song Cover"
      />
      <div class="h-full flex flex-col justify-between py-2">
        <span class="chad-text-lg font-bold">Kein Song ausgewählt</span>
        <div class="chad-text-sm">
          <span class="italic">Unbekannter Künstler</span>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<div class="w-full">
  <Autocomplete
    class="w-full"
    search={searchItems}
    getOptionLabel={(song: SongSearchResult | undefined) =>
      song !== undefined ? song.name : ''}
    bind:value
    selectOnExactMatch={true}
    label="Spotify Suche"
    textfield$style="width: 100%;"
    onSMUIAutocompleteSelected={(e) => {
      selectedSong = e.detail;
      openDialog({
        title: 'Ergebnis',
        content: confirmSelectedSong,
        actions: [
          {
            label: 'Abbrechen',
            action: () => (value = undefined),
          },
          {
            label: 'Einschicken',
            action: async () => {
              value = undefined;
              // Do something with the selected song.
              const songToSubmit = $state.snapshot(selectedSong);
              await onSubmit?.(songToSubmit!);
              await pullData?.();
            },
          },
        ],
      });
    }}
  >
    {#snippet loading()}
      <Text
        style="display: flex; width: 100%; justify-content: center; align-items: center;"
      >
        <CircularProgress
          style="height: 24px; width: 24px;"
          indeterminate
        />
      </Text>
    {/snippet}
    {#snippet error()}
      <!--
        This doesn't get used except for async loading, but I'm putting it in
        here to show you.
      -->
      <Text>Fehler beim Laden.</Text>
    {/snippet}
    {#snippet match(song: SongSearchResult)}
      <div class="size-full flex justify-between">
        <div class="h-full flex p-1 gap-2">
          <img
            class="h-full object-contain"
            src={song.coverImageUrl.length
              ? song.coverImageUrl
              : DEFAULT_SONG_COVER_URL}
            alt={song.name}
          />
          <div class="flex flex-col justify-evenly">
            <div class="font-bold">{song.name}</div>
            <div class="font-thin italic text-sm">
              {song.artists.join(', ')}
            </div>
          </div>
        </div>
        <div class="h-full flex items-center">
          <div class="text-sm text-gray-500">
            {formatSecondsSmartFormat(song.duration)}
          </div>
        </div>
      </div>
    {/snippet}
    {#snippet noMatches()}
      <Text>Keine Ergebnisse</Text>
    {/snippet}
  </Autocomplete>
</div>
