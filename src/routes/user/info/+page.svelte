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
  import { onDestroy, onMount } from 'svelte';
  import { avatarStore } from '$lib/avatarStore.js';

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

  /**
   * Constant Variables
   */
  const MIN_AGE = 18;

  type Country = Database['public']['Tables']['countries']['Row'];
  type Ward = { id: number; name: string };

  /**
   * UI States - initialize with `null` and set in onMount to update the UI.
   *
   * State prefixed with `_` gets sent to the server and is used to update the database.
   */
  let _firstName = $state<typeof userInfo.first_name>(null);
  let _lastName = $state<typeof userInfo.last_name>(null);
  let _gender = $state<typeof userInfo.gender>(null);
  let _phoneNumber = $state<{
    country: Country | null;
    suffix: string | null;
  }>({
    country: null,
    suffix: null,
  });
  let _streetNameAndNumber =
    $state<typeof residencyAddress.street_name_and_number>(null);
  let _cityName = $state<typeof residencyAddress.city>(null);
  let _postalCode = $state<string | null>(null);
  let _countryOfResidency = $state<Country | null>(null);
  let _dateOfBirth = $state<typeof userInfo.date_of_birth>(null);
  let _ward = $state<Ward | null>(null);
  let _foodPreferences = $state<string[]>(foodPreferences);
  let _wantsBreakfast = $state<boolean | null>(null);
  let _needsPlaceToSleep = $state<boolean | null>(null);

  // parse initial states from database values
  // phone
  const intialPhoneCountry =
    countries.find((country) =>
      userInfo.phone_number?.startsWith(country.country_code),
    ) ?? null;
  const initialPhoneSuffix =
    userInfo.phone_number?.slice(
      intialPhoneCountry?.country_code?.length ?? 0,
    ) ?? null;
  // country of residency
  const initialAddressCountry =
    countries.find(
      (country) => country.iso_code === residencyAddress.country,
    ) ?? null;
  // ward
  const initialWard: Ward | null =
    stakes
      .map((stake) => stake.wards)
      .flat()
      .find((ward) => ward.id === userInfo.ward_id) ?? null;

  /**
   * Page States
   */
  // request loading
  let waitingForResponse = $state(false);
  // image cropping
  let imageUpload = $state<HTMLInputElement | null>(null);
  let imageSrc = $state<string | null>(userInfo.avatar_url);
  let imageCropOpen = $state(false);
  let imageToCrop = $state({
    data: '',
    type: '',
  });
  // birth data validation
  let birthDateValid = $derived(
    _dateOfBirth == null ? false : getAgeByBirthdate(_dateOfBirth) >= MIN_AGE,
  );
  // ward selection
  let notAMember = $state(userInfo.ward_id == null);

  let unsubscribe: () => void | null;
  onMount(() => {
    // set initial state values
    _firstName = userInfo.first_name;
    _lastName = userInfo.last_name;
    _gender = userInfo.gender;
    _phoneNumber = {
      country: intialPhoneCountry,
      suffix: initialPhoneSuffix,
    };
    _streetNameAndNumber = residencyAddress.street_name_and_number;
    _cityName = residencyAddress.city;
    _postalCode = residencyAddress.postal_code?.toString() ?? null;
    _countryOfResidency = initialAddressCountry;
    _dateOfBirth = userInfo.date_of_birth;
    _ward = initialWard;
    _foodPreferences = foodPreferences;
    _wantsBreakfast = userInfo.wants_breakfast;
    _needsPlaceToSleep = userInfo.needs_place_to_sleep;

    // update avatar image
    unsubscribe = avatarStore.subscribe((newAvatar) => {
      imageSrc = newAvatar;
    })
  });

  onDestroy(() => unsubscribe && unsubscribe());

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
        avatarStore.set(url);
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
      formData.set('first_name', _firstName ?? '');
      formData.set('last_name', _lastName ?? '');
      formData.set('gender', _gender ?? '');
      formData.set(
        'phone_number',
        `${_phoneNumber.country?.country_code}${_phoneNumber.suffix}`,
      );
      formData.set('street_name_and_number', _streetNameAndNumber ?? '');
      formData.set('city', _cityName ?? '');
      formData.set('postal_code', _postalCode ?? '');
      formData.set('country', _countryOfResidency?.iso_code ?? '');
      formData.set('date_of_birth', _dateOfBirth ?? '');
      formData.set('ward_id', `${notAMember ? null : _ward?.id}`);
      formData.set('food_preferences', JSON.stringify(_foodPreferences));
      formData.set('wants_breakfast', `${_wantsBreakfast}`);
      formData.set('needs_place_to_sleep', `${_needsPlaceToSleep}`);

      waitingForResponse = true;

      return async ({ result, update }) => {
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
          bind:value={_firstName}
          label="Vorname"
          disabled={waitingForResponse}
          required
        />
        <Textfield
          variant="outlined"
          bind:value={_lastName}
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
        bind:selected={_gender}
      />

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Was ist deine Handynummer?</div>
      <PhoneNumberInput
        {countries}
        disabled={waitingForResponse}
        bind:selectedCountry={_phoneNumber.country}
        bind:phoneNumber={_phoneNumber.suffix}
      />

      <div class="col-span-2 portrait:w-full">
        <Divider />
      </div>

      <div class="mdc-typography--overline">Wo wohnst du?</div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={_streetNameAndNumber}
          label="Straße und Hausnummer"
          disabled={waitingForResponse}
          required
        />

        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={_cityName}
          label="Stadt"
          disabled={waitingForResponse}
          required
        />
        <Textfield
          type="number"
          variant="outlined"
          bind:value={_postalCode}
          label="Postleitzahl"
          disabled={waitingForResponse}
          required
        />
        <CountrySelect
          disabled={waitingForResponse}
          {countries}
          label="Land"
          bind:selectedCountry={_countryOfResidency}
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
          bind:value={_dateOfBirth}
          label="Geburtsdatum"
          disabled={waitingForResponse}
          required
          invalid={!birthDateValid}
        >
          {#snippet helper()}
            <HelperText>Du musst midestens {MIN_AGE} Jahre alt sein!</HelperText
            >
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
          bind:value={_ward as any}
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
          bind:selectedPreferences={_foodPreferences}
        />
        <FormField class="portrait:mt-24">
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={_wantsBreakfast}
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
            bind:checked={_needsPlaceToSleep}
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
