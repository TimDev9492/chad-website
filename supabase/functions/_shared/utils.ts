import { corsHeaders } from './cors.ts';

export const JsonError = (
  status: number,
  message: string,
  error?: string,
  options?: { headers?: HeadersInit },
): Response =>
  new Response(
    JSON.stringify({
      error,
      message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    },
  );

export const JsonResponse = (
  status: number,
  message: string,
  options?: { headers?: HeadersInit },
): Response =>
  new Response(
    JSON.stringify({
      success: true,
      message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    },
  );
