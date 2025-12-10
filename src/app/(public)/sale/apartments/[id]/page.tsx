'use client';

import { Metadata } from 'next';
import { useParams } from 'next/navigation';
import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage';

export default function SaleApartmentPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params?.id;

  if (!propertyId) {
    return null;
  }

  return <PropertyDetailPage propertyId={propertyId} />;
}

