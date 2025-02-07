<script lang="ts">
  let { src, alt } = $props();
</script>

<img
  class="w-full h-auto aspect-square object-cover rounded-full relative"
  {src}
  {alt}
/>
