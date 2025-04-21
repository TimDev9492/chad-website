<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import Switch from '@smui/switch';
  import LinearProgress from '@smui/linear-progress';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { raiseToast } from '$lib/toastStore';

  let {
    supabase,
    publicId,
    open = $bindable(false),
    wantsToProvide = $bindable(true),
    fromLocation = $bindable(''),
    toLocation = $bindable(''),
    fromSeats = $bindable(null),
    toSeats = $bindable(null),
    contactDetails = $bindable(''),
    refreshData = async () => {},
  }: {
    supabase: SupabaseClient;
    publicId: string;
    open: boolean;
    wantsToProvide?: boolean;
    fromLocation?: string;
    toLocation?: string;
    fromSeats?: number | null;
    toSeats?: number | null;
    contactDetails?: string;
    refreshData?: () => Promise<void>;
  } = $props();

  $effect(() => {
    if (!fromLocation) fromSeats = null;
    if (!toLocation) toSeats = null;
  });

  let loading = $state(false);

  const addEntry = async () => {
    loading = true;

    // check if data is valid
    if (!contactDetails) {
      raiseToast({
        level: 'error',
        message: 'Bitte gib deine Kontaktdaten an.',
      });
      loading = false;
      return;
    }

    let locationFilledIn = false;

    if (fromLocation) {
      locationFilledIn = true;
      if (!fromSeats || !(fromSeats > 0 && fromSeats < 10)) {
        raiseToast({
          level: 'error',
          message: 'Bitte gib eine gültige Anzahl an Plätzen an.',
        });
        loading = false;
        return;
      }
    }
    if (toLocation) {
      locationFilledIn = true;
      if (!toSeats || !(toSeats > 0 && toSeats < 10)) {
        raiseToast({
          level: 'error',
          message: 'Bitte gib eine gültige Anzahl an Plätzen an.',
        });
        loading = false;
        return;
      }
    }

    if (!locationFilledIn) {
      raiseToast({
        level: 'error',
        message: 'Du musst einen Abfahrts- oder einen Ankunftsort angeben!',
      });
      loading = false;
      return;
    }

    const { error } = await supabase.from('ride_sharing').upsert([
      {
        public_id: publicId,
        is_providing: wantsToProvide,
        from: fromLocation || null,
        from_seat_amount: fromSeats || null,
        to: toLocation || null,
        to_seat_amount: toSeats || null,
        contact_details: contactDetails,
      },
    ]);
    if (error) {
      console.error(error);
      raiseToast({
        level: 'error',
        message: 'Fehler beim Speichern der Mitfahrgelegenheit.',
      });
      loading = false;
      return;
    }

    await refreshData();
    loading = false;
    open = false;

    raiseToast({
      level: 'success',
      message: 'Mitfahrgelegenheit erfolgreich gespeichert.',
    });
  };
</script>

<div class="">
  <Dialog
    bind:open
    aria-labelledby="Mitfahrgelegenheit eintragen"
    aria-describedby="Mitfahrgelegenheit eintragen"
    class="z-[500]"
  >
    <LinearProgress
      indeterminate
      closed={!loading}
      aria-label="Lädt..."
    />
    <Title>Mitfahrgelgenheit anbieten</Title>
    <Content>
      <form class="flex flex-col items-center gap-4 p-2">
        <!-- <div class="flex justify-center items-center">
          <span
            class={'text-center chad-text-base ' +
              (wantsToProvide || loading ? 'text-gray-500' : 'text-black')}
            >Ich will mitfahren</span
          >
          <Switch
            disabled={loading}
            bind:checked={wantsToProvide}
            icons={false}
          />
          <span
            class={'text-center chad-text-base ' +
              (!wantsToProvide || loading ? 'text-gray-500' : 'text-black')}
            >Ich kann mitnehmen</span
          >
        </div> -->
        <div class="flex gap-2">
          <Textfield
            disabled={loading}
            bind:value={fromLocation}
            label="Hinfahrt aus"
            variant="outlined"
          />
          <Textfield
            disabled={loading}
            bind:value={fromSeats}
            label="Anzahl Plätze"
            variant="outlined"
            type="number"
          />
        </div>
        <div class="flex gap-2">
          <Textfield
            disabled={loading}
            bind:value={toLocation}
            label="Rückfahrt nach"
            variant="outlined"
          />
          <Textfield
            disabled={loading}
            bind:value={toSeats}
            label="Anzahl Plätze"
            variant="outlined"
            type="number"
          />
        </div>
        <div>
          <Textfield
            disabled={loading}
            bind:value={contactDetails}
            label="Kontakt"
            variant="outlined"
            required
          >
            {#snippet helper()}
              <HelperText persistent
                >Wie sollen dich Leute kontaktieren?</HelperText
              >
            {/snippet}
          </Textfield>
        </div>
        <Button
          onclick={(e: MouseEvent) => {
            e.preventDefault();
            addEntry();
          }}
          disabled={loading}
          color="primary"
          variant="raised"
        >
          <Label>Speichern</Label>
        </Button>
      </form>
    </Content>
    <Actions>
      <Button>
        <Label>Schließen</Label>
      </Button>
    </Actions>
  </Dialog>
</div>
