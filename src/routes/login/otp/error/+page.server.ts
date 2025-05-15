import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (err) {
      console.error(err);
      return fail(401, { message: err!.message });
    }
    return redirect(303, '/user');
  },
};
