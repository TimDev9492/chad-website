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
  import { onMount } from 'svelte';

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

  const intialPhoneCountry =
    countries.find((country) =>
      userInfoState.phone_number?.startsWith(country.country_code),
    ) ?? null;
  const initialPhoneSuffix = userInfoState.phone_number?.slice(
    intialPhoneCountry?.country_code?.length ?? 0,
  );

  let phoneCountry = $state<Country | null>(intialPhoneCountry);
  let phoneSuffix = $state<string | null>(initialPhoneSuffix ?? null);

  const initialAddressCountry =
    countries.find(
      (country) => country.iso_code === residencyAddress.country,
    ) ?? null;
  let addressCountry = $state<Country | null>(initialAddressCountry);

  let imageUpload = $state<HTMLInputElement | null>(null);
  let imageSrc = $state<string | null>(userInfoState.avatar_url);
  let imageCropOpen = $state(false);
  let imageToCrop = $state({
    data: '',
    type: '',
  });

  const minAge = 18;
  let birthDateValue = $state(userInfoState.date_of_birth ?? null);
  let birthDateValid = $derived(
    getAgeByBirthdate(birthDateValue ?? new Date()) >= minAge,
  );

  let initialWard = null;
  for (const stake of stakes) {
    if (initialWard !== null) break;
    for (const ward of stake.wards) {
      if (ward.id === userInfo.ward_id) {
        initialWard = ward;
        break;
      }
    }
  }
  let selectedWard = $state<typeof initialWard | null>(null);
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

  // textfield value states
  let firstName = $state<string | null>(null);
  let lastName = $state<string | null>(null);
  let streetNameAndNumber = $state<string | null>(null);
  let cityName = $state<string | null>(null);
  let postalCode = $state<string | null>(null);

  onMount(() => {
    phoneCountry = intialPhoneCountry;
    addressCountry = initialAddressCountry;

    selectedWard = initialWard;

    firstName = userInfo.first_name;
    lastName = userInfo.last_name;
    streetNameAndNumber = residencyAddress.street_name_and_number;
    cityName = residencyAddress.city;
    postalCode = residencyAddress.postal_code?.toString() ?? null;
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
        imageSrc = `${url}`;
      })
      .catch((error) => {
        console.error(error);
        toastStore.set({ level: 'error', message: error.message });
      });
  }}
/>

<div class="absolute w-full z-10">
  <LinearProgress
    color="secondary"
    indeterminate
    closed={!waitingForResponse}
  />
</div>
<PageFormWrapper>
  <form
    method="POST"
    class="flex flex-col justify-evenly items-center gap-4 portrait:gap-8 min-w-[50vw]"
    use:enhance={(form_element) => {
      // populate form data
      const formData = form_element.formData;
      formData.set('first_name', firstName ?? '');
      formData.set('last_name', lastName ?? '');
      formData.set('gender', userInfoState.gender ?? '');
      formData.set('phone_number', userInfoState.phone_number ?? '');
      formData.set('street_name_and_number', streetNameAndNumber ?? '');
      formData.set('city', cityName ?? '');
      formData.set('postal_code', postalCode?.toString() ?? '');
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
        // if (success) update({ invalidateAll: false });
        toastStore.set({
          level: success ? 'success' : 'error',
          message: (result as any).data?.message,
        });
      };
    }}
  >
    <div class="mdc-typography--headline4">Deine Infos</div>
    <Divider />
    <div
      class="grid grid-cols-[1fr_auto] items-center gap-12 portrait:flex portrait:flex-col portrait:gap-4 portrait:items-center"
    >
      <div class="mdc-typography--overline">Wie siehst du aus?</div>
      <div class="flex justify-center">
        <div class="h-48 relative">
          <img
            class="h-full aspect-[1/1] object-cover object-center rounded-full"
            alt="avatar"
            src={imageSrc}
          />
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <Chip
              chip="uploadChip"
              onclick={() => imageUpload?.click()}
            >
              <LeadingIcon class="material-icons">upload</LeadingIcon>
              <Text tabindex={0}>Hochladen</Text>
            </Chip>
          </div>
          <input
            class="hidden"
            type="file"
            accept="image/*"
            onchange={onImageSelected}
            bind:this={imageUpload}
          />
        </div>
      </div>

      <div class="col-span-2 portrait:w-full portrait:mt-8">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wie heißt du?</div>
      <div class="portrait:flex portrait:flex-col portrait:gap-4">
        <Textfield
          variant="outlined"
          bind:value={firstName}
          label="Vorname"
          disabled={waitingForResponse}
          required
        />
        <Textfield
          variant="outlined"
          bind:value={lastName}
          label="Nachname"
          disabled={waitingForResponse}
          required
        />
      </div>

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Was bist du?</div>
      <GenderSelect
        genders={genders.map((gender) => gender.name)}
        disabled={waitingForResponse}
        bind:selected={userInfoState.gender}
      />

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Was ist deine Handynummer?</div>
      <PhoneNumberInput
        {countries}
        disabled={waitingForResponse}
        bind:selectedCountry={phoneCountry}
        bind:phoneNumber={phoneSuffix}
      />

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wo wohnst du?</div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={streetNameAndNumber}
          label="Straße und Hausnummer"
          disabled={waitingForResponse}
          required
        />

        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={cityName}
          label="Stadt"
          disabled={waitingForResponse}
          required
        />
        <Textfield
          type="number"
          variant="outlined"
          bind:value={postalCode}
          label="Postleitzahl"
          disabled={waitingForResponse}
          required
        />
        <CountrySelect
          disabled={waitingForResponse}
          {countries}
          label="Land"
          bind:selectedCountry={addressCountry}
          displayTransform={(country) =>
            `${country.flag_emoji} ${country.name}`}
        />
      </div>

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wie alt bist du?</div>
      <div>
        <Textfield
          style="width: 100%"
          input$style="width: 100%"
          type="date"
          variant="outlined"
          bind:value={birthDateValue}
          label="Geburtsdatum"
          disabled={waitingForResponse}
          required
          invalid={!birthDateValid}
        >
          {#snippet helper()}
            <HelperText>Du musst midestens {minAge} Jahre alt sein!</HelperText>
          {/snippet}
        </Textfield>
      </div>

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">In welche Gemeinde gehst du?</div>
      <div class="w-full flex portrait:flex-col portrait:items-center">
        <WardSelect
          {stakes}
          bind:value={selectedWard}
          disabled={notAMember || waitingForResponse}
        />
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={notAMember}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich bin kein Mitglied
            </div>
          {/snippet}
        </FormField>
      </div>

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wie sieht es mit Essen aus?</div>
      <div class="w-full flex portrait:flex-col">
        <FoodPreferencesSelect
          disabled={waitingForResponse}
          bind:selectedPreferences={selectedFoodPreferences}
        />
        <FormField class="portrait:mt-24">
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={userInfoState.wants_breakfast}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich esse Frühstück
            </div>
          {/snippet}
        </FormField>
      </div>

      <div class="col-span-2 spacer w-16"></div>

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wo schläfst du?</div>
      <div class="w-full flex portrait:justify-center">
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={userInfoState.needs_place_to_sleep}
          />
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
        disabled={waitingForResponse}
      >
        <Icon class="material-icons">save</Icon>
        <Label>Speichern</Label>
      </Button>
    </div>
  </form>
</PageFormWrapper>
