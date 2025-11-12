'use client';

import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Trash, EnvelopeSimple } from '@phosphor-icons/react';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './AdminReviewCard.module.scss';

interface AdminReviewCardProps {
  review: Review;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function AdminReviewCard({
  review,
  onApprove,
  onReject,
  onDelete,
}: AdminReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
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
          <div className={styles.avatar}>
            {review.user_name.charAt(0).toUpperCase()}
          </div>
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
        <div className={styles.status}>
          {review.is_approved ? (
            <span className={`${styles.badge} ${styles.approved}`}>
              <CheckCircle size={16} />
              Одобрен
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.pending}`}>
              <XCircle size={16} />
              Очаква одобрение
            </span>
          )}
        </div>
      </div>

      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            className={`${styles.star} ${
              i < review.rating ? styles.filled : styles.empty
            }`}
            fill={i < review.rating ? '#FFD700' : 'none'}
          />
        ))}
        <span className={styles.ratingText}>({review.rating}/5)</span>
      </div>

      <p className={styles.comment}>{review.comment}</p>

      <div className={styles.actions}>
        {!review.is_approved ? (
          <Button variant="primary" size="sm" onClick={onApprove}>
            <CheckCircle size={16} />
            Одобри
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onReject}>
            <XCircle size={16} />
            Отхвърли
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash size={16} />
          Изтрий
        </Button>
      </div>
    </motion.div>
  );
}













