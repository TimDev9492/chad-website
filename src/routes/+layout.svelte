<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import '../app.css';
  import TopAppBar, { AutoAdjust } from '@smui/top-app-bar';
  import AppBar from '$lib/components/AppBar.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import AppDrawer from '$lib/components/AppDrawer.svelte';
  import { drawerStore } from '$lib/drawerStore';
  import LinearProgress from '@smui/linear-progress';
  import { navigating } from '$app/state';

  let { data, children } = $props();
  let { session, supabase, userAppData } = $derived(data);

  let topAppBar: TopAppBar | null = $state(null);
  let loadingBarOpen = $derived(navigating && navigating.complete !== null);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<AppDrawer
  {userAppData}
  {supabase}
/>

<!-- divide page into 3 rows: header, main content, and footer -->
<div class="relative min-h-full grid grid-rows-[auto_1fr_auto] w-[100vw]">
  <div class="fixed w-full page-loading-bar z-50">
    <LinearProgress
      closed={!loadingBarOpen}
      indeterminate
    />
  </div>
  <!-- header -->
  <header>
    <AppBar
      bind:smuiBar={topAppBar}
      {data}
    />
  </header>
  <!-- main content -->
  <AutoAdjust {topAppBar}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <main
      onclick={() => drawerStore.set(false)}
      class="size-full"
    >
      {@render children()}
    </main>
  </AutoAdjust>
  <!-- footer -->
  <footer>(footer)</footer>
</div>

<NotificationToast />
