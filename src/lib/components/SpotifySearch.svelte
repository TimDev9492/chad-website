<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import { Text } from '@smui/list';
  import CircularProgress from '@smui/circular-progress';
  import type { SongSearchResult } from '../../app';

  let value: SongSearchResult | undefined = $state();

  const formatSecondsSmartFormat = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

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

<div class="w-full">
  <Autocomplete
    class="w-full"
    search={searchItems}
    getOptionLabel={(song: SongSearchResult | undefined) =>
      song !== undefined ? song.name : ''}
    bind:value
    showMenuWithNoInput={true}
    label="Spotify Suche"
    textfield$style="width: 100%;"
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
          {#if song.coverImageUrl.length}
            <img
              class="h-full object-contain"
              src={song.coverImageUrl}
              alt={song.name}
            />
          {:else}
            <div
              class="h-full aspect-square bg-gray-200 flex justify-center items-center"
            >
              <div class="material-icons text-gray-400">music_note</div>
            </div>
          {/if}
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
