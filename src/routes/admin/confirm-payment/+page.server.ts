import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, locals: { userAppData } }) => {
    // validate the user
    if (!userAppData || userAppData.role !== 'admin') {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const paymentRef = formData.get('payment_reference') as string;

    if (!paymentRef) {
      return fail(400, { message: 'Payment reference is required' });
    }

    // create supabase service role client
    const supabase = createClient(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    );
    const { data, error } = await supabase
      .from('user_infos')
      .update({
        has_paid: true,
      })
      .eq('payment_reference', paymentRef)
      .select('email');
    if (error) {
      console.error('Error updating payment status:', error);
      return fail(500, { message: 'Error updating payment status', error });
    }
    if (data.length === 0) {
      return fail(404, { message: 'Payment reference not found' });
    }
    const { email } = data[0];
    return {
      sucess: true,
      message: `Successfully confirmed payment for "${email}"`,
    };
  },
} satisfies Actions;
