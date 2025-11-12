import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetailPage propertyId={params.id} />;
}















