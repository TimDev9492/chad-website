import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  SongSearchResult,
  UserAppData,
  Workshop,
  WorkshopsByTime,
} from '../app';
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
    payment_status: userInfo?.payment_infos?.status,
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

export type SongSuggestion =
  Database['public']['Tables']['song_suggestions']['Row'];

export type LikedSongSuggestion = SongSuggestion & {
  song_suggestion_likes: Database['public']['Tables']['song_suggestion_likes']['Row']['public_id'][];
};

export const getSongSuggestionsWithLikes = async (
  supabase: SupabaseClient,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<LikedSongSuggestion[]> => {
  const { data, error } = await supabase
    .from('song_suggestions')
    .select('*, song_suggestion_likes(public_id)');
  if (error && options.throwOnError) throw error;
  if (!data) return [];
  return data
    .map((suggestion) => ({
      ...suggestion,
      song_suggestion_likes: suggestion.song_suggestion_likes.map(
        (like: { public_id: string }) => like.public_id,
      ),
    }))
    .sort(
      (a: LikedSongSuggestion, b: LikedSongSuggestion) =>
        b.song_suggestion_likes.length - a.song_suggestion_likes.length,
    ) as LikedSongSuggestion[];
};

export const submitSongSuggestion = async (
  supabase: SupabaseClient,
  songInfo: SongSearchResult,
  publicId: string,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<void> => {
  const { error } = await supabase.from('song_suggestions').insert({
    spotify_id: songInfo.id,
    name: songInfo.name,
    artists: songInfo.artists,
    album: songInfo.album,
    duration: songInfo.duration,
    popularity: songInfo.popularity,
    release_date: songInfo.releaseDate,
    cover_image_url: songInfo.coverImageUrl,
    spotify_url: songInfo.spotifyUrl,
    submitted_by: publicId,
  });
  if (error && options.throwOnError) throw error;
};

export const deleteSongSuggestion = async (
  supabase: SupabaseClient,
  songId: string,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<void> => {
  const { error } = await supabase
    .from('song_suggestions')
    .delete()
    .eq('id', songId);
  if (error && options.throwOnError) throw error;
};

export const likeSong = async (
  supabase: SupabaseClient,
  songId: string,
  publicId: string,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<void> => {
  const { error } = await supabase.from('song_suggestion_likes').insert({
    public_id: publicId,
    song_id: songId,
  });
  if (error && options.throwOnError) throw error;
};

export const unlikeSong = async (
  supabase: SupabaseClient,
  songId: string,
  publicId: string,
  options: { throwOnError: boolean } = { throwOnError: true },
): Promise<void> => {
  const { error } = await supabase
    .from('song_suggestion_likes')
    .delete()
    .eq('public_id', publicId)
    .eq('song_id', songId);
  if (error && options.throwOnError) throw error;
};
