import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { updateHasPaid } from '$lib/server/databaseAdapter';
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
    let data;
    try {
      data = await updateHasPaid(supabase, paymentRef, 'CONFIRMED', {
        throwOnError: true,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      return fail(500, { message: 'Error updating payment status', error });
    }
    if (data!.length === 0) {
      return fail(404, { message: 'Payment reference not found' });
    }
    return {
      sucess: true,
      message: `Successfully confirmed payment!`,
    };
  },
} satisfies Actions;
