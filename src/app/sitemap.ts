import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/base-url';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Dynamic sitemap for Google Search Console
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sale/search/apartments`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sale/search/houses-villas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sale/search/offices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sale/search/shops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sale/search/warehouses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sale/search/lands`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sale/search/hotels`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sale/search/agricultural`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sale/search/garages`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sale/search/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rent/search/apartments`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rent/search/houses-villas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rent/search/offices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rent/search/shops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/neighborhoods`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/valuation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Fetch all published properties from database
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('id, updated_at, sale_or_rent, type')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties for sitemap:', error);
      return staticRoutes;
    }

    // Generate property URLs based on type and status
    const propertyRoutes: MetadataRoute.Sitemap = (properties || []).map((property) => {
      const statusPath = property.sale_or_rent === 'sale' ? 'sale' : 'rent';
      const typePath = property.type === 'apartment' ? 'apartments' : 
                       property.type === 'house' || property.type === 'villa' ? 'houses-villas' :
                       property.type === 'office' ? 'offices' :
                       property.type === 'shop' ? 'shops' :
                       property.type === 'warehouse' ? 'warehouses' :
                       property.type === 'land' ? 'lands' :
                       property.type === 'hotel' ? 'hotels' :
                       property.type === 'garage' ? 'garages' :
                       property.type === 'restaurant' ? 'establishments' : 'properties';

      // Use type-specific URL if available, otherwise fallback to /properties/[id]
      const url = property.type === 'apartment' && property.sale_or_rent === 'sale'
        ? `${baseUrl}/sale/apartments/${property.id}`
        : property.type === 'apartment' && property.sale_or_rent === 'rent'
        ? `${baseUrl}/rent/apartments/${property.id}`
        : property.sale_or_rent === 'rent'
        ? `${baseUrl}/rent/${typePath}/${property.id}`
        : `${baseUrl}/properties/${property.id}`;

      return {
        url,
        lastModified: new Date(property.updated_at),
        changeFrequency: property.sale_or_rent === 'rent' ? 'weekly' : 'monthly',
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...propertyRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
















