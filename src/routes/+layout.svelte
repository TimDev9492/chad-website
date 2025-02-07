<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import '../app.css';
  import TopAppBar, { AutoAdjust } from '@smui/top-app-bar';
  import AppBar from '$lib/components/AppBar.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';

  let { data, children } = $props();
  let { session, supabase } = $derived(data);

  let topAppBar: TopAppBar | null = $state(null);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<!-- divide page into 3 rows: header, main content, and footer -->
<div class="min-h-full grid grid-rows-[auto_1fr_auto] w-[100vw]">
  <!-- header -->
  <header>
    <AppBar
      bind:smuiBar={topAppBar}
      {data}
    />
  </header>
  <!-- main content -->
  <AutoAdjust {topAppBar}>
    <main class="size-full">
      {@render children()}
    </main>
  </AutoAdjust>
  <!-- footer -->
  <footer>(footer)</footer>
</div>

<NotificationToast />
