import { fail, type Actions } from '@sveltejs/kit';

import { isValidEmailAddress } from '$lib/utils';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!isValidEmailAddress(email)) {
      return fail(400, { message: 'The email you provided is invalid!' });
    }
    if (password.length == 0) {
      return fail(400, { message: 'You need to provide a password!' });
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
      return fail(500, { message: error.message });
    } else {
      return { message: 'Success! Check your email for a confirmation link.' };
    }
  },
};
