'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CaretRight, ChatCircleDots } from '@phosphor-icons/react';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { FeedbackModal } from '@/features/reviews/components/FeedbackModal';
import styles from './ClientReviews.module.scss';

interface ClientReviewsProps {
  reviews: Review[];
  onRefresh?: () => void;
}

export function ClientReviews({ reviews, onRefresh }: ClientReviewsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [pendingFeedbackIntent, setPendingFeedbackIntent] = useState(false);
  const prevAuthModalOpenRef = useRef(false);
  const prevUserRef = useRef(user);

  const approvedReviews = reviews.filter((r) => r.is_approved).slice(0, 6);

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
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('home.clientReviews')}</h2>
          <div className={styles.actions}>
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

        {approvedReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('reviews.firstToShare')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {approvedReviews.map((review, index) => (
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
          if (onRefresh) {
            onRefresh();
          }
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













