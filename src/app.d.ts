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

type FoodPreference = {
  description: string;
};

type ResidentialAddressData = {
  street_name_and_number: string | null;
  postal_code: number | null;
  city_name: string | null;
  country_iso: string | null;
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
  needs_place_to_sleep: boolean | null | undefined;
  wants_breakfast: boolean | null | undefined;
  gender: string | null | undefined;
  role: string | undefined;
  has_paid: boolean | undefined;
  payment_reference: string | undefined;
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
  FoodPreference,
  ResidentialAddressData,
  SongSearchResult,
  UserAppData,
  UserInfoData,
  Workshop,
  WorkshopParticipant,
  WorkshopsByTime,
};
