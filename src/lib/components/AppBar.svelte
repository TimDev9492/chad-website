<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { goto } from '$app/navigation';
  import UserIcon from './UserIcon.svelte';
  import { drawerStore } from '$lib/drawerStore';

  let { smuiBar = $bindable(), data } = $props();

  let { user, supabase, userAppData } = $derived(data);

  let profileName = $derived.by(() => {
    if (userAppData && userAppData.first_name && userAppData.last_name) {
      return `${userAppData.first_name} ${userAppData.last_name}`;
    }
    return userAppData.email ?? 'Unkown User';
  });
</script>

<TopAppBar
  bind:this={smuiBar}
  variant="fixed"
  color="secondary"
>
  <Row>
    <Section>
      <IconButton
        onclick={() => drawerStore.set(true)}
        class="material-icons">menu</IconButton
      >
      <Title>Fixed</Title>
    </Section>
    <Section>
      <div class="flex justify-center items-center size-full">
        <Title class="p-0">Title</Title>
      </div>
    </Section>
    <Section
      align="end"
      toolbar
    >
      {#if user}
        <div class="mdc-typography--overline">{profileName}</div>
        <UserIcon
          {userAppData}
          {supabase}
        />
      {:else}
        <IconButton
          onclick={() => goto('/login')}
          class="material-icons"
          aria-label="Account">account_circle</IconButton
        >
      {/if}
    </Section>
  </Row>
</TopAppBar>
