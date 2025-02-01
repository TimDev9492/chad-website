<script lang="ts">
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import IconButton, { Icon } from '@smui/icon-button';
  import { goto } from '$app/navigation';

  let menu: Menu;
  let anchor: HTMLDivElement | undefined = $state();
  let anchorClasses: { [k: string]: boolean } = $state({});

  let { supabase, user } = $props();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    } else {
      goto('/');
    }
  };
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
  bind:this={anchor}>
  <IconButton
    onclick={() => menu.setOpen(true)}
    class="material-icons"
    aria-label="Account"
    >account_circle
  </IconButton>
  <Menu
    bind:this={menu}
    anchor={false}
    anchorElement={anchor}
    anchorCorner="BOTTOM_LEFT">
    <List>
      <Item onSMUIAction={() => goto('/user/info')}>
        <Icon class="material-icons">settings</Icon>
        <Text class="ml-2">Einstellungen</Text>
      </Item>
      <Separator />
      <Item
        onSMUIAction={logout}
        class="text-red-600">
        <Icon class="material-icons">exit_to_app</Icon>
        <Text class="ml-2">Abmelden</Text>
      </Item>
    </List>
  </Menu>
</div>
