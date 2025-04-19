import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const {
    url,
    locals: { supabase },
  } = event;
  const code = url.searchParams.get('code') as string;
  const next = url.searchParams.get('next') ?? '/';

  console.log({ next });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(303, `/${next.slice(1)}`);
    } else {
      console.error('Error exchanging code for session', error);
    }

    redirect(303, '/auth/auth-code-error');
  }
};
