import { CHECKOUT_DATA } from '$lib/server/constants';
import { getRegisteredParticipants } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const PRICE_FALLBACK = 100;
  let participantCount = -1;
  let checkoutLink = CHECKOUT_DATA.defaultLink;

  const { data: countriesData, error: countriesError } = await supabase
    .from('countries')
    .select('*');
  if (countriesError) {
    console.error('Error fetching countries:', countriesError);
    return {
      countries: [],
      price: PRICE_FALLBACK,
      participantCount,
      checkoutLink,
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
      checkoutLink,
    };
  }
  return {
    countries: countriesData,
    price: userPriceData,
    participantCount,
    checkoutLink:
      userPriceData < CHECKOUT_DATA.cutoff
        ? CHECKOUT_DATA.discountLink
        : CHECKOUT_DATA.defaultLink,
  };
};
