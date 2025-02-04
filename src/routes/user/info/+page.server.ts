import {
  updateUserInfo,
  upsertFoodPreferences,
  upsertUserAddress,
} from '$lib/server/databaseAdapter';
import { isValidDate, isValidPostalAddress, strToBool } from '$lib/utils';
import { fail, type Actions } from '@sveltejs/kit';
import { phone } from 'phone';
import type { Database } from '../../../types/database.types';
import type { PageServerLoad } from './$types';

export const actions: Actions = {
  default: async ({ request, locals: { supabase, user } }) => {
    const formData = await request.formData();
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const gender = formData.get('gender') as string;
    const phoneNumber = formData.get('phone_number') as string;
    const streetNameAndNumber = formData.get(
      'street_name_and_number',
    ) as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postal_code') as string;
    const countryISOCode = formData.get('country') as string;
    const dateOfBirth = formData.get('date_of_birth') as string;
    const wardId = formData.get('ward_id') as string;
    const foodPreferences = formData.get('food_preferences') as string;
    const wantsBreakfast = formData.get('wants_breakfast') as string;
    const needsPlaceToSleep = formData.get('needs_place_to_sleep') as string;

    // validate data
    if (!firstName || !lastName)
      return fail(400, {
        success: false,
        message: 'Vor- oder Nachname fehlt!',
      });
    if (!gender)
      return fail(400, {
        success: false,
        message: 'Kein Geschlecht angegeben!',
      });
    const phoneNumberParsed = phone(phoneNumber);
    if (!phoneNumberParsed.isValid)
      return fail(400, { success: false, message: 'Ungültige Handynummer!' });
    if (
      !isValidPostalAddress(
        streetNameAndNumber,
        city,
        postalCode,
        countryISOCode,
      )
    )
      return fail(400, { success: false, message: 'Ungültige Postleitzahl!' });
    if (!isValidDate(dateOfBirth))
      return fail(400, { success: false, message: 'Ungültiges Geburtsdatum!' });
    if (wardId !== 'null' && isNaN(parseInt(wardId)))
      return fail(400, { success: false, message: 'Ungültige Gemeinde!' });
    let foodPrefs: string[];
    try {
      foodPrefs = JSON.parse(foodPreferences) as string[];
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Ernährungsbedürfnisse konnten nicht verarbeitet werden!',
      });
    }
    let wantsBreakfastParsed;
    try {
      wantsBreakfastParsed = strToBool(wantsBreakfast);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Frühstück!',
      });
    }
    let needsPlaceToSleepParsed;
    try {
      needsPlaceToSleepParsed = strToBool(needsPlaceToSleep);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Übernachtungsmöglichkeit!',
      });
    }

    /**
     * 1. Upsert address
     **/
    try {
      await upsertUserAddress(supabase, user!.id, {
        street_name_and_number: streetNameAndNumber,
        city_name: city,
        postal_code: parseInt(postalCode),
        country_iso: countryISOCode,
      });
    } catch (addressError) {
      console.error(addressError);
      return fail(400, {
        success: false,
        message: 'Speichern der Wohnadresse fehlgeschlagen!',
      });
    }

    /**
     * 2. Upsert user infos
     **/
    try {
      await updateUserInfo(
        supabase,
        {
          user_id: user!.id,
          first_name: firstName,
          last_name: lastName,
          ward_id: wardId === 'null' ? null : parseInt(wardId),
          phone_number: phoneNumberParsed.phoneNumber,
          date_of_birth: dateOfBirth,
          needs_place_to_sleep: needsPlaceToSleepParsed,
          wants_breakfast: wantsBreakfastParsed,
          gender,
          // don't update these
          public_id: undefined,
          email: undefined,
          avatar_url: undefined,
        },
        {
          throwOnError: true,
          useDynamicPublicId: true,
        },
      );
    } catch (userInfoError) {
      console.error(userInfoError);
      return fail(400, {
        success: false,
        message: 'Speichern der Nutzerdaten fehlgeschlagen!',
      });
    }

    /**
     * 3. Upsert food preferences
     **/
    try {
      await upsertFoodPreferences(
        supabase,
        user!.id,
        foodPrefs.map((description) => ({ description })),
        {
          throwOnError: true,
          deleteFormer: true,
        },
      );
    } catch (foodPreferencesError) {
      console.error(foodPreferencesError);
      return fail(400, {
        success: false,
        message: 'Speichern der Ernährungsbedürfnisse fehlgeschlagen!',
      });
    }

    return { success: true, message: 'Nutzerdaten erfolgreich aktualisiert!' };
  },
};

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  const userInfoQuery = supabase
    .from('user_infos')
    .select('*, food_preferences(description)')
    .single();
  const { data: user_info } = await userInfoQuery;
  const { data: genders } = await supabase.from('genders').select('name');
  const { data: countries } = await supabase.from('countries').select('*');
  const { data: resicendy_address } = await supabase
    .from('residency_addresses')
    .upsert({ user_id: user?.id })
    .select('*')
    .single();
  const { data: stakes } = await supabase
    .schema('church_data')
    .from('stakes')
    .select('id, name, wards(id, name)');

  return {
    userInfo: (user_info ??
      {}) as Database['public']['Tables']['user_infos']['Row'],
    genders: (genders ??
      []) as Database['public']['Tables']['genders']['Row'][],
    countries: (countries ??
      []) as Database['public']['Tables']['countries']['Row'][],
    residencyAddress: (resicendy_address ??
      {}) as Database['public']['Tables']['residency_addresses']['Row'],
    stakes: stakes ?? [],
    foodPreferences: (user_info?.food_preferences.map(
      (pref: { description: string }) => pref.description,
    ) ?? []) as string[],
  };
};
