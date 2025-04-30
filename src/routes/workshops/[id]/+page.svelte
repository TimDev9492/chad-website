<script lang="ts">
  import { formatWorkshopStart } from '$lib/utils.js';

  let { data } = $props();
  let { workshop } = $derived(data);
</script>

<div class="size-full flex flex-col items-center p-4">
  <div class="flex flex-col max-w-2xl gap-12">
    <div
      class="chad-text-heading chad-typography-gradient font-extrabold py-8 text-balance"
    >
      {workshop.title}
    </div>
    <div
      class="landscape:grid landscape:grid-cols-3 landscape:place-items-center gap-2 portrait:flex portrait:flex-col portrait:items-center"
    >
      <img
        class="w-full aspect-video object-cover chad-shadow landscape:col-span-3"
        src={workshop.thumbnail_url}
        alt={workshop.title}
      />
      <div class="flex items-center gap-2 text-gray-400">
        <span class="material-icons">person</span>
        <span>max. {workshop.capacity} Personen</span>
      </div>

      <div class="flex items-center gap-2 text-gray-400">
        <span class="material-icons">event</span>
        <span>{formatWorkshopStart(workshop.event_start)}</span>
      </div>
      <div class="flex items-center gap-2 text-gray-400">
        <span class="material-icons">hourglass_bottom</span>
        <span>Länge: {workshop.event_duration} min</span>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <span class="chad-text-subheading font-bold">Beschreibung</span>
      <span class="chad-text-lg">
        {workshop.description}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <span class="chad-text-lg font-bold">Leitung</span>
      <span class="chad-text-base">
        Dieser Workshop wird von <strong>{workshop.leader}</strong> gehalten.
      </span>
    </div>
  </div>
</div>
