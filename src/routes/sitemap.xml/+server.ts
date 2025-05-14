// /src/routes/sitemap.xml/+server.ts
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { RequestHandler } from '@sveltejs/kit';
import * as sitemap from 'super-sitemap';

export const GET: RequestHandler = async () => {
  return await sitemap.response({
    origin: PUBLIC_BASE_URL,
    excludeRoutePatterns: [
      '^/api.*',
      '^/admin.*',
      '^/user.*',
      '^/workshops/\\[id\\]',
      '.*/error$',
    ],
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5,
    sort: 'alpha',
  });
};
