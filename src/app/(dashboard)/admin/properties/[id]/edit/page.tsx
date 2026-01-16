import { AddPropertyPage } from '@/features/admin/properties/AddPropertyPage';

export default function Page({ params }: { params: { id: string } }) {
  return <AddPropertyPage propertyId={params.id} />;
}





















