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
  let autoplayPlugin = Autoplay({
    delay: 3000,
    stopOnInteraction: true,
  });
  let plugins = [autoplayPlugin];

  function onInit(event: CustomEvent) {
    emblaApi = event.detail;
    scrollNext = emblaApi.scrollNext;
    scrollPrev = emblaApi.scrollPrev;
  }
</script>

<div class="size-full relative">
  <div
    use:emblaCarouselSvelte={{ options, plugins }}
    onemblaInit={onInit}
    class="embla overflow-hidden landscape:mx-8"
  >
    <div class="embla__container size-full flex items-center">
      {#each data as item}
        <div class="embla__slide min-w-0 flex-[0_0_100%]">
          {@render slide(item)}
        </div>
      {/each}
    </div>
  </div>
  <div>
    <button
      onclick={() => {
        autoplayPlugin.stop();
        scrollPrev();
      }}
      use:Ripple={{ surface: true }}
      class="material-icons absolute rounded-full portrait:left-2 landscape:right-[calc(100%-2rem)] top-1/2 -translate-y-1/2 chad-text-heading"
      >chevron_left</button
    >
    <button
      onclick={() => {
        autoplayPlugin.stop();
        scrollNext();
      }}
      use:Ripple={{ surface: true }}
      class="material-icons absolute rounded-full portrait:right-2 landscape:left-[calc(100%-2rem)] top-1/2 -translate-y-1/2 chad-text-heading"
      >chevron_right</button
    >
  </div>
</div>
