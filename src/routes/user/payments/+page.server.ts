import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
  request,
  locals: { supabase },
}) => {
  const { data, error } = await supabase.from('countries').select('*');
  if (error) {
    console.error('Error fetching countries:', error);
    return {
      countries: [],
    };
  }
  return {
    countries: data,
  };
};
