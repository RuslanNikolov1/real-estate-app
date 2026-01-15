import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/base-url';

const baseUrl = getBaseUrl();

/**
 * Property type labels in Bulgarian for SEO
 */
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartments: 'Апартаменти',
  'houses-villas': 'Къщи и Вили',
  offices: 'Офиси',
  shops: 'Магазини',
  warehouses: 'Складове',
  lands: 'Парцели',
  hotels: 'Хотели',
  garages: 'Гаражи',
  establishments: 'Ресторанти',
  agricultural: 'Земеделска земя',
};

/**
 * Generate metadata for category/search pages
 * Note: Currently category pages are client components, so this is prepared for future server component conversion
 */
export function generateCategoryMetadata(
  type: string,
  status: 'sale' | 'rent'
): Metadata {
  const typeLabel = PROPERTY_TYPE_LABELS[type] || type;
  const statusLabel = status === 'sale' ? 'за продажба' : 'под наем';
  const title = `${typeLabel} ${statusLabel} в Бургас | Broker Bulgaria`;
  const description = `Намерете ${typeLabel.toLowerCase()} ${statusLabel} в Бургас. Голям избор от недвижими имоти с детайлни описания и снимки.`;

  const url = `${baseUrl}/${status}/search/${type}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: `${typeLabel}, ${statusLabel}, Бургас, недвижими имоти, Broker Bulgaria`,
    alternates: {
      canonical: url,
      languages: {
        'bg': url,
        'en': url,
        'ru': url,
        'de': url,
        'x-default': url,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'bg_BG',
      url,
      siteName: 'Broker Bulgaria',
      title,
      description,
      images: [
        {
          url: `${baseUrl}/Red Logo.jpg`,
          width: 1200,
          height: 630,
          alt: 'Broker Bulgaria',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/Red Logo.jpg`],
    },
  };
}
