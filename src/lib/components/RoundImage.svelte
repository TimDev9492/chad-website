<script lang="ts">
  let { src, alt } = $props();
</script>

<img
  class="w-full max-w-full max-h-full aspect-square object-cover rounded-full relative"
  {src}
  {alt}
/>
