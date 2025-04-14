import { getRegisteredParticipants } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const PRICE_FALLBACK = 60;
  let participantCount = -1;

  const { data: countriesData, error: countriesError } = await supabase
    .from('countries')
    .select('*');
  if (countriesError) {
    console.error('Error fetching countries:', countriesError);
    return {
      countries: [],
      price: PRICE_FALLBACK,
      participantCount,
    };
  }
  const { data: userPriceData, error: userPriceError } =
    await supabase.rpc('get_user_price');
  try {
    participantCount = (await getRegisteredParticipants(supabase)).length;
  } catch (error) {
    console.error('Error fetching registered participants:', error);
  }
  if (userPriceError) {
    console.error('Error fetching user price:', userPriceError);
    return {
      countries: [],
      price: PRICE_FALLBACK,
      participantCount,
    };
  }
  return {
    countries: countriesData,
    price: userPriceData,
    participantCount,
  };
};
