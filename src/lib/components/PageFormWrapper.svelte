<script lang="ts">
  let { children } = $props();
</script>

<div class="w-[100vw] min-h-full flex justify-center items-center py-4 px-8">
  <div class="card-container max-w-[90vw] w-96">
    <div class="chad-card chad-shadow">
      <!-- <Card
        variant="outlined"
        padded
      > -->
      {@render children()}
      <!-- </Card> -->
    </div>
  </div>
</div>
