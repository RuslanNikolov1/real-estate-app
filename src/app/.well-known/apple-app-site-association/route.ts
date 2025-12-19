import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/base-url';

/**
 * Route handler for Apple App Site Association file
 * Required for Universal Links on iOS devices
 * Must be served with application/json content type
 */
export async function GET() {
  const baseUrl = getBaseUrl();
  
  const association = {
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAM_ID.com.brokerbulgaria.app',
          paths: ['*'],
        },
      ],
    },
    webcredentials: {
      apps: ['TEAM_ID.com.brokerbulgaria.app'],
    },
  };

  // If you don't have a native app, use an empty details array
  // For web-only, you can remove the details or leave it empty
  const webOnlyAssociation = {
    applinks: {
      apps: [],
      details: [],
    },
  };

  // Return web-only version (update to use association if you have a native app)
  return NextResponse.json(webOnlyAssociation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
















