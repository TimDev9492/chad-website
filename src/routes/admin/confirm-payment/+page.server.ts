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

    type ConfirmedUserData = {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      paymentReference: string;
    }
    let confirmedUserData: ConfirmedUserData | null = null;
    const { data: infos, error } = await supabase
      .from('user_infos')
      .select('public_infos(first_name, last_name), email, phone_number, payment_infos!inner(payment_reference)')
      .eq('payment_infos.payment_reference', paymentRef)
      .single();
    if (error) {
      console.error('Error retrieving confirmed user data: ', error);
    } else {
      confirmedUserData = {
        firstName: infos.public_infos.first_name,
        lastName: infos.public_infos.last_name,
        email: infos.email,
        phone: infos.phone_number,
        paymentReference: paymentRef,
      };
    }

    return {
      sucess: true,
      message: `Successfully confirmed payment!`,
      confirmedUserData,
    };
  },
} satisfies Actions;
