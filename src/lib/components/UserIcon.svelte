<script lang="ts">
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import IconButton, { Icon } from '@smui/icon-button';
  import Ripple from '@smui/ripple';
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { avatarStore } from '$lib/avatarStore';
  import { logout } from '$lib/utils';
  import RoundImage from './RoundImage.svelte';

  let menu: Menu;

  let { supabase, userAppData } = $props();

  let displayedAvatarUrl = $state<string | null>(
    userAppData.avatar_url ?? null,
  );

  let unsubscribe: () => void | null;
  onMount(() => {
    avatarStore.set(userAppData.avatar_url ?? null);

    unsubscribe = avatarStore.subscribe((newAvatar) => {
      displayedAvatarUrl = newAvatar;
    });
  });

  onDestroy(() => unsubscribe && unsubscribe());
</script>

<div class="max-w-full max-h-full aspect-square">
  {#if displayedAvatarUrl}
    <button
      class="rounded-full cursor-pointer size-full"
      onclick={() => menu.setOpen(true)}
      use:Ripple={{ surface: true }}
    >
      <img
        src={displayedAvatarUrl}
        alt="Avatar"
        class="max-h-full max-w-full"
      />
    </button>
  {:else}
    <button
      use:Ripple={{ surface: true }}
      onclick={() => menu.setOpen(true)}
      class="material-icons rounded-full h-full aspect-square chad-text-heading"
      aria-label="Account"
      >account_circle
    </button>
  {/if}
  <Menu
    bind:this={menu}
    anchorCorner="BOTTOM_LEFT"
  >
    <List>
      <Item onSMUIAction={() => goto('/user/update-email')}>
        <Icon class="material-icons">email</Icon>
        <Text class="ml-2">E-Mail ändern</Text>
      </Item>
      <Item onSMUIAction={() => goto('/user/update-password')}>
        <Icon class="material-icons">password</Icon>
        <Text class="ml-2">Passwort ändern</Text>
      </Item>
      <Item onSMUIAction={() => goto('/user/info')}>
        <Icon class="material-icons">assignment</Icon>
        <Text class="ml-2">Anmeldeformular</Text>
      </Item>
      <Separator />
      <Item
        onSMUIAction={() => {
          logout(supabase);
        }}
        class="text-red-600"
      >
        <Icon class="material-icons">exit_to_app</Icon>
        <Text class="ml-2">Abmelden</Text>
      </Item>
    </List>
  </Menu>
</div>
