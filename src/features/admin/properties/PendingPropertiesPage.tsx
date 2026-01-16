'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PendingPropertyCard } from './components/PendingPropertyCard';
import { Toast } from '@/components/ui/Toast';
import { Property } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import styles from './PendingPropertiesPage.module.scss';

export function PendingPropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === 'ruslannikolov1@gmail.com';

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  const { data: pendingProperties = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties/pending');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/');
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch pending properties');
      }
      return response.json();
    },
    enabled: isAdmin && !!user,
    retry: false,
  });

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/pending/${id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to approve property');
      }

      setToastMessage('Имотът беше одобрен успешно.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Refetch pending properties to update the list
      refetch();
    } catch (error) {
      console.error('Error approving property:', error);
      setToastMessage(
        error instanceof Error ? error.message : 'Грешка при одобряването на имота.'
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/pending/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to reject property');
      }

      setToastMessage('Имотът беше отхвърлен.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Refetch pending properties to update the list
      refetch();
    } catch (error) {
      console.error('Error rejecting property:', error);
      setToastMessage(
        error instanceof Error ? error.message : 'Грешка при отхвърлянето на имота.'
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Зареждане...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if not admin (redirect will happen via useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Имоти за одобрение</h1>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Зареждане...</div>
          ) : pendingProperties.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Няма налични имоти за одобрение.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {pendingProperties.map((property: Property) => (
                <PendingPropertyCard
                  key={property.id}
                  property={property}
                  onApprove={() => handleApprove(property.id)}
                  onReject={() => handleReject(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}
