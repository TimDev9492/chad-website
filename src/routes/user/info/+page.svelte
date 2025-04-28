<script lang="ts">
  import {
    getAgeByBirthdate,
    isHttpSuccess,
    disabledText,
  } from '$lib/utils.js';
  import { applyAction, enhance } from '$app/forms';
  import { raiseToast, toastStore } from '$lib/toastStore';
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
  import Ripple from '@smui/ripple';
  import type { BreakfastPreferences } from '../../../app.js';
  import Select, { Option } from '@smui/select';
  import ParticipantBar from '$lib/components/ParticipantBar.svelte';
  import { openDialog } from '$lib/dialogStore.js';
  import { goto } from '$app/navigation';

  let { data } = $props();
  const {
    userAppData,
    countries,
    stakes,
    genders,
    accomodations,
    meansOfTransport,
    defaultAvatarUrl,
  } = data;
  let { supabase, hasPaid } = $derived(data);

  /**
   * Constant Variables
   */
  const MIN_AGE = 18;
  const CUSTOM_PROFILE_PICTURE_REQUIRED = true;

  type Country = Database['public']['Tables']['countries']['Row'];
  type Ward = { id: number; name: string };
  type Accomodation = Database['public']['Tables']['accomodations']['Row'];

  /**
   * UI States - initialize with `null` and set in onMount to update the UI.
   *
   * State prefixed with `_` gets sent to the server and is used to update the database.
   */
  let _firstName = $state<typeof userAppData.first_name>(null);
  let _lastName = $state<typeof userAppData.last_name>(null);
  let _gender = $state<string | null>(null);
  let _phoneNumber = $state<{
    country: Country | null;
    suffix: string | null;
  }>({
    country: null,
    suffix: null,
  });
  let _streetNameAndNumber =
    $state<typeof userAppData.residential_address.street_name_and_number>(null);
  let _cityName =
    $state<typeof userAppData.residential_address.city_name>(null);
  let _postalCode = $state<string | null>(null);
  let _countryOfResidency = $state<Country | null>(null);
  let _dateOfBirth = $state<typeof userAppData.date_of_birth>(null);
  let _ward = $state<Ward | null>(null);
  let _foodPreferences = $state<string[]>(
    userAppData.food_preferences?.map((pref) => pref.description) ?? [],
  );
  let _breakfastPreferences = $state<BreakfastPreferences>({
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
  });
  let _accomodation = $state<Accomodation | null>(null);
  let _roomMatePreferences = $state<string | null>(null);
  let _modeOfTransport = $state<string | null>(null);
  let _hasDeutschlandTicket = $state<boolean>(false);
  let _wantsToVisitTemple = $state<boolean>(false);
  let _hasEndowment = $state<boolean>(false);
  let _isTempleStaff = $state<boolean>(false);
  let _wantsToProvideTempleStaff = $state<boolean>(false);
  let _wantsToAttendBaptism = $state<boolean>(false);
  let _agreesToRecordings = $state<boolean>(false);
  let _otherRemarks = $state<string | null>(null);

  // parse initial states from database values
  // phone
  const intialPhoneCountry =
    countries.find((country) =>
      userAppData.phone_number?.startsWith(country.country_code),
    ) ?? null;
  const initialPhoneSuffix =
    userAppData.phone_number?.slice(
      intialPhoneCountry?.country_code?.length ?? 0,
    ) ?? null;
  // country of residency
  const initialAddressCountry =
    countries.find(
      (country) =>
        country.iso_code === userAppData.residential_address.country_iso,
    ) ?? null;
  // ward
  const initialWard: Ward | null =
    stakes
      .map((stake) => stake.wards)
      .flat()
      .find((ward) => ward.id === userAppData.ward_id) ?? null;
  const initialAccomodation: Accomodation | null =
    accomodations.find(
      (accomodation) => accomodation.name === userAppData.accomodation,
    ) ?? null;

  /**
   * Page States
   */
  // request loading
  let waitingForResponse = $state(false);
  // image cropping
  let imageUpload = $state<HTMLInputElement | null>(null);
  let imageSrc = $state<string | null>(userAppData.avatar_url ?? null);
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
  let notAMember = $state(
    userAppData.phone_number !== null && userAppData.ward_id == null,
  );

  let unsubscribe: () => void | null;
  onMount(() => {
    // set initial state values
    _firstName = userAppData.first_name;
    _lastName = userAppData.last_name;
    _gender = userAppData.gender ?? null;
    _phoneNumber = {
      country: intialPhoneCountry,
      suffix: initialPhoneSuffix,
    };
    _streetNameAndNumber =
      userAppData.residential_address.street_name_and_number;
    _cityName = userAppData.residential_address.city_name;
    _postalCode =
      userAppData.residential_address.postal_code?.toString() ?? null;
    _countryOfResidency = initialAddressCountry;
    _dateOfBirth = userAppData.date_of_birth;
    _ward = initialWard;
    _foodPreferences =
      userAppData.food_preferences?.map((pref) => pref.description) ?? [];
    if (userAppData.breakfast_preferences)
      _breakfastPreferences = userAppData.breakfast_preferences;
    _accomodation = initialAccomodation;
    _roomMatePreferences = userAppData.room_mate_preferences ?? '';
    _modeOfTransport = userAppData.mode_of_transport ?? null;
    _hasDeutschlandTicket = userAppData.has_deutschland_ticket ?? false;
    _wantsToVisitTemple = userAppData.wants_to_visit_temple ?? false;
    _hasEndowment = userAppData.has_endowment ?? false;
    _isTempleStaff = userAppData.is_temple_staff ?? false;
    _wantsToProvideTempleStaff =
      userAppData.wants_to_provide_temple_staff ?? false;
    _wantsToAttendBaptism = userAppData.wants_to_attend_baptism ?? false;
    _agreesToRecordings = userAppData.agrees_to_recordings ?? false;
    _otherRemarks = userAppData.other_remarks ?? null;

    // update avatar image
    unsubscribe = avatarStore.subscribe((newAvatar) => {
      imageSrc = newAvatar;
    });
  });

  $effect(() => {
    if (!_isTempleStaff) _wantsToProvideTempleStaff = false;
  });

  onDestroy(() => unsubscribe && unsubscribe());

  const onImageSelected = (e: any) => {
    let image = e.target.files[0];
    // reset the selected file
    imageUpload!.value = '';
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
    uploadAvatar(croppedDataUrl, mimeType, supabase, userAppData.public_id!)
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
<div class="size-full flex justify-center p-4 landscape:p-8">
  <form
    method="POST"
    class="max-w-screen-md flex flex-col gap-4 w-full"
    use:enhance={(form_element) => {
      // custom profile picture check
      if (CUSTOM_PROFILE_PICTURE_REQUIRED) {
        if (imageSrc === defaultAvatarUrl) {
          form_element.cancel();
          raiseToast({
            level: 'error',
            message: 'Du musst ein neues Profilbild setzen!',
          });
          return;
        }
      }

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
      formData.set('ward_id', `${(notAMember ? null : _ward?.id) ?? null}`);
      formData.set('food_preferences', JSON.stringify(_foodPreferences));
      formData.set(
        'breakfast_preferences',
        JSON.stringify(_breakfastPreferences),
      );
      formData.set('accomodation', _accomodation?.name ?? '');
      formData.set('room_mate_preferences', _roomMatePreferences ?? '');
      formData.set('mode_of_transport', _modeOfTransport ?? '');
      formData.set('has_deutschland_ticket', `${_hasDeutschlandTicket}`);
      formData.set('wants_to_visit_temple', `${_wantsToVisitTemple}`);
      formData.set('has_endowment', `${_hasEndowment}`);
      formData.set('is_temple_staff', `${_isTempleStaff}`);
      formData.set(
        'wants_to_provide_temple_staff',
        `${_isTempleStaff && _wantsToProvideTempleStaff}`,
      );
      formData.set('wants_to_attend_baptism', `${_wantsToAttendBaptism}`);
      formData.set('agrees_to_recordings', `${_agreesToRecordings}`);
      formData.set('other_remarks', _otherRemarks ?? '');

      waitingForResponse = true;

      return async ({ result, update }) => {
        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
        waitingForResponse = false;
        await applyAction(result);
        if (!result.status) return;
        const success: boolean = isHttpSuccess(result.status);
        // if (success) update({ invalidateAll: false });
        raiseToast({
          level: success ? 'success' : 'error',
          message: (result as any).data?.message,
        });
        if (success && !hasPaid) {
          openDialog({
            title: '⚠️ Du bist noch nicht angemeldet!',
            content: signUpInfo,
            actions: [
              {
                label: 'Schließen',
              },
              {
                label: 'Zur Bezahlung',
                action: () =>
                  goto('/user/payments', {
                    noScroll: false,
                  }),
              },
            ],
          });
        }
      };
    }}
  >
    <div class="flex justify-center items-center my-8">
      <span class="chad-text-heading chad-typography-gradient rich-font">
        Anmeldeformular
      </span>
    </div>
    <div class="chad-card chad-shadow w-full">
      <ParticipantBar {supabase} />
    </div>
    <div
      class="chad-card chad-shadow w-full flex flex-col gap-4 chad-text-base"
    >
      <span
        >Schön, dass du bei der Chad 2025 in Friedrichsdorf dabei sein wirst.
        Alle weiteren Informationen über diese wundervolle Tagung erhältst du
        per E-Mail oder auf dieser Website.</span
      >
      <span>Erzähle uns doch zuerst etwas über dich.</span>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Persönliche Daten</span>
      <div class="flex flex-col gap-2">
        <span class="chad-text-base text-gray-600"
          >Lade ein Bild von dir hoch!*</span
        >
        <div class="w-full flex justify-center">
          <div class="h-48 relative">
            <img
              class="h-full aspect-[1/1] object-cover object-center rounded-full"
              alt="avatar"
              src={imageSrc}
            />
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              use:Ripple={{ surface: true }}
              onclick={() => imageUpload?.click()}
              class="size-full absolute top-0 left-0 rounded-full cursor-pointer"
            ></div>
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
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Dein Vorname</span>
        <Textfield
          variant="outlined"
          bind:value={_firstName}
          label="Vorname"
          disabled={waitingForResponse}
          required
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Dein Nachname</span>
        <Textfield
          variant="outlined"
          bind:value={_lastName}
          label="Nachname"
          disabled={waitingForResponse}
          required
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Geschlecht</span>
        <GenderSelect
          genders={genders.map((gender) => gender.name)}
          disabled={waitingForResponse}
          bind:selected={_gender}
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Telefonnummer</span>
        <PhoneNumberInput
          {countries}
          disabled={waitingForResponse}
          bind:selectedCountry={_phoneNumber.country}
          bind:phoneNumber={_phoneNumber.suffix}
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Geburtsdatum</span>
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
              <HelperText
                >Du musst midestens {MIN_AGE} Jahre alt sein!</HelperText
              >
            {/snippet}
          </Textfield>
        </div>
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Wohnort und Gemeinde</span>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Adresse</span>
        <CountrySelect
          withPlaceholders={true}
          disabled={waitingForResponse}
          {countries}
          label="Land"
          bind:selectedCountry={_countryOfResidency}
          displayTransform={(country) =>
            `${country.flag_emoji} ${country.name}`}
        />
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={_streetNameAndNumber}
          label="Straße und Hausnummer"
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
        <Textfield
          class="col-span-2"
          variant="outlined"
          bind:value={_cityName}
          label="Stadt"
          disabled={waitingForResponse}
          required
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Gemeinde</span>
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
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Besondere Bedürfnisse</span>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Diäten / Unverträglichkeiten</span
        >
        <FoodPreferencesSelect
          disabled={waitingForResponse}
          bind:selectedPreferences={_foodPreferences}
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >An welchen Tagen brauchst du Frühstück?</span
        >
        <div class="grid grid-cols-2">
          <FormField>
            <Checkbox
              disabled={waitingForResponse}
              bind:checked={_breakfastPreferences.tuesday}
            />
            {#snippet label()}
              <div class={disabledText('', waitingForResponse)}>Dienstag</div>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox
              disabled={waitingForResponse}
              bind:checked={_breakfastPreferences.wednesday}
            />
            {#snippet label()}
              <div class={disabledText('', waitingForResponse)}>Mittwoch</div>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox
              disabled={waitingForResponse}
              bind:checked={_breakfastPreferences.thursday}
            />
            {#snippet label()}
              <div class={disabledText('', waitingForResponse)}>Donnerstag</div>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox
              disabled={waitingForResponse}
              bind:checked={_breakfastPreferences.friday}
            />
            {#snippet label()}
              <div class={disabledText('', waitingForResponse)}>Freitag</div>
            {/snippet}
          </FormField>
        </div>
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Anreise und Unterkunft</span>
      <span class="chad-text-base"
        >Wir werden dieses Jahr in einem Hotel in Bad Homburg (in der Nähe des
        Bahnhofs) und in der Tempelherberge direkt in Friedrichsdorf
        untergebracht werden. Die Einteilung erfolgt nach Bedarf und dem
        Vorhandensein eines Fahrzeuges.<br />
        {#if accomodations.findIndex((acc) => acc.limited) !== -1}
          Der Rabatt, wenn du nicht in der Herberge oder dem Hotel untergebracht
          wirst beträgt 25€.
        {/if}
      </span>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Wie möchtest du untergebracht werden? (Wir versuchen Wünsche zu
          beachten, können aber nicht garantieren, dass wir jeden Wunsch
          erfüllen können)</span
        >
        <Select
          variant="outlined"
          label="Unterkunft"
          bind:value={_accomodation}
          key={(accomodation) => accomodation?.name ?? ''}
          disabled={waitingForResponse}
          required
        >
          {#each accomodations as accomodation (accomodation.name)}
            <Option value={accomodation}
              >{accomodation.name +
                (accomodation.discount == 0
                  ? ''
                  : ` (-${accomodation.discount}€)`)}</Option
            >
          {/each}
        </Select>
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Mit wem möchtest du in einem Zimmer sein? (optional)</span
        >
        <Textfield
          variant="outlined"
          bind:value={_roomMatePreferences}
          label="Wünsche"
          disabled={waitingForResponse}
        />
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Wie wirst du anreisen?</span>
        <Select
          variant="outlined"
          label="Anreise"
          bind:value={_modeOfTransport}
          disabled={waitingForResponse}
          required
        >
          {#each meansOfTransport as transport}
            <Option value={transport.name}>{transport.name}</Option>
          {/each}
        </Select>
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Hast du das <a
            href="https://www.bahn.de/angebot/regio/deutschland-ticket"
            target="_blank">Deutschland-Ticket?</a
          ></span
        >
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={_hasDeutschlandTicket}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich besitze das Deutschland-Ticket
            </div>
          {/snippet}
        </FormField>
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Tempel</span>
      <span class="chad-text-base"
        >Du wirst während der Tagung jeden Tag die Gelegenheit haben in den
        Tempel zu gehen oder parallel etwas anders zu machen. Für die Endowment
        Sessionen musst du dich selbst anmelden. Informationen über mögliche
        Taufsessionen werden vor der Tagung bekannt gegeben.
      </span>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Tempelbesuch</span>
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={_wantsToVisitTemple}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich möchte während der Tagung in den Tempel gehen
            </div>
          {/snippet}
        </FormField>
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Endowment</span>
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={_hasEndowment}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich habe mein eigenes <a
                href="https://www.churchofjesuschrist.org/study/manual/gospel-topics/endowment?lang=deu"
                target="_blank">Endowment</a
              >
            </div>
          {/snippet}
        </FormField>
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600">Tempelarbeiter</span>
        <div class="grid grid-cols-2 portrait:grid-cols-1">
          <FormField>
            <Checkbox
              disabled={waitingForResponse}
              bind:checked={_isTempleStaff}
            />
            {#snippet label()}
              <div class={disabledText('', waitingForResponse)}>
                Ich bin Tempelarbeiter
              </div>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox
              disabled={waitingForResponse || !_isTempleStaff}
              bind:checked={_wantsToProvideTempleStaff}
            />
            {#snippet label()}
              <div
                class={disabledText('', waitingForResponse || !_isTempleStaff)}
              >
                Ich bin bereit als Tempelarbeiter auszuhelfen
              </div>
            {/snippet}
          </FormField>
        </div>
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <span class="chad-text-lg font-bold">Datenschutz und Anmerkungen</span>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Zustimmung zur Aufnahme von Bild- und Tonmaterial*</span
        >
        <FormField>
          <Checkbox
            disabled={waitingForResponse}
            bind:checked={_agreesToRecordings}
          />
          {#snippet label()}
            <div class={disabledText('', waitingForResponse)}>
              Ich willige ein, dass von mir während der Tagung Bild- und
              Tonaufnahmen angefertigt werden dürfen, welche auf Sozialen Medien
              und Cloud Servern vorübergehen veröffentlicht und gespeichert
              werden.
            </div>
          {/snippet}
        </FormField>
      </div>
      <div class="w-full flex flex-col gap-4">
        <span class="chad-text-base text-gray-600"
          >Sonstige Anmerkungen (optional)</span
        >
        <Textfield
          variant="outlined"
          bind:value={_otherRemarks}
          label="Anmerkungen"
          disabled={waitingForResponse}
        />
      </div>
    </div>
    <div class="chad-card chad-shadow w-full flex flex-col gap-8">
      <Button
        variant="raised"
        color="primary"
        disabled={waitingForResponse}
      >
        <Icon class="material-icons">send</Icon>
        <Label>Speichern</Label>
      </Button>
    </div>
  </form>
</div>

{#snippet signUpInfo()}
  <span>
    Du bist erst dann angemeldet, wenn deine Zahlung bestätigt wurde. Dafür
    musst du den Tagungsbeitrag überweisen. Sobald die Zahlung eingegangen ist,
    erhältst du eine E-Mail als Bestätigung.
  </span>
{/snippet}
