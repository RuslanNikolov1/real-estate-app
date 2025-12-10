import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/base-url';
import type { MetadataRoute } from 'next';

/**
 * Route handler for web app manifest
 * This route handler works alongside manifest.ts to ensure Vercel recognizes the route
 * Next.js automatically serves manifest.ts at /manifest.webmanifest, but Vercel
 * needs an explicit route handler for functions config validation
 */
export async function GET() {
  const baseUrl = getBaseUrl();
  
  const manifest: MetadataRoute.Manifest = {
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

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

