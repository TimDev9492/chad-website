import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    const url = new URL(request.url);
    const baseName = `${url.protocol}//${url.host}`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('/user/update-password', baseName).toString(),
    });
    if (err) {
      console.error(err);
      return fail(401, { message: err!.message });
    }
    return {
      success: true,
      message: 'Check your email for a password reset link!',
    };
  },
};
