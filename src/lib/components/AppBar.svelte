<script lang="ts">
  import TopAppBar, {
    Row,
    Section,
    Title,
  } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { goto } from '$app/navigation';
  import UserIcon from './UserIcon.svelte';

  let { smuiBar = $bindable(), data } = $props();

  let { user, supabase } = $derived(data);
</script>

<TopAppBar
  bind:this={smuiBar}
  variant="fixed">
  <Row>
    <Section>
      <IconButton class="material-icons">menu</IconButton>
      <Title>Fixed</Title>
    </Section>
    <Section>
      <div class="flex justify-center items-center size-full">
        <Title class="p-0">Title</Title>
      </div>
    </Section>
    <Section
      align="end"
      toolbar>
      {#if user}
        <div class="mdc-typography--overline">{user!.email}</div>
        <UserIcon {user} {supabase} />
      {:else}
        <IconButton
          onclick={() => goto('/login')}
          class="material-icons"
          aria-label="Account">account_circle</IconButton>
      {/if}
    </Section>
  </Row>
</TopAppBar>
