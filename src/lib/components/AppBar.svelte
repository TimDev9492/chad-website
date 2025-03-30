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
  <Row class="grid grid-cols-3">
    <Section align="start">
      <IconButton
        onclick={() => drawerStore.set(true)}
        class="material-icons">menu</IconButton
      >
    </Section>
    <Section class="flex justify-center items-center">
      <Title class="p-0 font-extrabold text-2xl chad-typography-gradient-alt"
        >CHAD Tagung</Title
      >
    </Section>
    <Section align="end">
      {#if user}
        <div
          class="mdc-typography--overline overflow-hidden whitespace-nowrap text-ellipsis max-w-[70%]"
        >
          {profileName}
        </div>
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
