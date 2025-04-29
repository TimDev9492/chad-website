<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import '../app.css';
  import AppBar from '$lib/components/AppBar.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import AppDrawer from '$lib/components/AppDrawer.svelte';
  import { drawerStore } from '$lib/drawerStore';
  import LinearProgress from '@smui/linear-progress';
  import { navigating } from '$app/state';
  import EmailIcon from '$lib/components/icons/EmailIcon.svelte';
  import { COMING_SOON_ROUTES, CONTACT } from '$lib/content/constants';
  import InstagramIcon from '$lib/components/icons/InstagramIcon.svelte';
  import WhatsAppIcon from '$lib/components/icons/WhatsAppIcon.svelte';
  import ProgressStepper from '$lib/components/ProgressStepper.svelte';
  import AppDialog from '$lib/components/AppDialog.svelte';
  import { page } from '$app/state';
  import ComingSoon from '$lib/components/ComingSoon.svelte';
  import { openDialog } from '$lib/dialogStore';

  let { data, children } = $props();
  let { session, supabase, userAppData } = $derived(data);

  let loadingBarOpen = $derived(navigating && navigating.complete !== null);
  let comingSoonSplashScreen = $derived(
    COMING_SOON_ROUTES.includes(page.url.pathname),
  );

  const headerResize = () => {
    const header = document.getElementById('chad-header');
    if (!header) return;
    const headerHeight = header.offsetHeight;
    const content = document.getElementById('chad-content');
    if (!content) return;
    content.style.paddingTop = `${headerHeight}px`;
  };

  $effect(() => {
    const urlMessage = page.url.searchParams.get('message');
    if (!urlMessage) return;
    openDialog({
      content: urlMessage,
      actions: [],
    });
  });

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    headerResize();
    window.addEventListener('resize', headerResize);

    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>CHAD Tagung</title>
  <meta
    name="description"
    content="Website für die CHAD (Schweiz - Österreich - Deutschland) Tagung 2025"
  />
  <link
    rel="preload"
    as="font"
    href="/fonts/MADEWaffleSoft.ttf.woff"
    type="tonf/woff"
    crossorigin="anonymous"
  />
</svelte:head>

<AppDrawer
  {userAppData}
  {supabase}
/>
<AppDialog />

<!-- divide page into 3 rows: header, main content, and footer -->
<div class="relative min-h-full grid grid-rows-[auto_1fr] w-[100vw]">
  <div class="fixed w-full page-loading-bar z-50">
    <LinearProgress
      closed={!loadingBarOpen}
      indeterminate
    />
  </div>
  <!-- header -->
  <header class="w-full z-40">
    <div
      class="fixed top-0 left-0 w-full"
      id="chad-header"
    >
      <AppBar {data} />
    </div>
  </header>
  <!-- main content -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <main
    onclick={() => drawerStore.set(false)}
    class="size-full overflow-x-hidden pt-32"
    id="chad-content"
  >
    {#if comingSoonSplashScreen && userAppData.role !== 'admin'}
      <ComingSoon />
    {:else}
      {@render children()}
    {/if}
  </main>
  <!-- footer -->
  <footer class="flex justify-center p-8 bg-blue-100 footer">
    <div class="w-full max-w-screen-sm flex flex-col gap-8">
      <div class="w-full flex justify-evenly gap-8">
        <div class="flex flex-col text-gray-600 chad-text-base">
          <span class="text-black chad-text-lg">Kontakt</span>
          <a
            class="flex items-center gap-2"
            href={`mailto:${CONTACT.EMAIL}`}
          >
            <EmailIcon class="h-[1em]" />{CONTACT.EMAIL}</a
          >
          <a
            class="flex items-center gap-2 !text-gray-600"
            href={CONTACT.INSTAGRAM}
          >
            <InstagramIcon class="h-[1em]" />@chadtagung</a
          >
          <a
            class="flex items-center gap-2 !text-gray-600"
            href={CONTACT.WHATSAPP}
          >
            <WhatsAppIcon class="h-[1em]" />WhatsApp</a
          >
        </div>
        <div class="flex flex-col text-gray-600 chad-text-base">
          <span class="text-black chad-text-lg">Rechtliches</span>
          <a
            class="!text-gray-600"
            href="/legal/privacy">Datenschutz</a
          >
          <a
            class="!text-gray-600"
            href="/legal/imprint">Impressum</a
          >
        </div>
      </div>

      <div class="w-full flex justify-center text-center">
        <div class="flex flex-col">
          <span class="chad-text-sm text-gray-700"
            >© 2025 Chad. All rights reserved.</span
          >
          <span class="chad-text-sm text-gray-500 text-balance"
            >This is not an official website for The Church of Jesus Christ of
            Latter-day Saints.</span
          >
        </div>
      </div>
    </div>
  </footer>
</div>
<NotificationToast />
<div class="stepper">
  <ProgressStepper {data} />
</div>

<style>
  .stepper {
    position: fixed;
    @media (orientation: landscape) {
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 2rem;
    }
    @media (orientation: portrait) {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 2rem;
      width: 90vw;
    }
  }
</style>
