<script lang="ts">
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import IconButton, { Icon } from '@smui/icon-button';
  import Ripple from '@smui/ripple';
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { avatarStore } from '$lib/avatarStore';

  let menu: Menu;
  let anchor: HTMLDivElement | undefined = $state();
  let anchorClasses: { [k: string]: boolean } = $state({});

  let { supabase, userAppData } = $props();

  let displayedAvatarUrl = $state<string | null>(
    userAppData.avatar_url ?? null,
  );

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    } else {
      goto('/');
    }
  };

  let unsubscribe: () => void | null;
  onMount(() => {
    avatarStore.set(userAppData.avatar_url ?? null);

    unsubscribe = avatarStore.subscribe((newAvatar) => {
      displayedAvatarUrl = newAvatar;
    });
  });

  onDestroy(() => unsubscribe && unsubscribe());
</script>

<div
  class={Object.keys(anchorClasses).join(' ')}
  use:Anchor={{
    addClass: (className) => {
      if (!anchorClasses[className]) {
        anchorClasses[className] = true;
      }
    },
    removeClass: (className) => {
      if (anchorClasses[className]) {
        delete anchorClasses[className];
      }
    },
  }}
  bind:this={anchor}
>
  {#if displayedAvatarUrl}
    <button
      class="rounded-full cursor-pointer ml-2"
      onclick={() => menu.setOpen(true)}
      use:Ripple={{ surface: true }}
    >
      <img
        src={displayedAvatarUrl}
        alt="Avatar"
        class="size-10 rounded-full"
      />
    </button>
  {:else}
    <IconButton
      onclick={() => menu.setOpen(true)}
      class="material-icons"
      aria-label="Account"
      >account_circle
    </IconButton>
  {/if}
  <Menu
    bind:this={menu}
    anchor={false}
    anchorElement={anchor}
    anchorCorner="BOTTOM_LEFT"
  >
    <List>
      <Item onSMUIAction={() => goto('/user/info')}>
        <Icon class="material-icons">settings</Icon>
        <Text class="ml-2">Einstellungen</Text>
      </Item>
      <Separator />
      <Item
        onSMUIAction={logout}
        class="text-red-600"
      >
        <Icon class="material-icons">exit_to_app</Icon>
        <Text class="ml-2">Abmelden</Text>
      </Item>
    </List>
  </Menu>
</div>
