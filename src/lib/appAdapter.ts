import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserAppData, Workshop, WorkshopsByTime } from '../app';
import type { Database } from '../types/database.types';

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
    has_paid: userInfo.has_paid,
    payment_reference: userInfo.payment_reference,
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

export const getWorkshopsWithTimeslots = async (
  supabase: SupabaseClient,
  dateTransformer: (date: Date) => string,
): Promise<WorkshopsByTime> => {
  const groupedWorkshops: { [timeslot: string]: Workshop[] } = {};

  const { data, error } = await supabase.from('workshops').select('*');
  if (error) throw error;

  // group workshops by `event_start`
  for (const workshop of data) {
    const date = new Date(workshop.event_start);
    const timeslot = dateTransformer(date);
    if (!(timeslot in groupedWorkshops)) groupedWorkshops[timeslot] = [];
    groupedWorkshops[timeslot].push(workshop);
  }

  return groupedWorkshops;
};
