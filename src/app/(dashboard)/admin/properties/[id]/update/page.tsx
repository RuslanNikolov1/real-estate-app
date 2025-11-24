import { PropertyFormPage } from '@/features/admin/properties/PropertyFormPage';

export default function AdminPropertyUpdatePage({
  params,
}: {
  params: { id: string };
}) {
  return <PropertyFormPage propertyId={params.id} />;
}

