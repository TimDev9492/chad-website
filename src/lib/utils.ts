import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserAppData } from '../app';
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

export const strToBool = (str: string) => {
  if (str.toLowerCase() === 'true') return true;
  if (str.toLowerCase() === 'false') return false;
  throw new Error('Invalid boolean string');
};

export const getUserAppData = async (
  supabase: SupabaseClient,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<UserAppData> => {
  const { data: userInfo, error: userInfoError } = await supabase
    .from('user_infos')
    .select(
      `*,
          roles(role),
          food_preferences(*),
          residency_addresses(*),
          public_infos(*)
          `,
    )
    .single();
  if (userInfoError && options.throwOnError) throw userInfoError;

  // parse user data for the app
  return {
    user_id: userInfo?.user_id,
    public_id: userInfo?.public_id,
    first_name: userInfo?.public_infos?.first_name,
    last_name: userInfo?.public_infos?.last_name,
    ward_id: userInfo?.public_infos?.ward_id,
    email: userInfo?.email,
    phone_number: userInfo?.phone_number,
    date_of_birth: userInfo?.date_of_birth,
    avatar_url: userInfo?.public_infos?.avatar_url,
    needs_place_to_sleep: userInfo?.needs_place_to_sleep,
    wants_breakfast: userInfo?.wants_breakfast,
    residential_address: {
      street_name_and_number:
        userInfo?.residency_addresses?.street_name_and_number,
      postal_code: userInfo?.residency_addresses?.postal_code,
      city_name: userInfo?.residency_addresses?.city,
      country_iso: userInfo?.residency_addresses?.country,
    },
    food_preferences: userInfo?.food_preferences?.map(
      (
        foodPreference: Database['public']['Tables']['food_preferences']['Row'],
      ) => ({
        description: foodPreference.description,
      }),
    ),
    gender: userInfo?.gender,
    role: userInfo?.roles?.role,
  };
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
