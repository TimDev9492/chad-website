import {
  updateUserInfo,
  upsertFoodPreferences,
  upsertUserAddress,
} from '$lib/server/databaseAdapter';
import {
  isValidAccomodation,
  isValidBreakfastPreferences,
  isValidDate,
  isValidModeOfTransport,
  isValidPostalAddress,
  strToBool,
} from '$lib/utils';
import { fail, type Actions } from '@sveltejs/kit';
import { phone } from 'phone';
import type { BreakfastPreferences } from '../../../app';
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
    const breakfastPreferences = formData.get(
      'breakfast_preferences',
    ) as string;
    const accomodation = formData.get('accomodation') as string;
    const roomMatePreferences = formData.get('room_mate_preferences') as string;
    const modeOfTransport = formData.get('mode_of_transport') as string;
    const hasDeutschlandTicket = formData.get(
      'has_deutschland_ticket',
    ) as string;
    const wantsToVisitTemple = formData.get('wants_to_visit_temple') as string;
    const hasEndowment = formData.get('has_endowment') as string;
    const isTempleStaff = formData.get('is_temple_staff') as string;
    const wantsToProvideTempleStaff = formData.get(
      'wants_to_provide_temple_staff',
    ) as string;
    const wantsToAttendBaptism = formData.get(
      'wants_to_attend_baptism',
    ) as string;
    const agreesToRecordings = formData.get('agrees_to_recordings') as string;
    const otherRemarks = formData.get('other_remarks') as string;

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
    let breakfastPrefs: BreakfastPreferences | undefined;
    try {
      breakfastPrefs = JSON.parse(breakfastPreferences) as BreakfastPreferences;
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Frühstücksangaben konnten nicht verarbeitet werden!',
      });
    }
    if (!isValidBreakfastPreferences(breakfastPrefs))
      return fail(400, {
        success: false,
        message: 'Ungültige Frühstücksangaben!',
      });
    try {
      if (!(await isValidAccomodation(supabase, accomodation))) {
        return fail(400, {
          success: false,
          message: 'Ungültige Unterkunft!',
        });
      }
    } catch (e) {
      console.error(e);
      return fail(400, {
        success: false,
        message: 'Ungültige Unterkunft!',
      });
    }
    try {
      if (!(await isValidModeOfTransport(supabase, modeOfTransport)))
        return fail(400, {
          success: false,
          message: 'Ungültiges Transportmittel zur Anreise!',
        });
    } catch (e) {
      console.error(e);
      return fail(400, {
        success: false,
        message: 'Ungültiges Transportmittel zur Anreise!',
      });
    }
    let hasDeutschlandTicketParsed;
    try {
      hasDeutschlandTicketParsed = strToBool(hasDeutschlandTicket);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Deutschland-Ticket!',
      });
    }
    let wantsToVisitTempleParsed;
    try {
      wantsToVisitTempleParsed = strToBool(wantsToVisitTemple);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Tempelbesuch!',
      });
    }
    let hasEndowmentParsed;
    try {
      hasEndowmentParsed = strToBool(hasEndowment);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Endowment!',
      });
    }
    let isTempleStaffParsed;
    try {
      isTempleStaffParsed = strToBool(isTempleStaff);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Tempelarbeit!',
      });
    }
    let wantsToProvideTempleStaffParsed;
    try {
      wantsToProvideTempleStaffParsed = strToBool(wantsToProvideTempleStaff);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Aushilfe aus Tempelarbeiter!',
      });
    }
    if (!isTempleStaffParsed && wantsToProvideTempleStaffParsed)
      return fail(400, {
        success: false,
        message: 'Du kannst nur als Tempelarbeiter Aushilfe anbieten!',
      });
    let wantsToAttendBaptismParsed;
    try {
      wantsToAttendBaptismParsed = strToBool(wantsToAttendBaptism);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Teilnahme an Taufsessionen!',
      });
    }
    let agreesToRecordingsParsed;
    try {
      agreesToRecordingsParsed = strToBool(agreesToRecordings);
    } catch (e) {
      return fail(400, {
        success: false,
        message: 'Fehlerhafte Angabe für Zustimmung zu Bild- und Tonaufnahmen!',
      });
    }
    if (roomMatePreferences === null)
      return fail(400, {
        success: false,
        message: 'Fehlende Angabe für Mitbewohner!',
      });
    if (otherRemarks === null)
      return fail(400, {
        success: false,
        message: 'Fehlende Angabe für Anmerkungen!',
      });

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
          gender,
          breakfast_preferences: breakfastPrefs,
          accomodation,
          room_mate_preferences: roomMatePreferences || null,
          mode_of_transport: modeOfTransport,
          has_deutschland_ticket: hasDeutschlandTicketParsed,
          wants_to_visit_temple: wantsToVisitTempleParsed,
          has_endowment: hasEndowmentParsed,
          is_temple_staff: isTempleStaffParsed,
          wants_to_provide_temple_staff: wantsToProvideTempleStaffParsed,
          wants_to_attend_baptism: wantsToAttendBaptismParsed,
          agrees_to_recordings: agreesToRecordingsParsed,
          other_remarks: otherRemarks || null,
          // don't update these
          public_id: undefined,
          email: undefined,
          avatar_url: undefined,
          role: undefined,
          payment_reference: undefined,
          has_paid: undefined,
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

    return {
      success: true,
      message: 'Nutzerdaten erfolgreich aktualisiert!',
    };
  },
};

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  const userInfoQuery = supabase
    .from('user_infos')
    .select('*, food_preferences(description)')
    .single();
  const { data: user_info } = await userInfoQuery;
  const { data: genders } = await supabase.from('genders').select('name');
  const { data: accomodations } = await supabase
    .from('accomodations')
    .select('name, discount');
  const { data: meansOfTransport } = await supabase
    .from('means_of_transport')
    .select('name');
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
    accomodations: (accomodations ??
      []) as Database['public']['Tables']['accomodations']['Row'][],
    meansOfTransport: (meansOfTransport ??
      []) as Database['public']['Tables']['means_of_transport']['Row'][],
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
