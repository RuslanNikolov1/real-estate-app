'use client';

import { useState } from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', 'pending', page],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?status=pending&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const jsonData = await response.json();
      return jsonData;
    },
  });

  const reviews = data?.reviews || [];
  const pendingCount = data?.pending || 0;
  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve review');
      }
      
      // Invalidate all pending review queries to refetch
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      await queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate homepage reviews so new approved reviews appear
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'approved', 'home'] });
      // Invalidate all approved review queries
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      
      // If current page becomes empty, go back to page 1
      if (reviews.length === 1 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminApproved') || 'Review approved successfully');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error approving review:', error);
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
      
      // Invalidate all pending review queries to refetch
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      await queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate homepage reviews in case a review was deleted
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'approved', 'home'] });
      // Invalidate all approved review queries
      await queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      
      // If current page becomes empty, go back to page 1
      if (reviews.length === 1 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminDeleted') || 'Review deleted successfully');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
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
            {pendingCount > 0 && (
              <span className={styles.badge}>{t('reviews.adminPendingCount', { count: pendingCount })}</span>
            )}
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
