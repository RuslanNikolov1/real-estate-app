import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage';
import { fetchPropertyForMetadata } from '@/lib/seo/metadata';
import { generatePropertySchema, generateBreadcrumbSchema, generatePropertyBreadcrumbs } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { getBaseUrl } from '@/lib/base-url';

interface PropertyPageWrapperProps {
  propertyId: string;
  propertyUrl: string;
}

/**
 * Server component wrapper for property detail pages
 * Adds structured data (JSON-LD) to property pages
 */
export async function PropertyPageWrapper({ propertyId, propertyUrl }: PropertyPageWrapperProps) {
  // Fetch property for structured data
  const property = await fetchPropertyForMetadata(propertyId);
  
  // Generate structured data schemas
  const schemas = [];
  if (property) {
    schemas.push(generatePropertySchema(property, propertyUrl));
    const breadcrumbs = generatePropertyBreadcrumbs(property, propertyUrl);
    schemas.push(generateBreadcrumbSchema(breadcrumbs));
  }
  
  return (
    <>
      {schemas.length > 0 && <StructuredData data={schemas} />}
      <PropertyDetailPage propertyId={propertyId} />
    </>
  );
}
