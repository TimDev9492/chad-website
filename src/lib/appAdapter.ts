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
          public_infos(*),
          payment_infos(*)
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
    has_paid: userInfo?.payment_infos?.has_paid,
    payment_reference: userInfo?.payment_infos?.payment_reference,
    room_mate_preferences: userInfo?.room_mate_preferences,
    accomodation: userInfo?.accomodation,
    mode_of_transport: userInfo?.mode_of_transport,
    has_deutschland_ticket: userInfo?.has_deutschland_ticket,
    wants_to_visit_temple: userInfo?.wants_to_visit_temple,
    has_endowment: userInfo?.has_endowment,
    is_temple_staff: userInfo?.is_temple_staff,
    wants_to_provide_temple_staff: userInfo?.wants_to_provide_temple_staff,
    wants_to_attend_baptism: userInfo?.wants_to_attend_baptism,
    agrees_to_recordings: userInfo?.agrees_to_recordings,
    other_remarks: userInfo?.other_remarks,
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
    breakfast_preferences: {
      tuesday: userInfo?.breakfast_tuesday,
      wednesday: userInfo?.breakfast_wednesday,
      thursday: userInfo?.breakfast_thursday,
      friday: userInfo?.breakfast_friday,
    },
  } as UserAppData;
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

export const getWorkshopDetails = async (
  supabase: SupabaseClient,
  workshopId: string,
): Promise<Workshop | null> => {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', workshopId);

  if (error) throw error;

  return data.length ? data[0] : null;
};
