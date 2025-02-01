<script lang="ts">
  import {
    getAgeByBirthdate,
    isHttpSuccess,
    disabledText,
  } from '$lib/utils.js';
  import { applyAction, enhance } from '$app/forms';
  import Divider from '$lib/components/Divider.svelte';
  import { toastStore } from '$lib/toastStore';
  import PageFormWrapper from '$lib/components/PageFormWrapper.svelte';
  import type { Database } from '../../../types/database.types.js';
  import Textfield from '@smui/textfield';
  import GenderSelect from '$lib/components/GenderSelect.svelte';
  import PhoneNumberInput from '$lib/components/PhoneNumberInput.svelte';
  import CountrySelect from '$lib/components/CountrySelect.svelte';
  import { uploadAvatar } from '$lib/avatarUpload.js';
  import Chip, { LeadingIcon, Text } from '@smui/chips';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';

  // image cropping
  import ImageCropDialog from '$lib/components/ImageCropDialog.svelte';
  import HelperText from '@smui/textfield/helper-text';
  import WardSelect from '$lib/components/WardSelect.svelte';
  import FoodPreferencesSelect from '$lib/components/FoodPreferencesSelect.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import LinearProgress from '@smui/linear-progress';

  let { data } = $props();
  let {
    user,
    userInfo,
    genders,
    countries,
    stakes,
    foodPreferences,
    residencyAddress,
    supabase,
  } = $derived(data);

  type Country = Database['public']['Tables']['countries']['Row'];

  let waitingForResponse = $state(false);

  let userInfoState =
    $state<Database['public']['Tables']['user_infos']['Row']>(userInfo);
  let addressState = $state(residencyAddress);
  let phoneCountry = $state<Country | null>(null);
  let phoneSuffix = $state<string | null>('');

  let addressCountry = $state<Country | null>(null);

  let imageUpload = $state<HTMLInputElement | null>(null);

  let imageSrc = $state<string | null>(userInfoState.avatar_url);

  let imageCropOpen = $state(false);
  let imageToCrop = $state({
    data: '',
    type: '',
  });

  const minAge = 18;
  let birthDateValue = $state(null);
  let birthDateValid = $derived(
    getAgeByBirthdate(birthDateValue ?? new Date()) >= minAge,
  );

  let selectedWard = $state(null);
  let notAMember = $state(userInfo.ward_id == null);

  let selectedFoodPreferences = $state<string[]>(foodPreferences);

  $effect(() => {
    userInfoState.phone_number =
      (phoneCountry?.country_code ?? '') + (phoneSuffix ?? '');
  });
  $effect(() => {
    addressState.country = addressCountry?.iso_code ?? null;
  });
  $effect(() => {
    if (birthDateValue)
      userInfoState.date_of_birth = new Date(birthDateValue)
        .toISOString()
        .split('T')[0];
  });
  $effect(() => {
    if (notAMember) userInfoState.ward_id = null;
    else userInfoState.ward_id = (selectedWard as any)?.id ?? null;
  });

  const onImageSelected = (e: any) => {
    let image = e.target.files[0];
    if (!image) return;
    let reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (typeof data === 'string') {
        // data is data url
        imageToCrop = { data, type: image.type };
        imageCropOpen = true;
      }
    };
    reader.readAsDataURL(image);
  };
</script>

<ImageCropDialog
  bind:open={imageCropOpen}
  bind:image={imageToCrop.data}
  imageType={imageToCrop.type}
  aspect={1}
  cropShape="round"
  onimagecropped={(croppedDataUrl, mimeType) => {
    uploadAvatar(croppedDataUrl, mimeType, supabase, user!.id)
      .then(({ message, url }) => {
        toastStore.set({ level: 'success', message });
        userInfoState.avatar_url = url;
        imageSrc = `${url}?t=${Date.now()}`;
      })
      .catch((error) => {
        console.error(error);
        toastStore.set({ level: 'error', message: error.message });
      });
  }} />

<div class="absolute w-full z-10">
  <LinearProgress
    color="secondary"
    indeterminate
    closed={!waitingForResponse} />
</div>
<PageFormWrapper>
  <form
    method="POST"
    class="flex flex-col justify-evenly items-center gap-4 portrait:gap-8 min-w-[50vw]"
    use:enhance={(form_element) => {
      // populate form data
      const formData = form_element.formData;
      formData.set('first_name', userInfoState.first_name ?? '');
      formData.set('last_name', userInfoState.last_name ?? '');
      formData.set('gender', userInfoState.gender ?? '');
      formData.set('phone_number', userInfoState.phone_number ?? '');
      formData.set(
        'street_name_and_number',
        addressState.street_name_and_number ?? '',
      );
      formData.set('city', addressState.city ?? '');
      formData.set('postal_code', addressState.postal_code?.toString() ?? '');
      formData.set('country', addressState.country ?? '');
      formData.set('date_of_birth', userInfoState.date_of_birth ?? '');
      formData.set('ward_id', `${userInfoState.ward_id}`);
      formData.set('food_preferences', JSON.stringify(selectedFoodPreferences));
      formData.set('wants_breakfast', `${userInfoState.wants_breakfast}`);
      formData.set(
        'needs_place_to_sleep',
        `${userInfoState.needs_place_to_sleep}`,
      );

      waitingForResponse = true;

      return async ({ result, update }) => {
        // waitingForResponse = false;
        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
        waitingForResponse = false;
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
            src={imageSrc} />
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <Chip
              chip="uploadChip"
              onclick={() => imageUpload?.click()}>
              <LeadingIcon class="material-icons">upload</LeadingIcon>
              <Text tabindex={0}>Hochladen</Text>
            </Chip>
          </div>
          <input
            class="hidden"
            type="file"
            accept="image/*"
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
          disabled={waitingForResponse}
          required />
        <Textfield
          variant="outlined"
          bind:value={userInfoState.last_name}
          label="Nachname"
          disabled={waitingForResponse}
          required />
      </div>

      <div class="mdc-typography--overline">Was bist du?</div>
      <GenderSelect
        genders={genders.map((gender) => gender.name)}
        disabled={waitingForResponse}
        bind:selected={userInfoState.gender} />

      <div class="mdc-typography--overline">Was ist deine Handynummer?</div>
      <PhoneNumberInput
        {countries}
        disabled={waitingForResponse}
        bind:selectedCountry={phoneCountry}
        bind:phoneNumber={phoneSuffix} />

      <div class="mdc-typography--overline">Wo wohnst du?</div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={addressState.street_name_and_number}
          label="Straße und Hausnummer"
          disabled={waitingForResponse}
          required />

        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={addressState.city}
          label="Stadt"
          disabled={waitingForResponse}
          required />
        <Textfield
          type="number"
          variant="outlined"
          bind:value={addressState.postal_code}
          label="Postleitzahl"
          disabled={waitingForResponse}
          required />
        <CountrySelect
          disabled={waitingForResponse}
          {countries}
          label="Land"
          bind:selectedCountry={addressCountry}
          displayTransform={(country) =>
            `${country.flag_emoji} ${country.name}`} />
      </div>

      <div class="mdc-typography--overline">Wie alt bist du?</div>
      <div>
        <Textfield
          type="date"
          variant="outlined"
          bind:value={birthDateValue}
          label="Geburtsdatum"
          disabled={waitingForResponse}
          required
          invalid={!birthDateValid}>
          {#snippet helper()}
            <HelperText>Du musst midestens {minAge} Jahre alt sein!</HelperText>
          {/snippet}
        </Textfield>
      </div>

      <div class="mdc-typography--overline">In welche Gemeinde gehst du?</div>
      <div class="w-full flex">
        <WardSelect
          {stakes}
          bind:selected={selectedWard}
          disabled={notAMember || waitingForResponse} />
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={notAMember} />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich bin kein Mitglied
            </div>
          {/snippet}
        </FormField>
      </div>

      <div class="mdc-typography--overline">Wie sieht es mit Essen aus?</div>
      <div class="w-full flex">
        <FoodPreferencesSelect
          disabled={waitingForResponse}
          bind:selectedPreferences={selectedFoodPreferences} />
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={userInfoState.wants_breakfast} />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich esse Frühstück
            </div>
          {/snippet}
        </FormField>
      </div>

      <div class="col-span-2 spacer w-16"></div>

      <div class="mdc-typography--overline">Wo schläfst du?</div>
      <div class="w-full flex">
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={userInfoState.needs_place_to_sleep} />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich brauche eine Übernachtungsmöglichkeit
            </div>
          {/snippet}
        </FormField>
      </div>
    </div>
    <Divider />
    <div class="save col-span-2 flex justify-center items-center my-4">
      <Button
        variant="raised"
        color="primary"
        disabled={waitingForResponse}>
        <Icon class="material-icons">save</Icon>
        <Label>Speichern</Label>
      </Button>
    </div>
  </form>
</PageFormWrapper>
