<script lang="ts">
  import SongSuggestions from '$lib/components/SongSuggestions.svelte';
  import DanceEventDescription from '$lib/content/DanceEventDescription.svelte';

  let { data } = $props();
  let { supabase, userAppData } = $derived(data);
</script>

<div class="size-full flex flex-col items-center p-4 landscape:p-8">
  <div class="w-full max-w-screen-lg flex flex-col items-center gap-8">
    <span class="chad-text-heading font-extrabold chad-typography-gradient"
      >Tanzabend</span
    >
    <div class="w-full flex flex-grow justify-center">
      <img
        class="max-w-full max-h-[60vh] aspect-video object-cover chad-shadow"
        src="https://placehold.co/1280x720"
        alt="Tanzabend"
      />
    </div>
    <div class="chad-card chad-shadow w-full">
      <DanceEventDescription />
    </div>
    <div
      class="w-full chad-card chad-shadow flex flex-col items-center pt-16 portrait:pt-20"
    >
      <span class="bubble-font uppercase flex chad-text-heading relative">
        <span class="text-[#b7bce2]">Lied</span>
        <span class="text-[#f4b0e5]">w</span>
        <span class="text-[#f4b0e5] relative">
          {'u'}
          <div
            class="absolute bg-[#f4b0e5] dot -top-[0.06em] left-[0.125em]"
          ></div>
          <div
            class="absolute bg-[#f4b0e5] dot -top-[0.06em] right-[0.125em]"
          ></div>
        </span>
        <span class="text-[#f4b0e5]">nsche</span>
        <div
          class={`chad-text-xl -scale-x-100 -rotate-12 absolute -left-[1em] -translate-x-full translate-y-1/4 w-[0.5em]
                  portrait:-top-[150%] portrait:left-[0.7em] portrait:text-6xl`}
        >
          {@render singleNote('#b7bce2')}
        </div>
        <div
          class={`chad-text-xl -scale-x-100 rotate-12 absolute -left-[1em] -translate-y-1/4 w-[0.6em]
                  portrait:-top-[150%] portrait:left-[0.7em] portrait:text-6xl`}
        >
          {@render doubleNote('#b7bce2')}
        </div>
        <div
          class={`chad-text-xl rotate-12 absolute -right-[1em] translate-x-full translate-y-1/4 w-[0.5em]
                  portrait:-top-[150%] portrait:right-[0.7em] portrait:text-6xl`}
        >
          {@render singleNote('#f4b0e5')}
        </div>
        <div
          class={`chad-text-xl -rotate-12 absolute -right-[1em] -translate-y-1/4 w-[0.6em]
                  portrait:-top-[150%] portrait:right-[0.7em] portrait:text-6xl`}
        >
          {@render doubleNote('#f4b0e5')}
        </div>
      </span>
      <div class="w-full min-h-96">
        <SongSuggestions
          {supabase}
          {userAppData}
        />
      </div>
    </div>
  </div>
</div>

{#snippet singleNote(color: string)}
  <svg
    viewBox="0 0.125498 9.446 10.37"
    version="1.1"
  >
    <path
      d="M5 8A1 1 0 000 8 1 1 0 005 8V3c3.034.022 2.372 1.873 3.697 1.896 1.645.068.645-6.392-3.648-4.383C4.538.234 3.99.417 4 1V6Z"
      fill={color}
    />
  </svg>
{/snippet}
{#snippet doubleNote(color: string)}
  <svg
    viewBox="0 1.182 11.69 10.27"
    version="1.1"
  >
    <path
      d="M5 8A1 1 0 000 8 1 1 0 005 8L5.253 2.917 9.797 2.871 10.048 6.502A1 1 0 008.244 11.296 1 1 0 0010.025 6.502L11.689 8.817C11.57 6.6233 11.448 4.2337 11.326 1.844 11.3 1.514 10.944 1.178 10.641 1.182L4.546 1.342C4.035 1.366 3.644 1.755 3.62 2.181L3.381 7.141Z"
      fill={color}
    />
  </svg>{/snippet}

<style>
  .dot {
    margin: 0px;
    width: 0.18em;
    height: 0.18em;
    border-radius: 50%;
  }
  .dot::after {
    content: '';
    width: 25%;
    height: 25%;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    top: 20%;
    left: 20%;
  }
</style>
