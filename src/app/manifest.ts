import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/base-url';

/**
 * Web App Manifest for PWA support
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = getBaseUrl();
  
  return {
    name: 'Broker Bulgaria - Недвижими имоти в Бургас',
    short_name: 'Broker Bulgaria',
    description: 'Професионални недвижими имоти в Бургас. Апартаменти, къщи, вили и бизнес имоти за продажба и наем.',
    start_url: `${baseUrl}/`,
    scope: `${baseUrl}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e10600',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `${baseUrl}/Red Logo.jpg`,
        sizes: '180x180',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
    lang: 'bg',
  };
}



