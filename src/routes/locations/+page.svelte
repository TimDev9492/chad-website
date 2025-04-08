<script lang="ts">
  import { type Snippet } from 'svelte';
</script>

<div class="size-full flex flex-col items-center p-8">
  <div
    class="w-full flex flex-col items-center gap-4 landscape:gap-8 max-w-screen-2xl"
  >
    <span class="uppercase rich-font chad-text-heading chad-typography-gradient"
      >Anreise</span
    >
    <div
      class="flex w-full justify-center gap-8 portrait:flex-col portrait:items-center"
    >
      {@render locationWidget(
        'Gemeindehaus Friedrichsdorf',
        'Talstraße 12, 61381 Friedrichsdorf',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5101.499268708192!2d8.638745676913583!3d50.25926017155633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd073c6993edfd%3A0x5f6ba5d5e56aa951!2sKirche%20Jesu%20Christi%20der%20Heiligen%20der%20Letzten%20Tage!5e0!3m2!1sde!2sde!4v1744116168209!5m2!1sde!2sde',
      )}
      {@render locationWidget(
        'B&B Hotel Bad Homburg',
        'Horexstraße 26, 61352 Bad Homburg vor der Höhe',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2552.8718061896834!2d8.618106076911557!3d50.21961597154907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd0795fd35492b%3A0x704912c57b9f2392!2sB%26B%20HOTEL%20Bad%20Homburg!5e0!3m2!1sde!2sde!4v1744119104918!5m2!1sde!2sde',
      )}
    </div>
  </div>
</div>

{#snippet locationWidget(title: string, address: string, iframeSrc: string)}
  <div
    class="portrait:w-full grid grid-cols-1 justify-items-center portrait:items-center"
  >
    <span class="font-bold chad-text-lg">{title}</span>
    <span class="italic chad-text-base">{address}</span>
    <div class="w-full flex justify-center">
      <iframe
        class="chad-shadow maps-iframe flex-1"
        {title}
        src={iframeSrc}
        style="border:0;"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
{/snippet}

<style>
  .maps-iframe {
    aspect-ratio: 1 / 1;
    @media (orientation: landscape) {
      height: 60vh;
      max-width: min(100%, 60vh);
    }
    @media (orientation: portrait) {
      width: 100%;
    }
  }
</style>
