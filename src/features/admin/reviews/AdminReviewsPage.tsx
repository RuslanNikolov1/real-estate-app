'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminReviewCard } from './components/AdminReviewCard';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Review } from '@/types';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import styles from './AdminReviewsPage.module.scss';

export function AdminReviewsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews', 'pending', page],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?status=pending&page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const jsonData = await response.json();
      return jsonData;
    },
  });

  const reviews = data?.reviews || [];
  const totalPages = Math.ceil((data?.total || 0) / limit);
  
  // Track data changes
  useEffect(() => {
  }, [data, reviews.length, isLoading, page]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_approved: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve review');
      }
      
      const approveResponse = await response.json();
      
      // Invalidate pending review queries to mark as stale
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate approved review queries since a review was approved
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      // Invalidate homepage reviews in case a review was approved
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved', 'home'] });
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear cache and refetch to get fresh data from server
      queryClient.removeQueries({ queryKey: ['admin-reviews', 'pending', page] });
      await queryClient.refetchQueries({ queryKey: ['admin-reviews', 'pending', page] });
      const newData = queryClient.getQueryData(['admin-reviews', 'pending', page]);
      
      // If current page becomes empty, go back to page 1
      if (newData && newData.reviews.length === 0 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminApproved'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error approving review:', error);
      // Refetch on error to restore correct state
      await refetch();
      setToastMessage(t('flashMessages.unexpectedError'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      const deleteResponse = await response.json();
      
      // Invalidate pending review queries to mark as stale
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate approved review queries in case a review was deleted
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear cache and refetch to get fresh data from server
      queryClient.removeQueries({ queryKey: ['admin-reviews', 'pending', page] });
      await queryClient.refetchQueries({ queryKey: ['admin-reviews', 'pending', page] });
      const newData = queryClient.getQueryData(['admin-reviews', 'pending', page]);
      
      // If current page becomes empty, go back to page 1
      if (newData && newData.reviews.length === 0 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminDeleted'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      // Refetch on error to restore correct state
      await refetch();
      setToastMessage(t('flashMessages.unexpectedError'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className={styles.adminReviewsPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('reviews.adminPendingTitle')}</h1>
          </div>

          {isLoading ? (
            <div className={styles.loading}>
              {t('reviews.adminLoading')}
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('reviews.adminNoReviews')}</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {reviews.map((review: Review) => (
                  <AdminReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <CaretLeft size={18} />
                    {t('reviews.previous')}
                  </Button>
                  <span className={styles.pageInfo}>
                    {t('reviews.pageInfo', { current: page, total: totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t('reviews.next')}
                    <CaretRight size={18} />
                  </Button>
                </div>
              )}
            </>
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
