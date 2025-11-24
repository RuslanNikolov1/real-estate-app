'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { mockProperties } from '@/features/properties/PropertiesListPage';
import styles from './AdminPropertyQuickViewPage.module.scss';

export function AdminPropertyQuickViewPage() {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState('');
  const [properties, setProperties] = useState(mockProperties);
  const trimmedId = propertyId.trim();

  const recentProperties = useMemo(() => properties.slice(0, 10), [properties]);

  const selectedProperty = useMemo(() => {
    if (!trimmedId) {
      return null;
    }

    return properties.find(
      (property) => property.id.toLowerCase() === trimmedId.toLowerCase(),
    );
  }, [properties, trimmedId]);

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((property) => property.id !== id));
  };

  const handleEditProperty = (id: string) => {
    router.push(`/admin/properties/${id}/update`);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Имоти</h1>
              <p className={styles.subtitle}>
                Въведете ID на имот, за да го намерите. Ако оставите полето празно, виждате
                последните 10 записа от списъка.
              </p>
            </div>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.inputLabel} htmlFor="property-id-input">
              ID
            </label>
            <Input
              id="property-id-input"
              placeholder="Например: 3"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.resultsHeader}>
            <h2>Резултати</h2>
            <Link href="/admin/properties/configurator" className={styles.addButton}>
              <span aria-hidden="true">+</span>
              <span>Добави имот</span>
            </Link>
          </div>

          <div className={styles.propertiesList}>
            {trimmedId ? (
              selectedProperty ? (
                <PropertyCard
                  property={selectedProperty}
                  onDelete={handleDeleteProperty}
                  onEdit={handleEditProperty}
                />
              ) : (
                <p className={styles.noResults}>Няма намерен имот с това ID.</p>
              )
            ) : recentProperties.length > 0 ? (
              recentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onDelete={handleDeleteProperty}
                  onEdit={handleEditProperty}
                />
              ))
            ) : (
              <p className={styles.noResults}>Няма налични имоти.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

