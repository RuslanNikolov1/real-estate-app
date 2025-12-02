import { PropertyFormPage } from '@/features/admin/properties/PropertyFormPage';

export default async function AdminPropertyUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyFormPage propertyId={id} />;
}













