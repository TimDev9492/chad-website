import { goto } from '$app/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { RegisteredParticipant, UserAppData } from '../app';
import type { Database } from '../types/database.types';

export const isHttpSuccess: (status: number) => boolean = (status: number) =>
  status >= 200 && status < 300;

export const isValidEmailAddress: (email: string) => boolean = (
  email: string,
) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const getAgeByBirthdate: (birthdate: string) => number = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const disabledText = (classes: string, disabled: boolean) =>
  disabled ? `${classes} opacity-50 select-none` : classes;

export const isValidPostalAddress = (
  streetAndNumber: string,
  city: string,
  postalCode: string,
  countryISOCode: string,
) => {
  const postCode = parseInt(postalCode);
  if (postCode <= 0) return false;
  if (postCode >= 100_000) return false;
  if (!streetAndNumber || !city || !countryISOCode) return false;
  return true;
};

export const isValidPhoneNumber = (phoneNumber: string) => {
  const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return regex.test(phoneNumber);
};

export const isValidDate = (dateString: string) => {
  // Regular expression to match YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the date matches the pattern
  if (!regex.test(dateString)) {
    return false;
  }

  // Check if the date is a valid date
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-');
  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() + 1 === parseInt(month) &&
    date.getDate() === parseInt(day)
  );
};

export const isValidBreakfastPreferences = (preferences: any) => {
  if (!preferences) return false;
  if (typeof preferences !== 'object') return false;
  if (Array.isArray(preferences)) return false;
  return (
    Object.keys(preferences).length > 0 &&
    Object.keys(preferences).every((key) => {
      if (!['tuesday', 'wednesday', 'thursday', 'friday'].includes(key))
        return false;
      const value = preferences[key];
      if (typeof value !== 'boolean') return false;
      return true;
    })
  );
};

export const isValidAccomodation = async (
  supabase: SupabaseClient,
  accomodation: string,
) => {
  const { data, error } = await supabase
    .from('accomodations')
    .select('*')
    .eq('name', accomodation);
  if (error) throw error;
  return data !== null && data.length > 0;
};

export const isValidModeOfTransport = async (
  supabase: SupabaseClient,
  modeOfTransport: string,
) => {
  const { data, error } = await supabase
    .from('means_of_transport')
    .select('*')
    .eq('name', modeOfTransport);
  if (error) throw error;
  return data !== null && data.length > 0;
};

export const strToBool = (str: string) => {
  if (str.toLowerCase() === 'true') return true;
  if (str.toLowerCase() === 'false') return false;
  throw new Error('Invalid boolean string');
};

export const updateAvatarUrl = async (
  supabase: SupabaseClient,
  public_id: string,
  avatar_url: string,
  options: { throwOnError: boolean } = { throwOnError: true },
) => {
  const { data, error } = await supabase
    .from('public_infos')
    .update({ avatar_url })
    .eq('public_id', public_id);
  if (error && options.throwOnError) throw error;
  return data;
};

export const logout = async (supabase: SupabaseClient) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
  } else {
    goto('/');
  }
};

export const isValidUser = (userAppData: UserAppData): boolean => {
  const { user_id, public_id, role } = userAppData;
  return !(!user_id || !public_id || !role);
};

export const hasInfosProvided = (
  userAppData: UserAppData | null | undefined,
): boolean => {
  if (!userAppData) return false;
  const {
    first_name,
    last_name,
    ward_id,
    email,
    phone_number,
    date_of_birth,
    avatar_url,
    gender,
    payment_status,
    room_mate_preferences,
    accomodation,
    mode_of_transport,
    has_deutschland_ticket,
    wants_to_visit_temple,
    has_endowment,
    is_temple_staff,
    wants_to_provide_temple_staff,
    wants_to_attend_baptism,
    agrees_to_recordings,
    other_remarks,
    payment_reference,
    residential_address,
    food_preferences,
    breakfast_preferences,
  } = userAppData;
  // unexpected database entries
  if (!isValidUser(userAppData)) return false;

  // default fields
  if (!avatar_url) return false;
  if (
    payment_status !== 'UNPAID' &&
    payment_status !== 'PENDING_APPROVAL' &&
    payment_status !== 'CONFIRMED'
  )
    return false;
  if (payment_reference == null) return false;

  // required fields
  if (!first_name || !last_name) return false;
  if (
    !isValidEmailAddress(email ?? '') ||
    !isValidPhoneNumber(phone_number ?? '')
  )
    return false;
  if (!isValidDate(date_of_birth ?? '')) return false;
  if (gender == null) return false;
  if (!residential_address) return false;
  if (!food_preferences) return false;
  if (!breakfast_preferences) return false;
  if (room_mate_preferences === undefined) return false;
  if (other_remarks === undefined) return false;
  if (!accomodation) return false;
  if (!mode_of_transport) return false;

  // address and food preferences
  const { street_name_and_number, postal_code, city_name, country_iso } =
    residential_address;
  if (
    !isValidPostalAddress(
      street_name_and_number,
      city_name,
      postal_code,
      country_iso,
    )
  )
    return false;
  if (food_preferences == null) return false;

  return true;
};

export const formatWorkshopStart = (startTime: string) => {
  return format(startTime, "eee dd.MM. HH:mm 'Uhr'", {
    locale: de,
  });
};

export const getRegisteredParticipants = async (
  supabase: SupabaseClient,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<RegisteredParticipant[]> => {
  const { data, error } = await supabase.rpc('get_registered_users');
  if (error && options.throwOnError) throw error;
  return data;
};

export const notifyPaymentApproval = async (
  supabase: SupabaseClient,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<Database['public']['Tables']['payment_infos']['Row'][]> => {
  const { data, error } = await supabase.rpc('notify_payment_approval');
  if (error && options.throwOnError) throw error;
  return data;
};
