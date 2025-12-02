'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import type { Property } from '@/types';
import styles from './AdminPropertyQuickViewPage.module.scss';

function QuickViewContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [propertyId, setPropertyId] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const trimmedId = propertyId.trim();

  const recentProperties = useMemo(() => properties.slice(0, 10), [properties]);

  // Filter properties by short_id when ID input is provided
  const filteredProperties = useMemo(() => {
    if (!trimmedId) {
      return recentProperties;
    }

    // Try to parse as number (short_id)
    const numericId = Number(trimmedId);
    if (!isNaN(numericId) && numericId > 0) {
      return properties.filter(
        (property) => property.short_id === numericId
      );
    }

    // Fallback to UUID search if not a valid number
    return properties.filter(
      (property) => property.id.toLowerCase() === trimmedId.toLowerCase()
    );
  }, [properties, trimmedId, recentProperties]);

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/properties?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Грешка при зареждането на имотите');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleDeleteProperty = async (id: string) => {
    // Optimistically remove from UI
    setProperties((prev) => prev.filter((property) => property.id !== id));

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error('Failed to delete property:', data || response.statusText);
        // On error, refetch to restore correct state
        const reload = await fetch('/api/properties?limit=10');
        if (reload.ok) {
          const reloadedData = await reload.json();
          setProperties(reloadedData);
        }
        setFlashMessage('Грешка при изтриването на имота.');
        setTimeout(() => setFlashMessage(null), 5000);
        return;
      }

      setFlashMessage('Имотът беше изтрит успешно.');
      setTimeout(() => setFlashMessage(null), 5000);
    } catch (error) {
      console.error('Unexpected error while deleting property:', error);
      // On error, refetch to restore correct state
      try {
        const reload = await fetch('/api/properties?limit=10');
        if (reload.ok) {
          const reloadedData = await reload.json();
          setProperties(reloadedData);
        }
      } catch (reloadError) {
        console.error('Error reloading properties after delete failure:', reloadError);
      }
      setFlashMessage('Грешка при изтриването на имота.');
      setTimeout(() => setFlashMessage(null), 5000);
    }
  };

  const handleEditProperty = (id: string) => {
    router.push(`/admin/properties/${id}/update`);
  };

  // Auto-dismiss flash message after 5 seconds
  useEffect(() => {
    if (!flashMessage) return;

    const timer = setTimeout(() => {
      setFlashMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [flashMessage]);

  useEffect(() => {
    const status = searchParams.get('status');

    if (status !== 'property-added' && status !== 'property-updated') {
      return;
    }

    const messageKey =
      status === 'property-added'
        ? 'flashMessages.propertyAdded'
        : 'flashMessages.propertyUpdated';

    setFlashMessage(t(messageKey as any));

    const timer = setTimeout(() => setFlashMessage(null), 5000);
    router.replace('/admin/properties/quick-view', { scroll: false });

    // Optimistically update UI with property from sessionStorage
    const optimisticPropertyStr = sessionStorage.getItem('optimistic-property');
    const optimisticAction = sessionStorage.getItem('optimistic-action');
    
    if (optimisticPropertyStr && optimisticAction) {
      try {
        const optimisticProperty: Property = JSON.parse(optimisticPropertyStr);
        
        if (optimisticAction === 'add') {
          // Optimistically add to the beginning of the list
          setProperties((prev) => [optimisticProperty, ...prev].slice(0, 10));
        } else if (optimisticAction === 'update') {
          // Optimistically update existing property in the list
          setProperties((prev) =>
            prev.map((p) => (p.id === optimisticProperty.id ? optimisticProperty : p))
          );
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem('optimistic-property');
        sessionStorage.removeItem('optimistic-action');
      } catch (err) {
        console.error('Error parsing optimistic property:', err);
      }
    }

    // Refetch properties after add/update to get the real data
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties?limit=10');
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } catch (err) {
        console.error('Error refetching properties:', err);
      }
    };

    fetchProperties();

    return () => clearTimeout(timer);
  }, [router, searchParams, t]);

  return (
    <>
      <AnimatePresence>
        {flashMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.03, 1, 1.03, 1]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: {
                duration: 0.3,
              },
            }}
            className={styles.flashMessage}
            role="status"
            aria-live="polite"
          >
            {flashMessage}
          </motion.div>
        )}
      </AnimatePresence>
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
        {isLoading ? (
          <p className={styles.noResults}>Зареждане...</p>
        ) : error ? (
          <p className={styles.noResults}>{error}</p>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDeleteProperty}
              onEdit={handleEditProperty}
            />
          ))
        ) : (
          <p className={styles.noResults}>
            {trimmedId ? 'Няма намерен имот с това ID.' : 'Няма налични имоти.'}
          </p>
        )}
      </div>
    </>
  );
}

export function AdminPropertyQuickViewPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.panel}>
          <Suspense fallback={<div>Loading...</div>}>
            <QuickViewContent />
          </Suspense>
        </section>
      </main>
      <Footer />
    </div>
  );
}

