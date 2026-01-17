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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:25',message:'queryFn called',data:{page,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      const response = await fetch(`/api/reviews?status=pending&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const jsonData = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:29',message:'queryFn response',data:{reviewsCount:jsonData?.reviews?.length||0,reviewsIds:jsonData?.reviews?.map((r:Review)=>r.id)||[],total:jsonData?.total||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return jsonData;
    },
  });

  const reviews = data?.reviews || [];
  const totalPages = Math.ceil((data?.total || 0) / limit);
  
  // Track data changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:36',message:'useEffect - data changed',data:{reviewsCount:reviews.length,reviewsIds:reviews.map(r=>r.id),dataReviewsCount:data?.reviews?.length||0,isLoading,page},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
  }, [data, reviews.length, isLoading, page]);

  const handleApprove = async (id: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:36',message:'handleApprove called',data:{reviewId:id,currentPage:page,reviewsBefore:reviews.length,reviewsBeforeIds:reviews.map(r=>r.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_approved: true }),
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:45',message:'PATCH response received',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        throw new Error('Failed to approve review');
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:51',message:'Before invalidateQueries',data:{queryKey:['admin-reviews','pending']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Invalidate pending review queries to mark as stale
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate approved review queries since a review was approved
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      // Invalidate homepage reviews in case a review was approved
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved', 'home'] });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:60',message:'Before refetch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Refetch to get fresh data from server
      const { data: newData } = await refetch();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:63',message:'After refetch',data:{newDataReviewsCount:newData?.reviews?.length||0,newDataReviewsIds:newData?.reviews?.map((r:Review)=>r.id)||[],newDataTotal:newData?.total||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      // If current page becomes empty, go back to page 1
      if (newData && newData.reviews.length === 0 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminApproved'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:70',message:'Error in handleApprove',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('Error approving review:', error);
      // Refetch on error to restore correct state
      await refetch();
      setToastMessage(t('flashMessages.unexpectedError'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:80',message:'handleDelete called',data:{reviewId:id,currentPage:page,reviewsBefore:reviews.length,reviewsBeforeIds:reviews.map(r=>r.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:85',message:'DELETE response received',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:91',message:'Before invalidateQueries',data:{queryKey:['admin-reviews','pending']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Invalidate pending review queries to mark as stale
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews', 'pending'] });
      // Also invalidate reviews stats to update the header badge
      queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
      // Invalidate approved review queries in case a review was deleted
      queryClient.invalidateQueries({ queryKey: ['reviews', 'approved'] });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:98',message:'Before refetch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Refetch to get fresh data from server
      const { data: newData } = await refetch();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:101',message:'After refetch',data:{newDataReviewsCount:newData?.reviews?.length||0,newDataReviewsIds:newData?.reviews?.map((r:Review)=>r.id)||[],newDataTotal:newData?.total||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      // If current page becomes empty, go back to page 1
      if (newData && newData.reviews.length === 0 && page > 1) {
        setPage(1);
      }
      
      setToastMessage(t('reviews.adminDeleted'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminReviewsPage.tsx:109',message:'Error in handleDelete',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
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
