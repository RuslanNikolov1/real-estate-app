import { Metadata } from 'next';
import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage';
import { getBaseUrl } from '@/lib/base-url';

const baseUrl = getBaseUrl();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  const propertyUrl = `${baseUrl}/rent/establishments/${id}`;
  
  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: propertyUrl,
    },
    openGraph: {
      type: 'website',
      url: propertyUrl,
      siteName: 'Broker Bulgaria',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Broker Bulgaria',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  if (!id) {
    return null;
  }
  
  return <PropertyDetailPage propertyId={id} />;
}
