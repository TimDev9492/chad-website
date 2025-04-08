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
  import { Icon, Label } from '@smui/common';
  import { onMount } from 'svelte';
  import { raiseToast } from '$lib/toastStore';
  import LinearProgress from '@smui/linear-progress';
  import type { Database } from '../../types/database.types.js';
  import RoundImage from '$lib/components/RoundImage.svelte';
  import Switch from '@smui/switch';
  import Button from '@smui/button';
  import RideSharingDialog from '$lib/components/RideSharingDialog.svelte';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import Ripple from '@smui/ripple';

  let { data } = $props();
  let { supabase, userAppData } = $derived(data);

  let userInSystem = $state(true);
  let entryDialogOpen = $state(false);
  let entryDialogData = $state<{
    from: string;
    to: string;
    from_seat_amount: number | null;
    to_seat_amount: number | null;
    contact_details: string;
    is_providing: boolean;
  }>({
    from: '',
    to: '',
    from_seat_amount: null,
    to_seat_amount: null,
    contact_details: '',
    is_providing: true,
  });

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

  let menu: Menu;
  let menuPos = $state({ x: 0, y: 0 });

  $effect(() => {
    if (currentPage > lastPage) {
      currentPage = lastPage;
    }
  });

  const deleteOwnEntry = async () => {
    fetchingData = true;
    const { error } = await supabase
      .from('ride_sharing')
      .delete()
      .eq('public_id', userAppData.public_id);
    if (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message: 'Fehler beim Löschen der Mitfahrgelegenheit',
      });
      return;
    }
    raiseToast({
      level: 'success',
      message: 'Mitfahrgelegenheit erfolgreich gelöscht',
    });
    await pullData();
    fetchingData = false;
  };

  const editOwnEntry = async () => {
    const ownEntry = rideSharingInfos.find(
      (item) => item.public_id === userAppData.public_id,
    );
    if (!ownEntry) return;
    entryDialogData = {
      from: ownEntry.from ?? '',
      to: ownEntry.to ?? '',
      from_seat_amount: ownEntry.from_seat_amount,
      to_seat_amount: ownEntry.to_seat_amount,
      contact_details: ownEntry.contact_details,
      is_providing: !ownEntry.is_providing,
    };
    entryDialogOpen = true;
  };

  const pullData = async () => {
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

    let userIndex = rideSharingInfos.findIndex(
      (item) => item.public_id === userAppData.public_id,
    );

    userInSystem = userIndex !== -1;

    // if user is in the system, put him at the top of the list
    if (userIndex === -1) return;
    let userItem = rideSharingInfos.splice(userIndex, 1)[0];
    rideSharingInfos.unshift(userItem);
  };

  onMount(async () => {
    await pullData();
    fetchingData = false;
  });
</script>

<div class="w-full chad-card chad-shadow flex flex-col items-center gap-4">
  <div
    class="chad-typography-gradient font-extrabold chad-text-subheading landscape:text-6xl pb-4"
  >
    Mitfahrgelegenheiten
  </div>
  {#if !userInSystem || true}
    <Button
      onclick={() => (entryDialogOpen = true)}
      color="secondary"
      variant="raised"
    >
      <Label>Eintragen</Label>
    </Button>
  {/if}
  <div class="flex items-center justify-center text-center chad-text-base">
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
  <div class="landscape:min-w-[60vw] w-full">
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
      <Body class="">
        {#each slice as item (item.public_id)}
          <Row
            class={'relative ' +
              (item.public_id === userAppData.public_id ? 'bg-green-100' : '')}
          >
            <Cell>
              <div class="flex items-center gap-2">
                <div class="w-8">
                  <RoundImage
                    src={item.public_infos.avatar_url}
                    alt="Avatar"
                  />
                </div>
                <span>
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
                  <div class="text-gray-600 flex items-center">
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
                  <div class="text-gray-600 flex items-center">
                    <div class="material-icons">person</div>
                    <span>{item.to_seat_amount}</span>
                  </div>
                </div>
              {:else}
                -
              {/if}
            </Cell>
            <Cell>
              {item.contact_details}
            </Cell>
            {#if item.public_id === userAppData.public_id}
              <div class="absolute top-0 right-0 h-full flex">
                <div
                  class="h-full w-8 bg-white chad-text-mask-left border-y"
                ></div>
                <div class="h-full aspect-square bg-white border-y p-2">
                  <button
                    use:Ripple={{ surface: true }}
                    onclick={(e) => {
                      menuPos = {
                        x: e.clientX,
                        y: e.clientY,
                      };
                      menu.setOpen(true);
                    }}
                    aria-label="More options"
                    class="cursor-pointer select-none material-icons size-full flex justify-center items-center text-center rounded-full text-xl"
                  >
                    more_vert
                  </button>
                </div>
              </div>
            {/if}
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
            <div>
              {start + 1}-{end} von {items.length}
            </div>
          {/snippet}

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
        </Pagination>
      {/snippet}
    </DataTable>
  </div>
</div>
<RideSharingDialog
  {supabase}
  refreshData={pullData}
  publicId={userAppData.public_id!}
  bind:open={entryDialogOpen}
  bind:toLocation={entryDialogData.to}
  bind:toSeats={entryDialogData.to_seat_amount}
  bind:fromLocation={entryDialogData.from}
  bind:fromSeats={entryDialogData.from_seat_amount}
  bind:contactDetails={entryDialogData.contact_details}
  bind:lookingForRides={entryDialogData.is_providing}
/>
<div
  class="fixed z-50"
  style="top: {menuPos.y}px; left: {menuPos.x}px;"
>
  <Menu bind:this={menu}>
    <List>
      <Item onSMUIAction={editOwnEntry}>
        <Icon class="material-icons pr-2">edit</Icon>
        <Text>Bearbeiten</Text>
      </Item>
      <Item
        onSMUIAction={deleteOwnEntry}
        class="text-red-500"
      >
        <Icon class="material-icons pr-2">delete</Icon>
        <Text>Löschen</Text>
      </Item>
    </List>
  </Menu>
</div>
