<script lang="ts">
  import { onMount } from 'svelte';
  import { getWorkshopsWithTimeslots } from '$lib/appAdapter';
  import { format } from 'date-fns';
  import { de, enUS } from 'date-fns/locale';
  import type { WorkshopsByTime } from '../../app.js';
  import WorkshopCard from '$lib/components/WorkshopCard.svelte';
  import List, { Graphic, Item, Text } from '@smui/list';
  import Tab, { Icon, Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';

  let { data } = $props();
  let { supabase, user } = $derived(data);

  let groupedWorkshops = $state<WorkshopsByTime | null>(null);
  let activeTimeSlot = $state<string>('');

  $inspect(groupedWorkshops);

  onMount(async () => {
    const workshops = await getWorkshopsWithTimeslots(supabase, (date) =>
      format(date, 'eeee HH:mm', { locale: de }),
    );
    activeTimeSlot = Object.keys(workshops)[0];
    groupedWorkshops = workshops;
  });
</script>

<div class="size-full flex justify-center">
  <div
    class="grid landscape:grid-cols-[3fr_1fr] landscape:max-w-[100rem] landscape:py-16 gap-16 portrait:grid-cols-1 portrait:py-8"
  >
    <div
      class="w-full grid landscape:grid-cols-2 portrait:grid-cols-1 items-start gap-8"
    >
      {#if groupedWorkshops == null}
        <WorkshopCard workshop={null} />
        <WorkshopCard workshop={null} />
      {:else}
        {#each groupedWorkshops[activeTimeSlot] as workshop}
          <WorkshopCard {workshop} />
        {/each}
      {/if}
    </div>
    <div class="fixed right-64 portrait:hidden">
      <div class="font-thin text-gray-500">Zeit Slots</div>
      <div class="relative">
        <List>
          {#if groupedWorkshops !== null}
            {#each Object.keys(groupedWorkshops) as timeSlot}
              <Item
                activated={timeSlot === activeTimeSlot}
                onclick={() => (activeTimeSlot = timeSlot)}
              >
                <Graphic
                  class="material-icons"
                  aria-hidden="true">today</Graphic
                >
                <Text>{timeSlot}</Text>
                <div class="w-16"></div>
              </Item>
            {/each}
          {/if}
        </List>
        <div
          class="absolute border-l-2 border-orange-500 left-0 top-2 h-[calc(100%-1rem)]"
        ></div>
      </div>
    </div>
    <div
      class="landscape:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-300"
    >
      <TabBar
        tabs={Object.keys(groupedWorkshops ?? {})}
        key={(tab) => tab}
        active={activeTimeSlot}
      >
        {#snippet tab(tab)}
          <Tab
            {tab}
            onclick={() => (activeTimeSlot = tab)}
          >
            <Icon class="material-icons">today</Icon>
            <Label>{tab}</Label>
          </Tab>
        {/snippet}
      </TabBar>
    </div>
  </div>
</div>
