<script lang="ts">
  import Chip, { LeadingIcon, Text } from '@smui/chips';
  import Dialog, { Content } from '@smui/dialog';
  import Ripple from '@smui/ripple';
  import RoundImage from './RoundImage.svelte';

  type ParticipantData = {
    public_id: string;
    first_name: string;
    last_name: string;
    stake_name: string;
    ward_name: string;
    avatar_url: string;
  };

  let {
    participant,
    onclick = (participant: ParticipantData) => {},
  }: {
    participant: ParticipantData | null;
    onclick?: (participant: ParticipantData) => void;
  } = $props();

  let loading = $state(true);
  let open = $state(false);

  const updateComponent = (newParticipant: ParticipantData | null) => {
    loading = true;
    if (newParticipant == null) return;
    // load the image
    const img = new Image();
    img.onload = () => {
      loading = false;
    };
    img.src = newParticipant.avatar_url;
  };

  $effect(() => {
    updateComponent(participant);
  });
</script>

<div>
  {#if loading || participant === null}
    {@render skeleton()}
  {:else}
    <div class="flex flex-col items-center">
      {@render avatarWithName(
        participant.avatar_url,
        `${participant.first_name} ${participant.last_name}`,
        participant.public_id,
      )}
      {@render info('church', participant.ward_name, 'body2')}
      {@render info(
        'location_on',
        `Pfahl ${participant.stake_name}`,
        'caption',
      )}
    </div>
  {/if}
</div>

{#snippet skeleton()}
  <div class="flex flex-col items-center animate-pulse">
    <div class="relative mb-3">
      <svg
        class="size-28 text-gray-200"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"
        />
      </svg>
      <div class="absolute left-1/2 -translate-x-1/2 -translate-y-2/3">
        <div
          class="w-20 h-8 rounded-full bg-gray-300 border-white border"
        ></div>
      </div>
    </div>
    <div class="bg-gray-300 rounded-full w-32 h-3 m-1"></div>
    <div class="bg-gray-300 rounded-full w-28 h-2 mt-1"></div>
  </div>
{/snippet}
{#snippet info(icon: string, text: string, mdc_class: string)}
  <span class="flex justify-stretch gap-2">
    <LeadingIcon class="material-icons">{icon}</LeadingIcon>
    <div class={`mdc-typography--${mdc_class} w-full text-center text-nowrap`}>
      {text}
    </div>
  </span>
{/snippet}
{#snippet avatarWithName(avatar_url: string, name: string, chip: string)}
  <div class="relative mb-3">
    <div class="size-28 relative">
      <RoundImage
        src={avatar_url}
        alt="avatar"
      />
    </div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      use:Ripple={{ surface: true }}
      class="size-full absolute top-0 left-0 rounded-full cursor-pointer"
      onclick={() => onclick(participant)}
    ></div>
    <div
      class="absolute left-1/2 -translate-x-1/2 -translate-y-2/3 pointer-events-none"
    >
      <Chip {chip}>
        <LeadingIcon class="material-icons">person</LeadingIcon>
        <Text tabindex={0}>{name}</Text>
      </Chip>
    </div>
  </div>
{/snippet}
