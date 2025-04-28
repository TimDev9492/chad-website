<script lang="ts">
  import { navigating } from '$app/state';
</script>

<div class="size-full flex justify-center items-center p-4">
  <div class="w-full max-w-screen-sm flex justify-center items-center">
    <div class="chad-card chad-shadow flex flex-col items-center">
      <img
        class="select-none landscape:h-[30vh] portrait:w-[40vw]"
        src="/images/construction-fence.jpg"
        alt="Coming soon"
      />
      <span class="rich-font chad-text-lg mt-8">Noch nicht verfügbar!</span>
      <span class="chad-text-sm text-balance text-center"
        >Diese Seite ist noch nicht fertig. Probier es in ein paar Tagen nochmal
        aus!</span
      >
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a
        class="chad-text-base mt-4 text-blue-400"
        href="javascript:history.back()">Zurück</a
      >
    </div>
  </div>
</div>
