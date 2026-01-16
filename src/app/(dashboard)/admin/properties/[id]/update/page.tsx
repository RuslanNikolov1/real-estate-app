import { AddPropertyPage } from '@/features/admin/properties/AddPropertyPage';

export default async function AdminPropertyUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AddPropertyPage propertyId={id} />;
}













