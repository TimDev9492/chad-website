import * as env from '$env/static/public';

export const prerender = true;

export async function GET(): Promise<Response> {
  // prettier-ignore
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${env.PUBLIC_BASE_URL}/sitemap.xml`
  ].join('\n').trim();

  const headers = {
    'Content-Type': 'text/plain',
  };

  return new Response(body, { headers });
}
