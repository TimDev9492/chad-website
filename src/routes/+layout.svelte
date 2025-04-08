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
  import { PUBLIC_SUPPORT_EMAIL } from '$env/static/public';

  let { data, children } = $props();
  let { session, supabase, userAppData } = $derived(data);

  let loadingBarOpen = $derived(navigating && navigating.complete !== null);

  const headerResize = () => {
    const header = document.getElementById('chad-header');
    if (!header) return;
    const headerHeight = header.offsetHeight;
    const content = document.getElementById('chad-content');
    if (!content) return;
    content.style.paddingTop = `${headerHeight}px`;
  };

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
    href="/fonts/MADEWaffleSoft.ttf.woff"
    type="tonf/woff"
    crossorigin="anonymous"
  />
</svelte:head>

<AppDrawer
  {userAppData}
  {supabase}
/>

<!-- divide page into 3 rows: header, main content, and footer -->
<div class="relative min-h-full grid grid-rows-[auto_1fr] w-[100vw]">
  <div class="fixed w-full page-loading-bar z-50">
    <LinearProgress
      closed={!loadingBarOpen}
      indeterminate
    />
  </div>
  <!-- header -->
  <header class="w-full z-10">
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
    {@render children()}
  </main>
  <!-- footer -->
  <footer class="flex justify-between items-center p-2 px-4 text-gray-700">
    <div>Chad Tagung 2025</div>
    <div>
      Kontakt: <a
        href={`mailto:${PUBLIC_SUPPORT_EMAIL}`}
        class="text-blue-500">{PUBLIC_SUPPORT_EMAIL}</a
      >
    </div>
  </footer>
</div>

<NotificationToast />
