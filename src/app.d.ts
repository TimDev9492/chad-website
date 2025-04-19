import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
        userAppData: UserAppData | null;
        infosProvided: boolean;
        hasPaid: boolean;
      }>;
      session: Session | null;
      user: User | null;
      userAppData: UserAppData | null;
      infosProvided: boolean;
      hasPaid: boolean;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export type PaymentStatus = Database['public']['Enums']['payment_status'];

export type RegisteredParticipants =
  Database['public']['Functions']['get_registered_users']['Returns'];

type FoodPreference = {
  description: string;
};

type ResidentialAddressData = {
  street_name_and_number: string | null;
  postal_code: number | null;
  city_name: string | null;
  country_iso: string | null;
};

type BreakfastPreferences = {
  tuesday: boolean | null;
  wednesday: boolean | null;
  thursday: boolean | null;
  friday: boolean | null;
};

type UserInfoData = {
  user_id: string | null | undefined;
  public_id: string | null | undefined;
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  ward_id: number | null | undefined;
  email: string | null | undefined;
  phone_number: string | null | undefined;
  date_of_birth: string | null | undefined;
  avatar_url: string | null | undefined;
  gender: string | null | undefined;
  role: string | undefined;
  payment_status: PaymentStatus | undefined;
  payment_reference: string | undefined;
  room_mate_preferences: string | null | undefined;
  accomodation: string | null | undefined;
  mode_of_transport: string | null | undefined;
  has_deutschland_ticket: boolean | null | undefinded;
  wants_to_visit_temple: boolean | null | undefined;
  has_endowment: boolean | null | undefined;
  is_temple_staff: boolean | null | undefined;
  wants_to_provide_temple_staff: boolean | null | undefined;
  wants_to_attend_baptism: boolean | null | undefined;
  agrees_to_recordings: boolean | null | undefined;
  other_remarks: string | null | undefinded;
  breakfast_preferences: BreakfastPreferences | null | undefined;
};

type UserAppData = UserInfoData & {
  residential_address: ResitentialAddressData | null | undefined;
  food_preferences: FoodPreference[] | null | undefined;
};

type Workshop = Database['public']['Tables']['workshops']['Row'];
type WorkshopsByTime = { [timeslot: string]: Workshop[] };
type WorkshopParticipant =
  Database['public']['Tables']['workshop_participants']['Row'];

interface SongSearchResult {
  id: string;
  name: string;
  artists: string[];
  album: string;
  releaseDate: string;
  duration: number;
  popularity: number;
  coverImageUrl: string;
  spotifyUrl: string;
}

export {
  BreakfastPreferences,
  FoodPreference,
  ResidentialAddressData,
  SongSearchResult,
  UserAppData,
  UserInfoData,
  Workshop,
  WorkshopParticipant,
  WorkshopsByTime,
};
