<script lang="ts">
  import TopAppBar, {
    Row,
    Section,
    Title,
    AutoAdjust,
  } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';

  let { smuiBar = $bindable() } = $props();
</script>

<TopAppBar
  bind:this={smuiBar}
  variant="fixed">
  <Row>
    <Section>
      <IconButton class="material-icons">menu</IconButton>
      <Title>Fixed</Title>
    </Section>
    <Section>
      <div class="flex justify-center items-center size-full">
        <Title class="p-0">Title</Title>
      </div>
    </Section>
    <Section
      align="end"
      toolbar>
      <IconButton
        class="material-icons"
        aria-label="Download">file_download</IconButton>
      <IconButton
        class="material-icons"
        aria-label="Print this page">print</IconButton>
      <IconButton
        class="material-icons"
        aria-label="Bookmark this page">bookmark</IconButton>
    </Section>
  </Row>
</TopAppBar>
