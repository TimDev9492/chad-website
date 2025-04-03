<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="size-full flex justify-center items-center">
  <div class="chad-card chad-shadow flex flex-col items-center gap-2">
    <div class="chad-text-subheading mb-2">Es ist etwas schiefgelaufen!</div>
    <div class="chad-text-giga chad-typography-gradient font-extrabold">
      {page.status}
    </div>
    <code class="chad-text-lg">{page.error?.message}</code>
  </div>
</div>
