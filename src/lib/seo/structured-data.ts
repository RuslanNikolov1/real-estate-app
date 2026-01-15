import { Property } from '@/types';
import { getBaseUrl } from '@/lib/base-url';

const baseUrl = getBaseUrl();

/**
 * Generate RealEstateListing schema (JSON-LD) for property pages
 */
export function generatePropertySchema(property: Property, propertyUrl: string): object {
  const addressParts = [
    property.neighborhood,
    property.city,
    'България',
  ].filter(Boolean);

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: propertyUrl,
    image: property.images?.map((img) => img.url) || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.neighborhood || undefined,
      addressCountry: 'BG',
      streetAddress: addressParts.join(', '),
    },
    geo: property.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.coordinates.lat,
          longitude: property.coordinates.lng,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
      availability: 'https://schema.org/InStock',
      url: propertyUrl,
    },
    floorSize: property.area > 0
      ? {
          '@type': 'QuantitativeValue',
          value: property.area,
          unitCode: 'MTK',
        }
      : undefined,
    numberOfRooms: property.rooms
      ? {
          '@type': 'QuantitativeValue',
          value: property.rooms,
        }
      : undefined,
  };

  // Add property-specific details
  if (property.year_built) {
    schema.yearBuilt = property.year_built;
  }

  if (property.floor) {
    schema.floorLevel = property.floor;
  }

  // Remove undefined fields
  Object.keys(schema).forEach((key) => {
    if (schema[key] === undefined) {
      delete schema[key];
    }
  });

  return schema;
}

/**
 * Generate Organization schema (JSON-LD) for root layout
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Broker Bulgaria',
    url: baseUrl,
    logo: `${baseUrl}/Red Logo.jpg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+359-898-993-030',
      contactType: 'Customer Service',
      areaServed: 'BG',
      availableLanguage: ['bg', 'en', 'ru', 'de'],
    },
    sameAs: [
      // Add social media profiles if available
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Бургас',
      addressCountry: 'BG',
    },
  };
}

/**
 * Generate LocalBusiness schema (JSON-LD)
 */
export function generateLocalBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Broker Bulgaria',
    url: baseUrl,
    logo: `${baseUrl}/Red Logo.jpg`,
    telephone: '+359-898-993-030',
    email: 'brokerbulgaria1@abv.bg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Бургас',
      addressCountry: 'BG',
    },
    areaServed: {
      '@type': 'City',
      name: 'Бургас',
    },
    priceRange: '$$',
  };
}

/**
 * Generate BreadcrumbList schema (JSON-LD)
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate breadcrumb items for property page
 */
export function generatePropertyBreadcrumbs(
  property: Property,
  propertyUrl: string
): Array<{ name: string; url: string }> {
  const baseUrl = getBaseUrl();
  const statusPath = property.status === 'for-sale' ? 'sale' : 'rent';
  const typePath = property.type === 'apartment' ? 'apartments' : 
                   property.type === 'house' || property.type === 'villa' ? 'houses-villas' :
                   property.type === 'office' ? 'offices' :
                   property.type === 'shop' ? 'shops' :
                   property.type === 'warehouse' ? 'warehouses' :
                   property.type === 'land' ? 'lands' :
                   property.type === 'hotel' ? 'hotels' :
                   property.type === 'garage' ? 'garages' :
                   property.type === 'restaurant' ? 'establishments' : 'properties';

  return [
    { name: 'Начало', url: baseUrl },
    {
      name: property.status === 'for-sale' ? 'Продажба' : 'Наем',
      url: `${baseUrl}/${statusPath}/search/${typePath}`,
    },
    { name: property.title, url: propertyUrl },
  ];
}

/**
 * Generate AggregateRating schema if reviews exist
 */
export function generateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  bestRating: number = 5,
  worstRating: number = 1
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
    bestRating,
    worstRating,
  };
}
