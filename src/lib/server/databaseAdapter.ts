import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  FoodPreference,
  PaymentStatus,
  ResidentialAddressData,
  UserInfoData,
} from '../../app';

export const updateHasPaid = async (
  supabase: SupabaseClient,
  payment_reference: string,
  payment_status: PaymentStatus,
  options: { throwOnError: boolean } = { throwOnError: true },
) => {
  const { data, error } = await supabase
    .from('payment_infos')
    .update({
      payment_status,
    })
    .eq('payment_reference', payment_reference)
    .select('user_id');
  if (error && options.throwOnError) throw error;
  return data;
};

export const upsertUserAddress = async (
  supabase: SupabaseClient,
  user_id: string,
  addressData: ResidentialAddressData,
  options: { throwOnError: boolean } = { throwOnError: true },
) => {
  const { data, error } = await supabase
    .from('residency_addresses')
    .upsert({
      user_id,
      street_name_and_number: addressData.street_name_and_number,
      city: addressData.city_name,
      postal_code: addressData.postal_code,
      country: addressData.country_iso,
    })
    .eq('user_id', user_id);
  if (error && options.throwOnError) throw error;
  return data;
};

export const updateUserInfo = async (
  supabase: SupabaseClient,
  userInfo: UserInfoData,
  options: {
    throwOnError: boolean;
    useDynamicPublicId: boolean;
  } = {
    throwOnError: true,
    useDynamicPublicId: false,
  },
) => {
  // update sensitive information
  const { data: sensitiveData, error: sensitiveError } = await supabase
    .from('user_infos')
    .update({
      phone_number: userInfo.phone_number,
      date_of_birth: userInfo.date_of_birth,
      gender: userInfo.gender,
      breakfast_tuesday: userInfo.breakfast_preferences?.tuesday,
      breakfast_wednesday: userInfo.breakfast_preferences?.wednesday,
      breakfast_thursday: userInfo.breakfast_preferences?.thursday,
      breakfast_friday: userInfo.breakfast_preferences?.friday,
      room_mate_preferences: userInfo.room_mate_preferences,
      accomodation: userInfo.accomodation,
      mode_of_transport: userInfo.mode_of_transport,
      has_deutschland_ticket: userInfo.has_deutschland_ticket,
      wants_to_visit_temple: userInfo.wants_to_visit_temple,
      has_endowment: userInfo.has_endowment,
      is_temple_staff: userInfo.is_temple_staff,
      wants_to_provide_temple_staff: userInfo.wants_to_provide_temple_staff,
      wants_to_attend_baptism: userInfo.wants_to_attend_baptism,
      agrees_to_recordings: userInfo.agrees_to_recordings,
      other_remarks: userInfo.other_remarks,
    })
    .eq('user_id', userInfo.user_id)
    .select('public_id')
    .single();
  if (sensitiveError && options.throwOnError) throw sensitiveError;

  // update public information
  const { data: publicData, error: publicError } = await supabase
    .from('public_infos')
    .update({
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      ward_id: userInfo.ward_id,
      avatar_url: userInfo.avatar_url,
    })
    .eq(
      'public_id',
      options.useDynamicPublicId === undefined
        ? userInfo.public_id
        : sensitiveData!.public_id,
    );
  if (publicError && options.throwOnError) throw publicError;

  return { sensitiveData, publicData };
};

export const upsertFoodPreferences = async (
  supabase: SupabaseClient,
  user_id: string,
  foodPreferences: FoodPreference[],
  options: {
    throwOnError: boolean;
    deleteFormer: boolean;
  } = {
    throwOnError: true,
    deleteFormer: false,
  },
) => {
  // optionally delete former food preferences
  if (options.deleteFormer) {
    const { data: deletionData, error: deletionError } = await supabase
      .from('food_preferences')
      .delete()
      .eq('user_id', user_id);
    if (deletionError && options.throwOnError) throw deletionError;
  }

  const { data, error } = await supabase.from('food_preferences').upsert(
    foodPreferences.map((foodPref) => ({
      user_id,
      description: foodPref.description,
    })),
  );
  if (error && options.throwOnError) throw error;
  return data;
};
