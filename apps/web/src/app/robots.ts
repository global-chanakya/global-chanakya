import { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/profile',
          '/profile/',
          '/api/private',
          '/api/admin',
          '/gc-control-9x7k',
          '/gc-control-9x7k/',
        ],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}
