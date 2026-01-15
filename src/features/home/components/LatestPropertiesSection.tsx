'use client';

import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@/types';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import styles from './LatestPropertiesSection.module.scss';

export function LatestPropertiesSection() {
  const { t } = useTranslation();
  // Fetch the 4 latest properties
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['latest-properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties?limit=4');
      
      if (!response.ok) {
        throw new Error('Failed to fetch latest properties');
      }
      
      const data: Property[] = await response.json();
      return data;
    },
  });

  if (error) {
    console.error('Error fetching latest properties:', error);
    return null;
  }

  if (isLoading) {
    return (
      <section className={styles.latestPropertiesSection}>
        <div className={styles.loadingState}>
          {t('home.loadingLatestProperties')}
        </div>
      </section>
    );
  }

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className={styles.latestPropertiesSection}>
      <h2 className={styles.heading}>{t('home.latestProperties')}</h2>
      <div className={styles.propertiesGrid}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} layout="vertical" />
        ))}
      </div>
    </section>
  );
}
