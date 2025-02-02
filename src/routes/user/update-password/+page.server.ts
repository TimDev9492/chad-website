import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (password.length == 0) {
      return fail(400, { message: 'Kein Passwort angegeben!' });
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) {
      console.error(error);
      return fail(500, { message: error.message });
    } else {
      return { success: true, message: 'Passwort erfolgreich geändert!' };
    }
  },
};
