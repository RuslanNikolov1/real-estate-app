'use client';

import { motion } from 'framer-motion';
import { Star } from '@phosphor-icons/react';
import { Review } from '@/types';
import styles from './ReviewCard.module.scss';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
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
            <span className={styles.date}>{formatDate(review.created_at)}</span>
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
        </div>
      </div>
      <p className={styles.comment}>{review.comment}</p>
    </motion.div>
  );
}













