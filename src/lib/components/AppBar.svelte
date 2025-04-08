<script lang="ts">
  import { goto } from '$app/navigation';
  import UserIcon from './UserIcon.svelte';
  import { drawerStore } from '$lib/drawerStore';
  import Ripple from '@smui/ripple';
  import { hasInfosProvided } from '$lib/utils';

  let { data } = $props();

  let { user, supabase, userAppData } = $derived(data);

  let profileName = $derived.by(() => {
    if (userAppData && userAppData.first_name && userAppData.last_name) {
      return `${userAppData.first_name} ${userAppData.last_name}`;
    }
    return userAppData.email ?? 'Unkown User';
  });
</script>

<div class="w-full chad-top-app-bar relative">
  <div class="[&>*]:p-4 text-white relative z-20">
    <div class="absolute top-0 left-0 h-full aspect-square">
      <button
        use:Ripple={{ surface: true }}
        onclick={() => drawerStore.set(true)}
        class="material-icons chad-text-heading h-full aspect-square rounded-full"
        >menu</button
      >
    </div>
    <div class="flex justify-center items-center">
      <div class="flex flex-col items-center">
        <span class="rich-font chad-text-heading">CHAD</span>
        <span class="rich-font chad-text-subheading">2025</span>
      </div>
    </div>
    <div
      class="absolute top-0 right-0 h-full flex items-center gap-8 chad-text-lg"
    >
      {#if user}
        <div class="flex gap-4 items-center h-full landscape:p-4">
          {#if hasInfosProvided(userAppData)}
            <span class="chad-text-lg portrait:hidden">{profileName}</span>
          {/if}
          <UserIcon
            {userAppData}
            {supabase}
          />
        </div>
      {:else}
        <button
          use:Ripple={{ surface: true }}
          onclick={() => goto('/login')}
          class="material-icons chad-text-heading h-full aspect-square p-0 rounded-full"
          aria-label="Account">account_circle</button
        >
      {/if}
    </div>
  </div>
  <div class="absolute top-0 left-0 size-full overflow-hidden z-10">
    <svg
      class="absolute bottom-0 left-0 fill-[#ff914d] h-2/3"
      viewBox="0 0 16 5"
      version="1.1"
    >
      <path d="M 0 4 C 4 4 4 0 9 0 C 13 0 12 4 16 5 L 0 5 Z"></path>
    </svg>
    <svg
      class="absolute top-0 right-[10%] fill-[#efb8d4] h-2/3"
      viewBox="0 0 15 4"
      version="1.1"
    >
      <path d="M 0 0 C 5 1 5 4 9 4 C 13 4 14 2 15 0"></path>
    </svg>
  </div>
</div>
