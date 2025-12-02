import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage';

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





















