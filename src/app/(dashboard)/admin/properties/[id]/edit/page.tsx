import { PropertyFormPage } from '@/features/admin/properties/PropertyFormPage';

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyFormPage propertyId={params.id} />;
}





















