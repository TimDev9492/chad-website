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
        message: 'Missing first or last name!',
      });
    if (!gender)
      return fail(400, { success: false, message: 'Missing gender!' });
    const phoneNumberParsed = phone(phoneNumber);
    if (!phoneNumberParsed.isValid)
      return fail(400, { success: false, message: 'Invalid phone number!' });
    if (
      !isValidPostalAddress(
        streetNameAndNumber,
        city,
        postalCode,
        countryISOCode,
      )
    )
      return fail(400, { success: false, message: 'Invalid postal address!' });
    if (!isValidDate(dateOfBirth))
      return fail(400, { message: 'Invalid date of birth!' });
    if (wardId !== 'null' && isNaN(parseInt(wardId)))
      return fail(400, { success: false, message: 'Invalid ward!' });
    let foodPrefs;
    try {
      foodPrefs = JSON.parse(foodPreferences);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Unable to parse food preferences!',
      });
    }
    let wantsBreakfastParsed;
    try {
      wantsBreakfastParsed = strToBool(wantsBreakfast);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Unable to parse wants breakfast!',
      });
    }
    let needsPlaceToSleepParsed;
    try {
      needsPlaceToSleepParsed = strToBool(needsPlaceToSleep);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Unable to parse needs place to sleep!',
      });
    }

    /**
     * 1. Upsert address
     **/
    const { data: addressData, error: addressError } = await supabase
      .from('residency_addresses')
      .upsert({
        user_id: user?.id,
        street_name_and_number: streetNameAndNumber,
        city,
        postal_code: postalCode,
        country: countryISOCode,
      })
      .eq('user_id', user?.id);
    if (addressError) {
      console.error(addressError);
      return fail(400, {
        success: false,
        message: 'Failed to save address to database!',
      });
    }

    /**
     * 2. Upsert user infos
     **/
    const { error: userInfoError } = await supabase
      .from('user_infos')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumberParsed.phoneNumber,
        date_of_birth: dateOfBirth,
        ward_id: wardId === 'null' ? null : parseInt(wardId),
        needs_place_to_sleep: needsPlaceToSleepParsed,
        wants_breakfast: wantsBreakfastParsed,
        gender,
      })
      .eq('user_id', user?.id);
    if (userInfoError) {
      console.error(userInfoError);
      return fail(400, {
        success: false,
        message: 'Failed to save user info to database!',
      });
    }

    /**
     * 3. Upsert food preferences
     **/
    // delete old food preferences
    const { error: deleteFoodPrefsError } = await supabase
      .from('food_preferences')
      .delete()
      .eq('user_id', user?.id);
    if (deleteFoodPrefsError) {
      console.error(deleteFoodPrefsError);
      return fail(400, {
        success: false,
        message: 'Failed to delete old food preferences!',
      });
    }
    const { error: foodPreferencesError } = await supabase
      .from('food_preferences')
      .insert(
        foodPrefs.map((description: string) => ({
          user_id: user?.id,
          description,
        })),
      );
    if (foodPreferencesError) {
      console.error(foodPreferencesError);
      return fail(400, {
        success: false,
        message: 'Failed to save food preferences to database!',
      });
    }

    return { success: true, message: 'User info updated successfully!' };
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
