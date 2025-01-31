<script lang="ts">
  import Card from '@smui/card';
</script>

<div class="w-full min-h-full flex justify-center items-center">
  <div class="card-container max-w-[80vw]">
    <Card
      variant="outlined"
      padded>
      <slot></slot>
    </Card>
  </div>
</div>
