import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/base-url';

const baseUrl = getBaseUrl();

/**
 * Robots.txt configuration
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}










