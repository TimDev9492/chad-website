import { fail, type Actions } from '@sveltejs/kit';

import { isValidEmailAddress } from '$lib/utils';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const url = new URL(request.url);
    const baseName = `${url.protocol}//${url.host}`;

    if (!isValidEmailAddress(email)) {
      return fail(400, { message: 'Die angegeben E-Mail ist ungültig!' });
    }
    if (password.length == 0) {
      return fail(400, { message: 'Kein Passwort angegeben!' });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: new URL('/user', baseName).toString() },
    });
    if (error) {
      console.error(error);
      return fail(500, { message: error.message });
    } else {
      return {
        message:
          'Registrierung erfolgreich! Bestätige deine E-Mail um die Registrierung abzuschließen.',
      };
    }
  },
};
