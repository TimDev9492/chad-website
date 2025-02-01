import { type Actions } from '@sveltejs/kit';
import type { Database } from '../../../types/database.types';
import type { PageServerLoad } from './$types';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    console.log('This is the form data')
    formData.forEach((value, key) => {
      console.log(key, value);
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
    return { message: 'debug' };
  },
};

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
  const userInfoQuery = supabase
    .from('user_infos')
    .select('*, food_preferences(description)')
    .single();
  const { data: user_info } = await userInfoQuery;
  const { data: genders } = await supabase.from('genders').select('name');
  const { data: countries } = await supabase.from('countries').select('*');
  const { data: resicendy_address } = await supabase
    .from('residency_addresses')
    .upsert({ user_id: user?.id })
    .select('*')
    .single();
  const { data: stakes } = await supabase
    .schema('church_data')
    .from('stakes')
    .select('id, name, wards(id, name)');

  return {
    userInfo: (user_info ??
      {}) as Database['public']['Tables']['user_infos']['Row'],
    genders: (genders ??
      []) as Database['public']['Tables']['genders']['Row'][],
    countries: (countries ??
      []) as Database['public']['Tables']['countries']['Row'][],
    residencyAddress: (resicendy_address ??
      {}) as Database['public']['Tables']['residency_addresses']['Row'],
    stakes: stakes ?? [],
    foodPreferences: (user_info?.food_preferences.map(
      (pref: { description: string }) => pref.description,
    ) ?? []) as string[],
  };
};
