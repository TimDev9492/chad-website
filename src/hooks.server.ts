import { createServerClient } from '@supabase/ssr';
import { error, type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { getUserAppData } from '$lib/appAdapter';
import { hasInfosProvided } from '$lib/utils';
import type { UserAppData } from './app';

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
    },
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const fallback = {
      session: null,
      user: null,
      userAppData: null,
      infosProvided: false,
      hasPaid: false,
    };

    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return fallback;
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return fallback;
    }

    // parse user data for the app
    let userAppData: UserAppData | undefined;
    try {
      userAppData = await getUserAppData(event.locals.supabase);
    } catch (error) {
      console.error('Error getting user app data:', error);
    }

    return {
      session,
      user,
      userAppData: userAppData ?? null,
      infosProvided: hasInfosProvided(userAppData),
      hasPaid: userAppData?.has_paid ?? false,
    };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user, userAppData } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;
  event.locals.userAppData = userAppData;

  const adminRoutes = ['/admin'];
  const paidRoutes: string[] = [];
  const withInfosRoutes = ['/user/payments'];
  const loggedInRoutes = ['/user', '/participants'];
  const anonymousRoutes = ['/login', '/register'];
  const apiPrivateRoutes = ['/api/spotify-search'];

  // protect private api routes
  if (
    !event.locals.session &&
    apiPrivateRoutes.find((route) => event.url.pathname.startsWith(route))
  ) {
    error(401, JSON.stringify({ error: 'Unauthorized' }));
  }

  // protect admin routes
  if (
    adminRoutes.find((route) => event.url.pathname.startsWith(route)) &&
    (!event.locals.session ||
      !event.locals.user ||
      !event.locals.userAppData ||
      event.locals.userAppData.role !== 'admin')
  ) {
    redirect(303, '/');
  }

  // protect paid routes
  if (
    paidRoutes.find((route) => event.url.pathname.startsWith(route)) &&
    !event.locals.hasPaid
  ) {
    redirect(303, '/user/payments');
  }

  // protect routes that require user data
  if (
    withInfosRoutes.find((route) => event.url.pathname.startsWith(route)) &&
    !event.locals.infosProvided
  ) {
    redirect(303, '/user/info');
  }

  // protect private routes
  if (
    !event.locals.session &&
    loggedInRoutes.find((route) => event.url.pathname.startsWith(route))
  ) {
    redirect(303, '/login');
  }

  // protect anonymous routes
  if (event.locals.session && anonymousRoutes.includes(event.url.pathname)) {
    redirect(303, '/user');
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
