'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, EnvelopeSimple } from '@phosphor-icons/react';
import { Review } from '@/types';
import styles from './AdminReviewCard.module.scss';

interface AdminReviewCardProps {
  review: Review;
  onApprove?: () => void;
  onDelete: () => void;
}

export function AdminReviewCard({
  review,
  onApprove,
  onDelete,
}: AdminReviewCardProps) {
  const { t, i18n } = useTranslation();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'bg': 'bg-BG',
      'ru': 'ru-RU',
      'de': 'de-DE',
    };
    const locale = localeMap[i18n.language] || 'bg-BG';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${styles.card} ${
        !review.is_approved ? styles.pending : ''
      }`}
    >
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{review.user_name}</h3>
            {review.user_email && (
              <div className={styles.email}>
                <EnvelopeSimple size={14} />
                <span>{review.user_email}</span>
              </div>
            )}
            <span className={styles.date}>{formatDate(review.created_at)}</span>
          </div>
        </div>
      </div>

      <p className={styles.comment}>{review.comment}</p>

      <div className={styles.actions}>
        {onApprove && !review.is_approved && (
          <button
            type="button"
            className={styles.approveButton}
            onClick={onApprove}
            aria-label={t('reviews.adminApprove')}
            title={t('reviews.adminApprove')}
          >
            <CheckCircle size={48} weight="fill" />
          </button>
        )}
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label={t('reviews.adminDelete')}
          title={t('reviews.adminDelete')}
        >
          <XCircle size={48} />
        </button>
      </div>
    </motion.div>
  );
}













