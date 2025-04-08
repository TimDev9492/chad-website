import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
  request,
  locals: { supabase },
}) => {
  const PRICE_FALLBACK = 60;

  const { data: countriesData, error: countriesError } = await supabase
    .from('countries')
    .select('*');
  if (countriesError) {
    console.error('Error fetching countries:', countriesError);
    return {
      countries: [],
      price: PRICE_FALLBACK,
    };
  }
  const { data: userPriceData, error: userPriceError } =
    await supabase.rpc('get_user_price');
  if (userPriceError) {
    console.error('Error fetching user price:', userPriceError);
    return {
      countries: [],
      price: PRICE_FALLBACK,
    };
  }
  return {
    countries: countriesData,
    price: userPriceData,
  };
};
