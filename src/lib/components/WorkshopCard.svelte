<script lang="ts">
  import { format } from 'date-fns';
  import type { Workshop } from '../../app';
  import Chip, { LeadingIcon, Text } from '@smui/chips';
  import { de } from 'date-fns/locale';
  import Button, { Icon, Label } from '@smui/button';

  let { workshop }: { workshop: Workshop | null } = $props();
</script>

{#if workshop == null}
  <div
    class="rounded animate-pulse portrait:w-[90vw] landscape:w-[30rem] min-h-[15rem] bg-gray-300 overflow-hidden"
  >
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
    class="relative rounded overflow-hidden bg-[#f7dadf] bg-opacity-75 portrait:w-[90vw] landscape:w-[30rem] min-h-[15rem]"
  >
    <img
      src={workshop.thumbnail_url}
      alt="workshop thumbnail"
      class="w-full aspect-video object-cover"
    />
    <Button
      variant="raised"
      color="primary"
      class="absolute top-2 right-2 !bg-green-500"
    >
      <Label>Anmelden</Label>
      <Icon class="material-icons">person_add_alt</Icon>
    </Button>
    <div class="flex flex-col p-4 gap-4">
      <div class="font-bold text-xl">{workshop.title}</div>
      <div class="font-normal">
        <LeadingIcon class="material-icons mr-2">school</LeadingIcon>
        Leitung: Elon Musk
      </div>
      <div class="text-gray-500 font-light line-clamp-3">
        {workshop.description}
      </div>
      <div class="[&>*]:bg-[#6198e7] [&>*]:bg-opacity-50">
        <Chip chip="eventStartChip">
          <LeadingIcon class="material-icons">event</LeadingIcon>
          <Text
            >{format(workshop.event_start, "eee dd.MM. HH:mm 'Uhr'", {
              locale: de,
            })}</Text
          >
        </Chip>
        <Chip chip="eventDurationChip">
          <LeadingIcon class="material-icons">hourglass_bottom</LeadingIcon>
          <Text>{workshop.event_duration} min</Text>
        </Chip>
        <Chip chip="participantsChip">
          <LeadingIcon class="material-icons">person</LeadingIcon>
          <Text>15/20</Text>
        </Chip>
      </div>
    </div>
  </div>
{/if}
