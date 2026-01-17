'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CaretRight, ChatCircleDots } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { FeedbackModal } from '@/features/reviews/components/FeedbackModal';
import { Review } from '@/types';
import styles from './ClientReviews.module.scss';

export function ClientReviews() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [pendingFeedbackIntent, setPendingFeedbackIntent] = useState(false);
  const prevAuthModalOpenRef = useRef(false);
  const prevUserRef = useRef(user);

  // Set up IntersectionObserver to detect when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch reviews only when section is visible
  // API already orders by created_at descending and filters for approved reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', 'approved', 'home'],
    queryFn: async () => {
      const response = await fetch('/api/reviews?status=approved&limit=6');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const jsonData = await response.json();
      return jsonData;
    },
    enabled: isVisible,
  });

  // API already returns the 6 most recent approved reviews, ordered by created_at descending
  const reviews: Review[] = reviewsData?.reviews || [];

  const handleSubmitClick = () => {
    if (!user) {
      // Mark that user wants to submit feedback
      setPendingFeedbackIntent(true);
      // Prompt user to login
      setAuthModalOpen(true);
      return;
    }
    // Open feedback modal
    setFeedbackModalOpen(true);
  };

  // Generate a consistent color based on the user's name
  const getAvatarColor = (name: string): string => {
    // Simple hash function to generate consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate a color with good saturation and brightness
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Open feedback modal after successful login if user was trying to submit feedback
  useEffect(() => {
    // Only trigger if:
    // 1. Auth modal from this component was open (prevAuthModalOpenRef.current)
    // 2. Auth modal is now closed (!authModalOpen)
    // 3. User transitioned from not logged in to logged in (prevUserRef.current was null, now user exists)
    // 4. User had pending feedback intent
    if (
      prevAuthModalOpenRef.current && 
      !authModalOpen && 
      !prevUserRef.current && 
      user && 
      pendingFeedbackIntent
    ) {
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        setFeedbackModalOpen(true);
        setPendingFeedbackIntent(false);
      }, 100);
    }
    // If modal closed without user being logged in, clear pending intent
    if (prevAuthModalOpenRef.current && !authModalOpen && !user && pendingFeedbackIntent) {
      setPendingFeedbackIntent(false);
    }
    // Update previous states
    prevAuthModalOpenRef.current = authModalOpen;
    prevUserRef.current = user;
  }, [authModalOpen, user, pendingFeedbackIntent]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('home.clientReviews')}</h2>
          <div className={styles.actionsDesktop}>
            <Button variant="primary" onClick={handleSubmitClick}>
              <ChatCircleDots size={18} />
              {t('reviews.writeFeedback')}
            </Button>
            <Link href="/reviews" prefetch={false}>
              <Button variant="outline">
                {t('home.viewAllReviews')}
                <CaretRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {reviews.length === 0 ? (
          <>
            <div className={styles.emptyState}>
              <p>{t('reviews.firstToShare')}</p>
            </div>
            <div className={styles.actionsMobile}>
              <Button variant="primary" onClick={handleSubmitClick}>
                <ChatCircleDots size={18} />
                {t('reviews.writeFeedback')}
              </Button>
              <Link href="/reviews" prefetch={false}>
                <Button variant="outline">
                  {t('home.viewAllReviews')}
                  <CaretRight size={16} />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.grid}>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={styles.card}
                >
                  <div className={styles.author}>
                    <div 
                      className={styles.avatar}
                      style={{ backgroundColor: getAvatarColor(review.user_name) }}
                    >
                      {review.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.name}>{review.user_name}</span>
                  </div>
                  <p className={styles.comment}>{review.comment}</p>
                </motion.div>
              ))}
            </div>
            <div className={styles.actionsMobile}>
              <Button variant="primary" onClick={handleSubmitClick}>
                <ChatCircleDots size={18} />
                {t('reviews.writeFeedback')}
              </Button>
              <Link href="/reviews" prefetch={false}>
                <Button variant="outline">
                  {t('home.viewAllReviews')}
                  <CaretRight size={16} />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSuccess={() => {
          setFeedbackModalOpen(false);
          // Show toast message
          setShowFeedbackToast(true);
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setShowFeedbackToast(false);
          }, 3000);
          // Refetch reviews after successful submission
          refetchReviews();
        }}
      />

      <Toast
        message={t('flashMessages.feedbackSentForApproval')}
        isVisible={showFeedbackToast}
        onClose={() => setShowFeedbackToast(false)}
        duration={3000}
      />
    </section>
  );
}













