<script lang="ts">
  import Carousel from '$lib/components/Carousel.svelte';
  import ParticipantBar from '$lib/components/ParticipantBar.svelte';
  import { carouselData, type CarouselSlide } from '$lib/content/mainPage';
  import Ripple from '@smui/ripple';

  let { data } = $props();
  let { supabase } = $derived(data);

  const nextSignupRoute = $derived.by(() => {
    return '/login';
  });
</script>

<div class="size-full flex flex-col items-center landscape:p-8 portrait:p-4">
  <div
    class="flex flex-col items-center max-w-screen-lg w-full gap-8 portrait:gap-4"
  >
    <a
      use:Ripple={{ surface: true }}
      href={nextSignupRoute}
      class="bg-[#ff914d] rich-font rounded-full w-full text-center p-4 uppercase !text-white chad-text-subheading font-extrabold tracking-[0.2em] chad-shadow"
      >Anmeldung</a
    >
    <div class="chad-card chad-shadow w-full">
      <ParticipantBar {supabase} />
    </div>
    <div class="chad-card chad-shadow w-full">
      <div class="grid grid-cols-2 text-gray-500 gap-2 chad-text-lg">
        <div class="flex items-center gap-2">
          <div class="material-icons chad-text-subheading">home</div>
          <span>Wo?</span>
        </div>
        <div>Talstraße 12, 61381 Friedrichsdorf</div>
        <div class="flex items-center gap-2">
          <div class="material-icons chad-text-subheading">calendar_month</div>
          <span>Wann?</span>
        </div>
        <div>11. bis 15. August 2025</div>
        <div class="flex items-center gap-2">
          <div class="material-icons chad-text-subheading">paid</div>
          <span>Tagungsbeitrag</span>
        </div>
        <div>
          35€ <span class="chad-text-base text-gray-400">(+25€ Herberge)</span>
        </div>
      </div>
    </div>
    <div class="chad-card chad-shadow p-4 landscape:p-8 w-full">
      <Carousel data={carouselData}>
        {#snippet slide(item: CarouselSlide)}
          <div
            class="grid grid-cols-2 gap-8 portrait:flex portrait:flex-col portrait:items-center portrait:p-2"
          >
            <img
              src={item.imgSrc}
              alt="Slide"
              class="size-full object-contain"
            />
            <div
              class="flex flex-col justify-center gap-4 portrait:text-center landscape:py-8"
            >
              <span class="chad-text-subheading font-bold text-balance"
                >{item.title}</span
              >
              <span class="chad-text-lg text-balance">{item.description}</span>
            </div>
          </div>
        {/snippet}
      </Carousel>
    </div>
    <div class="w-full">
      <img
        src="https://placehold.co/1280x720?text=Moodboard+Wide"
        alt="Moodboard Wide"
        class="size-full object-contain portrait:hidden"
      />
      <img
        src="https://placehold.co/480x720?text=Moodboard+Narrow"
        alt="Moodboard Wide"
        class="size-full object-contain landscape:hidden"
      />
    </div>
  </div>
</div>
