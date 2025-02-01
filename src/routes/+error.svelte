<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="size-full flex flex-col justify-center items-center">
  <div class="mdc-typography--headline3">Server Error!</div>
  <div class="mdc-typography--headline1">{page.status}</div>
  <div class="mdc-typography--subtitle1">{page.error?.message}</div>
</div>
