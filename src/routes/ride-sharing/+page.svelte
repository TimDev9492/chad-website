<script lang="ts">
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    Pagination,
  } from '@smui/data-table';
  import Select, { Option } from '@smui/select';
  import IconButton from '@smui/icon-button';
  import { Label } from '@smui/common';
  import { onMount } from 'svelte';
  import { raiseToast } from '$lib/toastStore';
  import LinearProgress from '@smui/linear-progress';
  import type { Database } from '../../types/database.types.js';
  import RoundImage from '$lib/components/RoundImage.svelte';
  import Switch from '@smui/switch';

  let { data } = $props();
  let { supabase } = $derived(data);

  let fetchingData = $state(true);
  let lookingForRides = $state(true);

  type RideSharingInfo = Database['public']['Tables']['ride_sharing']['Row'] & {
    public_infos: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
  let rideSharingInfos: RideSharingInfo[] = $state([]);
  let items = $derived(
    rideSharingInfos.filter((item) => item.is_providing === lookingForRides),
  );
  let perPage = $state(10);
  let currentPage = $state(0);

  const start = $derived(currentPage * perPage);
  const end = $derived(Math.min(start + perPage, items.length));
  const slice = $derived(items.slice(start, end));
  const lastPage = $derived(Math.max(Math.ceil(items.length / perPage) - 1, 0));

  $effect(() => {
    if (currentPage > lastPage) {
      currentPage = lastPage;
    }
  });

  onMount(async () => {
    const { data, error } = await supabase
      .from('ride_sharing')
      .select('*, public_infos(first_name, last_name, avatar_url)');
    if (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message: 'Fehler beim Laden der Mitfahrgelegenheiten',
      });
      fetchingData = false;
      return;
    }
    rideSharingInfos = data as RideSharingInfo[];
    fetchingData = false;
  });
</script>

<div class="size-full flex justify-center items-center">
  <div class="chad-card chad-shadow portrait:w-[90vw]">
    <div
      class="chad-typography-gradient font-extrabold landscape:text-6xl portrait:text-4xl pb-4 mb-4"
    >
      Mitfahrgelegenheiten
    </div>
    <div class="flex items-center justify-center mb-4 text-center">
      <span class={lookingForRides ? 'text-gray-500' : 'text-black'}
        >Ich will mitnehmen</span
      >
      <Switch
        bind:checked={lookingForRides}
        icons={false}
      />
      <span class={!lookingForRides ? 'text-gray-500' : 'text-black'}
        >Ich will mitfahren</span
      >
    </div>
    <div class="landscape:min-w-[60vw]">
      <DataTable
        table$aria-label="Mitfahrgelegenheiten"
        style="width: 100%;"
      >
        <Head>
          <Row>
            <Cell>
              <div class="flex items-center gap-2">
                <div class="material-icons">person</div>
                <span>Name</span>
              </div>
            </Cell>
            <Cell>
              <div class="flex items-center gap-2">
                <div class="material-icons">airport_shuttle</div>
                <span>Hinfahrt aus</span>
              </div>
            </Cell>
            <Cell>
              <div class="flex items-center gap-2">
                <div class="material-icons scale-x-[-1]">airport_shuttle</div>
                <span>Rückfahrt nach</span>
              </div>
            </Cell>
            <Cell>
              <div class="flex items-center gap-2">
                <div class="material-icons">contact_page</div>
                <span>Kontakt</span>
              </div>
            </Cell>
          </Row>
        </Head>
        <Body>
          {#each slice as item (item.public_id)}
            <Row>
              <Cell>
                <div class="flex items-center gap-2">
                  <div class="w-8">
                    <RoundImage
                      src={item.public_infos.avatar_url}
                      alt="Avatar"
                    />
                  </div>
                  <span class="text-sm">
                    {item.public_infos.first_name}
                    {item.public_infos.last_name}
                  </span>
                </div>
              </Cell>
              <Cell>
                {#if item.from !== null}
                  <div class="flex items-center gap-2">
                    <div class="material-icons">location_on</div>
                    <span>{item.from}</span>
                    <div class="text-gray-600 text-sm flex items-center">
                      <div class="material-icons">person</div>
                      <span>{item.from_seat_amount}</span>
                    </div>
                  </div>
                {:else}
                  -
                {/if}
              </Cell>
              <Cell>
                {#if item.to !== null}
                  <div class="flex items-center gap-2">
                    <div class="material-icons">location_on</div>
                    <span>{item.to}</span>
                    <div class="text-gray-600 text-sm flex items-center">
                      <div class="material-icons">person</div>
                      <span>{item.to_seat_amount}</span>
                    </div>
                  </div>
                {:else}
                  -
                {/if}
              </Cell>
              <Cell>{item.contact_details}</Cell>
            </Row>
          {/each}
        </Body>

        {#snippet progress()}
          <LinearProgress
            indeterminate
            closed={!fetchingData}
            aria-label="Lädt..."
          />
        {/snippet}

        {#snippet paginate()}
          <Pagination>
            {#snippet rowsPerPage()}
              <Label>Einträge pro Seite</Label>
              <Select
                variant="outlined"
                bind:value={perPage}
                noLabel
              >
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={100}>100</Option>
              </Select>
            {/snippet}
            {#snippet total()}
              {start + 1}-{end} von {items.length}
            {/snippet}

            <IconButton
              class="material-icons"
              action="first-page"
              title="First page"
              onclick={() => (currentPage = 0)}
              disabled={currentPage === 0}>first_page</IconButton
            >
            <IconButton
              class="material-icons"
              action="prev-page"
              title="Prev page"
              onclick={() => currentPage--}
              disabled={currentPage === 0}>chevron_left</IconButton
            >
            <IconButton
              class="material-icons"
              action="next-page"
              title="Next page"
              onclick={() => currentPage++}
              disabled={currentPage === lastPage}>chevron_right</IconButton
            >
            <IconButton
              class="material-icons"
              action="last-page"
              title="Last page"
              onclick={() => (currentPage = lastPage)}
              disabled={currentPage === lastPage}>last_page</IconButton
            >
          </Pagination>
        {/snippet}
      </DataTable>
    </div>
  </div>
</div>
