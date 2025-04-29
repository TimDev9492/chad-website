<script lang="ts">
  import Drawer, { Content, Header, Title, Subtitle } from '@smui/drawer';
  import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';
  import { drawerStore } from '$lib/drawerStore';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { UserAppData } from '../../app';
  import { logout } from '$lib/utils';
  import type { SupabaseClient } from '@supabase/supabase-js';

  let {
    userAppData,
    supabase,
  }: {
    userAppData: UserAppData | null;
    supabase: SupabaseClient;
  } = $props();

  type DrawerOption = {
    icon: string;
    label: string;
    href: string;
    onclick?: () => void;
  };
  let options: { [category: string]: DrawerOption[] } = $derived.by(() => {
    const opts: { [category: string]: DrawerOption[] } = {
      main: [{ icon: 'home', label: 'Startseite', href: '/' }],
      Anmeldung: [],
      Programm: [
        { icon: 'nightlife', label: 'Tanzabend', href: '/dance-event' },
        { icon: 'event', label: 'Workshops', href: '/workshops' },
        { icon: 'pin_drop', label: 'Anreise', href: '/locations' },
      ],
      Account: [],
      footer: [],
    };

    if (userAppData == null || userAppData.public_id == undefined) {
      opts.footer.push({ icon: 'login', label: 'Anmelden', href: '/login' });
    } else {
      opts.main.push({
        icon: 'groups',
        label: 'Teilnehmerliste',
        href: '/participants',
      });

      opts['Anmeldung'].push(
        { icon: 'checklist', label: 'Schritte', href: '/user' },
        {
          icon: 'assignment',
          label: 'Anmeldeformular',
          href: '/user/info',
        },
        { icon: 'credit_card', label: 'Bezahlen', href: '/user/payments' },
        {
          icon: 'airport_shuttle',
          label: 'Mitfahrgelegenheiten',
          href: '/ride-sharing',
        },
      );

      opts['Account'].push(
        { icon: 'email', label: 'E-Mail ändern', href: '/user/update-email' },
        {
          icon: 'password',
          label: 'Passwort ändern',
          href: '/user/update-password',
        },
      );

      opts.footer.push({
        icon: 'logout',
        label: 'Abmelden',
        href: '/',
        onclick: () => logout(supabase),
      });

      // optionally add admin page
      if (userAppData.role === 'admin')
        opts.main.unshift({
          icon: 'security',
          label: 'Admin Seite',
          href: '/admin',
        });
    }

    return opts;
  });

  let active = $state<DrawerOption | null>(null);
  let open = $state(false);

  function setActive(option: DrawerOption) {
    active = option;
    drawerStore.set(false);
  }

  onMount(() => {
    drawerStore.subscribe((value) => {
      open = value;
    });
  });

  $effect(() => {
    for (const category of Object.keys(options)) {
      for (const option of options[category]) {
        if (option.href === page.route.id) {
          active = option;
          return;
        }
      }
    }
  });
</script>

<div class="drawer-container">
  <!-- Don't include fixed={false} if this is a page wide drawer.
        It adds a style for absolute positioning. -->
  <Drawer
    variant="modal"
    fixed={true}
    class="z-50"
    bind:open
  >
    <Header>
      <Title class="chad-text-lg">Navigation</Title>
      <Subtitle class="chad-text-base">Was suchst du?</Subtitle>
    </Header>
    <Content>
      <div class="flex flex-col justify-between h-full">
        <List>
          {#each options.main as mainOption}
            {@render drawerItem(mainOption)}
          {/each}
          {#each Object.keys(options) as category}
            {#if category !== 'main' && category !== 'footer' && options[category].length > 0}
              {@render section(category, options[category])}
            {/if}
          {/each}
        </List>
        <List>
          {#each options.footer as footerOption}
            {@render drawerItem(footerOption)}
          {/each}
        </List>
      </div>
    </Content>
  </Drawer>
</div>

{#snippet drawerItem(option: DrawerOption)}
  <Item
    href={option.href}
    onclick={() => {
      setActive(option);
      option.onclick && option.onclick();
    }}
    activated={active?.href == option.href}
  >
    <Graphic
      class="material-icons"
      aria-hidden="true">{option.icon}</Graphic
    >
    <Text class="chad-text-base">{option.label}</Text>
  </Item>
{/snippet}
{#snippet section(label: string, options: DrawerOption[])}
  <Separator />
  <Subheader tag="h6">{label}</Subheader>
  {#each options as option}
    {@render drawerItem(option)}
  {/each}
{/snippet}
