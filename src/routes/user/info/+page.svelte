<script lang="ts">
  import { isHttpSuccess, isValidEmailAddress } from '$lib/utils.js';
  import { applyAction, enhance } from '$app/forms';
  import LinearProgress from '@smui/linear-progress';
  import Divider from '$lib/components/Divider.svelte';
  import { toastStore } from '$lib/toastStore';
  import PageFormWrapper from '$lib/components/PageFormWrapper.svelte';
  import type { Database } from '../../../types/database.types.js';
  import Textfield from '@smui/textfield';
  import GenderSelect from '$lib/components/GenderSelect.svelte';
  import PhoneNumberInput from '$lib/components/PhoneNumberInput.svelte';
  import CountrySelect from '$lib/components/CountrySelect.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import { uploadAvatar } from '$lib/avatarUpload.js';

  let { data } = $props();
  let { user, userInfo, genders, countries, residencyAddress, supabase } =
    $derived(data);

  type Country = Database['public']['Tables']['countries']['Row'];

  let userInfoState =
    $state<Database['public']['Tables']['user_infos']['Row']>(userInfo);
  let addressState = $state(residencyAddress);
  let phoneCountry = $state<Country | null>(null);
  let phoneSuffix = $state<string | null>('');

  let addressCountry = $state<Country | null>(null);

  let imageUpload = $state<HTMLInputElement | null>(null);

  $effect(() => {
    userInfoState.phone_number =
      (phoneCountry?.country_code ?? '') + (phoneSuffix ?? '');
  });
  $effect(() => {
    addressState.country = addressCountry?.iso_code ?? null;
  });

  const onImageSelected = (e: any) => {
    let image = e.target.files[0];
    uploadAvatar(image, supabase, user!.id)
      .then(({ message, url }) => {
        toastStore.set({ level: 'success', message });
        userInfoState.avatar_url = url;
      })
      .catch((error) => {
        console.error(error);
        toastStore.set({ level: 'error', message: error });
      });
  };
</script>

<PageFormWrapper>
  <form
    method="POST"
    class="flex flex-col justify-evenly items-center gap-4 portrait:gap-8 min-w-[50vw]"
    use:enhance={() => {
      // waitingForResponse = true;

      return async ({ result, update }) => {
        // waitingForResponse = false;
        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
        await applyAction(result);
        if (!result.status) return;
        const success: boolean = isHttpSuccess(result.status);
        if (success) update({ invalidateAll: true });
        toastStore.set({
          level: success ? 'success' : 'error',
          message: (result as any).data?.message,
        });
      };
    }}>
    <div class="mdc-typography--headline4">Deine Infos</div>
    <Divider />
    <div class="grid grid-cols-[1fr_auto] items-center gap-12">
      <div class="mdc-typography--overline">Wie siehst du aus?</div>
      <div class="flex justify-center">
        <div class="h-48 relative">
          <img
            class="h-full aspect-[1/1] object-cover object-center rounded-full"
            alt="avatar"
            src={userInfoState.avatar_url} />
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <Button
              variant="raised"
              color="secondary"
              onclick={() => imageUpload?.click()}>
              <Icon class="material-icons">upload</Icon>
              <Label>Hochladen</Label>
            </Button>
          </div>
          <input
            class="hidden"
            type="file"
            accept="image/"
            onchange={onImageSelected}
            bind:this={imageUpload} />
        </div>
      </div>

      <div class="mdc-typography--overline">Wie heißt du?</div>
      <div>
        <Textfield
          variant="outlined"
          bind:value={userInfoState.first_name}
          label="Vorname"
          required />
        <Textfield
          variant="outlined"
          bind:value={userInfoState.last_name}
          label="Nachname"
          required />
      </div>

      <div class="mdc-typography--overline">Was bist du?</div>
      <GenderSelect
        genders={genders.map((gender) => gender.name)}
        bind:selected={userInfoState.gender} />

      <div class="mdc-typography--overline">Was ist deine Handynummer?</div>
      <PhoneNumberInput
        {countries}
        bind:selectedCountry={phoneCountry}
        bind:phoneNumber={phoneSuffix} />

      <div class="mdc-typography--overline">Wo wohnst du?</div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={addressState.street_name_and_number}
          label="Straße und Hausnummer"
          required />

        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={addressState.city}
          label="Stadt"
          required />
        <Textfield
          type="number"
          variant="outlined"
          bind:value={addressState.postal_code}
          label="Postleitzahl"
          required />
        <CountrySelect
          {countries}
          label="Land"
          bind:selectedCountry={addressCountry}
          displayTransform={(country) =>
            `${country.flag_emoji} ${country.name}`} />
      </div>
    </div>
  </form>
</PageFormWrapper>
