import { Metadata } from 'next';
import { generatePropertyMetadata } from '@/lib/seo/metadata';
import { PropertyPageWrapper } from '@/lib/seo/property-page-wrapper';
import { getBaseUrl } from '@/lib/base-url';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getBaseUrl();
  const propertyUrl = `${baseUrl}/rent/plots/${id}`;
  
  return generatePropertyMetadata(id, propertyUrl);
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseUrl = getBaseUrl();
  const propertyUrl = `${baseUrl}/rent/plots/${id}`;
  
  if (!id) {
    return null;
  }
  
  return <PropertyPageWrapper propertyId={id} propertyUrl={propertyUrl} />;
}
