<script>
  import Button, { Icon } from '@smui/button';
  import Card, { Content } from '@smui/card';
  import { toastStore } from '$lib/toastStore';
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import LinearProgress from '@smui/linear-progress';

  let { data } = $props();
  let { session } = $derived(data);

  let excelLoading = $state(false);

  const fetchExcelTriggerDownload = async () => {
    const response = await fetch(
      `${PUBLIC_SUPABASE_URL}/functions/v1/create-participant-excel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      },
    );
    if (!response.ok) {
      const { message } = await response.json();
      toastStore.set({
        level: 'error',
        message: `${message} (${response.status})`,
      });
      return;
    }
    const blob = await response.blob();

    // download excel file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chad-tagung-teilnehmer.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
</script>

<div class="absolute w-full z-10">
  <LinearProgress
    color="secondary"
    indeterminate
    closed={!excelLoading}
  />
</div>
<div class="size-full flex justify-center items-center">
  <Card variant="outlined">
    <Content class="flex flex-col items-center gap-4">
      <div class="mdc-typography--headline6">Teilnehmerliste herunterladen</div>
      <Button
        disabled={excelLoading}
        onclick={async () => {
          excelLoading = true;
          await fetchExcelTriggerDownload();
          excelLoading = false;
        }}
        variant="raised"
        color="secondary"
      >
        <Icon class="material-icons">download</Icon>Herunterladen</Button
      >
    </Content>
  </Card>
</div>
