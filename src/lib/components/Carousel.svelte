<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import Autoplay from 'embla-carousel-autoplay';
  import type { Snippet } from 'svelte';
  import Ripple from '@smui/ripple';

  let {
    data,
    slide,
    scrollNext = $bindable(() => {}),
    scrollPrev = $bindable(() => {}),
  }: {
    data: any[];
    slide: Snippet<[any]>;
    scrollNext?: () => void;
    scrollPrev?: () => void;
  } = $props();

  let emblaApi: any;
  let options = { loop: true };
  let plugins = [
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    }),
  ];

  function onInit(event: CustomEvent) {
    emblaApi = event.detail;
    scrollNext = emblaApi.scrollNext;
    scrollPrev = emblaApi.scrollPrev;
  }
</script>

<div
  use:emblaCarouselSvelte={{ options, plugins }}
  onemblaInit={onInit}
  class="embla size-full overflow-hidden relative"
>
  <div class="embla__container size-full flex items-center">
    {#each data as item}
      <div class="embla__slide min-w-0 flex-[0_0_100%]">
        {@render slide(item)}
      </div>
    {/each}
  </div>
  <div class="portrait:hidden">
    <button
      onclick={scrollPrev}
      use:Ripple={{ surface: true }}
      class="material-icons absolute rounded-full left-2 top-1/2 -translate-y-1/2 chad-text-heading"
      >chevron_left</button
    >
    <button
      onclick={scrollNext}
      use:Ripple={{ surface: true }}
      class="material-icons absolute rounded-full right-2 top-1/2 -translate-y-1/2 chad-text-heading"
      >chevron_right</button
    >
  </div>
</div>
