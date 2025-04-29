import { isValidEmailAddress } from '$lib/utils';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!isValidEmailAddress(email)) {
      return fail(400, { message: 'Die angegebe E-Mail ist ungültig!' });
    }

    const { error } = await supabase.auth.updateUser({
      email,
    });
    if (error) {
      console.error(error);
      return fail(500, { message: error.message });
    } else {
      return {
        success: true,
        message:
          'Schaue in dein altes E-Mail Postfach um die Adresse zu ändern!',
      };
    }
  },
};
