'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Review } from '@/types';
import styles from './ReviewCard.module.scss';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { i18n } = useTranslation();
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
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {review.user_name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{review.user_name}</h3>
            {review.user_email && (
              <span className={styles.email}>{review.user_email}</span>
            )}
            <span className={styles.date}>{formatDate(review.created_at)}</span>
          </div>
        </div>
      </div>
      <p className={styles.comment}>{review.comment}</p>
    </motion.div>
  );
}
