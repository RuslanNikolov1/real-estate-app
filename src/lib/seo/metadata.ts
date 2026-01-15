import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/base-url';
import { Property } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

const baseUrl = getBaseUrl();

/**
 * Property type labels in Bulgarian for SEO
 */
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Апартамент',
  house: 'Къща',
  villa: 'Вила',
  office: 'Офис',
  shop: 'Магазин',
  warehouse: 'Склад',
  land: 'Парцел',
  hotel: 'Хотел',
  garage: 'Гараж',
  restaurant: 'Ресторант',
  agricultural: 'Земеделска земя',
};

/**
 * Status labels in Bulgarian for SEO
 */
const STATUS_LABELS: Record<string, string> = {
  'for-sale': 'за продажба',
  'for-rent': 'под наем',
};

/**
 * Fetch property data for metadata generation
 */
export async function fetchPropertyForMetadata(id: string): Promise<Property | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    
    const { data: prop, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !prop) {
      return null;
    }

    // Transform to Property interface
    return {
      id: prop.id as string,
      short_id: prop.short_id as number | undefined,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent',
      city: prop.city || '',
      neighborhood: prop.neighborhood || undefined,
      price: Number(prop.price) || 0,
      currency: '€',
      area: Number(prop.area_sqm) || 0,
      rooms: (prop as any).rooms || undefined,
      bathrooms: (prop as any).bathrooms || undefined,
      subtype: prop.subtype || undefined,
      construction_type: prop.construction_type || undefined,
      completion_degree: prop.completion_degree || undefined,
      building_type: prop.building_type || undefined,
      floor: prop.floor ? String(prop.floor) : undefined,
      total_floors: prop.total_floors ? Number(prop.total_floors) : undefined,
      year_built: prop.build_year || undefined,
      yard_area_sqm: prop.yard_area_sqm ? Number(prop.yard_area_sqm) : undefined,
      electricity: (prop as any).electricity || undefined,
      water: (prop as any).water || undefined,
      hotel_category: (prop as any).hotel_category || undefined,
      agricultural_category: (prop as any).agricultural_category || undefined,
      bed_base: (prop as any).bed_base || undefined,
      works: (prop as any).works || undefined,
      images: (prop.image_urls || []).map((url: string, index: number) => ({
        id: `${prop.id}-img-${index}`,
        url,
        public_id: prop.image_public_ids?.[index] || '',
        width: 0,
        height: 0,
        is_primary: index === 0,
      })),
      features: prop.features || [],
      broker_name: prop.broker_name || undefined,
      broker_phone: prop.broker_phone || undefined,
      broker_position: prop.broker_position || undefined,
      broker_image: prop.broker_image || undefined,
      view_count: 0,
      created_at: prop.created_at || new Date().toISOString(),
      updated_at: prop.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching property for metadata:', error);
    return null;
  }
}

/**
 * Format price for display
 */
function formatPrice(price: number, currency: string): string {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currency}`;
}

/**
 * Truncate description to specified length
 */
function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength).trim() + '...';
}

/**
 * Generate property type label
 */
function getPropertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] || type;
}

/**
 * Generate status label
 */
function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Generate dynamic metadata for property pages
 */
export async function generatePropertyMetadata(
  propertyId: string,
  propertyUrl: string
): Promise<Metadata> {
  const property = await fetchPropertyForMetadata(propertyId);

  // Fallback metadata if property not found
  if (!property) {
    return {
      metadataBase: new URL(baseUrl),
      title: 'Имот не е намерен | Broker Bulgaria',
      description: 'Имотът не е намерен или вече не е наличен.',
      alternates: {
        canonical: propertyUrl,
      },
    };
  }

  const typeLabel = getPropertyTypeLabel(property.type);
  const statusLabel = getStatusLabel(property.status);
  const location = property.neighborhood
    ? `${property.city}, ${property.neighborhood}`
    : property.city;

  // Generate title
  const title = `${property.title} - ${typeLabel} ${statusLabel} в ${property.city} | Broker Bulgaria`;

  // Generate description
  const priceText = formatPrice(property.price, property.currency);
  const areaText = property.area > 0 ? `${property.area} м²` : '';
  const descriptionParts = [
    `${typeLabel} ${statusLabel} в ${location}.`,
    areaText && priceText ? `${areaText}, ${priceText}.` : priceText || areaText,
    truncateDescription(property.description, 120),
  ].filter(Boolean);
  const description = descriptionParts.join(' ');

  // Get OG image (first property image or fallback)
  const ogImage = property.images?.[0]?.url || `${baseUrl}/Red Logo.jpg`;
  const ogImageWidth = property.images?.[0]?.width || 1200;
  const ogImageHeight = property.images?.[0]?.height || 630;

  // Generate hreflang URLs (assuming language routes follow pattern /[lang]/...)
  // For now, we'll use the same URL for all languages since the app uses i18n client-side
  // If you implement language-specific routes later, update these URLs
  const languages = {
    'bg': propertyUrl,
    'en': propertyUrl, // Update when language routes are implemented
    'ru': propertyUrl, // Update when language routes are implemented
    'de': propertyUrl, // Update when language routes are implemented
    'x-default': propertyUrl,
  };

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: `${typeLabel}, ${statusLabel}, ${property.city}, недвижими имоти, Бургас, Broker Bulgaria`,
    alternates: {
      canonical: propertyUrl,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: 'bg_BG',
      url: propertyUrl,
      siteName: 'Broker Bulgaria',
      title,
      description,
      images: [
        {
          url: ogImage,
          width: ogImageWidth,
          height: ogImageHeight,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'article:published_time': property.created_at,
      'article:modified_time': property.updated_at,
    },
  };
}
