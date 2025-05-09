<script lang="ts">
  import { format } from 'date-fns';
  import type { Workshop } from '../../app';
  import Chip, { LeadingIcon, Text } from '@smui/chips';
  import LinearProgress from '@smui/linear-progress';
  import { formatWorkshopStart } from '$lib/utils';

  let {
    workshop,
    disabled = false,
    loading = false,
    participants = 0,
    onParticipantsIconClick,
  }: {
    workshop: Workshop | null;
    disabled?: boolean;
    loading?: boolean;
    participants?: number;
    onParticipantsIconClick?: () => void;
  } = $props();
</script>

<div class="chad-shadow rounded-[1em] min-w-64 w-full">
  {#if workshop == null}
    <div class="rounded-[1em] animate-pulse bg-gray-300 overflow-hidden w-full">
      <div
        class="w-full aspect-video flex justify-center items-center bg-gray-200"
      >
        <svg
          class="w-10 h-10 text-gray-200 dark:text-gray-600"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path
            d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"
          />
        </svg>
      </div>

      <div class="flex flex-col p-4">
        <div class="h-3 bg-gray-400 rounded-full w-3/4 mb-6"></div>
        <div class="h-2 bg-gray-400 rounded-full w-1/3 mb-6"></div>
        <div class="h-2.5 bg-gray-400 rounded-full w-full mb-3"></div>
        <div class="h-2.5 bg-gray-400 rounded-full w-full mb-3"></div>
        <div class="h-2.5 bg-gray-400 rounded-full w-3/5 mb-6"></div>
        <div class="flex gap-2">
          <div class="h-8 bg-gray-400 rounded-full w-48"></div>
          <div class="h-8 bg-gray-400 rounded-full w-24"></div>
          <div class="h-8 bg-gray-400 rounded-full w-24"></div>
        </div>
      </div>
    </div>
  {:else}
    <div
      class="relative rounded-[1em] overflow-hidden bg-[#f7dadf] bg-opacity-75 w-full"
    >
      <div class="relative">
        <img
          src={workshop.thumbnail_url}
          alt="workshop thumbnail"
          class="w-full aspect-video object-cover"
        />
        <div class="absolute bottom-0 left-0 w-full">
          <LinearProgress
            closed={!loading}
            indeterminate
          />
        </div>
      </div>
      <div class="flex flex-col p-4 gap-4">
        <div class="font-bold chad-text-lg">{workshop.title}</div>
        <div class="font-normal chad-text-base">
          <LeadingIcon class="material-icons mr-2">school</LeadingIcon>
          <span>Leitung: {workshop.leader}</span>
        </div>
        <div class="text-gray-500 font-light line-clamp-3 chad-text-base">
          {workshop.description}
        </div>
        <div class="[&>*]:bg-[#6198e7] [&>*]:bg-opacity-50 [&>*]:mt-1 z-10">
          <Chip chip="eventStartChip">
            <LeadingIcon class="material-icons">event</LeadingIcon>
            <Text>{formatWorkshopStart(workshop.event_start)}</Text>
          </Chip>
          <Chip chip="eventDurationChip">
            <LeadingIcon class="material-icons">hourglass_bottom</LeadingIcon>
            <Text>{workshop.event_duration} min</Text>
          </Chip>
          <Chip
            chip="participantsChip"
            onclick={() => {
              onParticipantsIconClick && onParticipantsIconClick();
            }}
          >
            <LeadingIcon class="material-icons">person</LeadingIcon>
            <Text>{participants}/{workshop.capacity}</Text>
          </Chip>
        </div>
      </div>
    </div>
  {/if}
  {#if disabled}
    <div
      class="absolute top-0 left-0 size-full bg-gray-500 opacity-50 rounded-[1em]"
    ></div>
  {/if}
</div>
