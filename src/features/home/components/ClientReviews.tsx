'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './ClientReviews.module.scss';

interface ClientReviewsProps {
  reviews: Review[];
}

export function ClientReviews({ reviews }: ClientReviewsProps) {
  const { t } = useTranslation();

  const approvedReviews = reviews.filter((r) => r.is_approved).slice(0, 6);

  if (approvedReviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('home.clientReviews')}</h2>
          <Link href="/reviews">
            <Button variant="outline" className={styles.viewAllButton}>
              {t('home.viewAllReviews')}
              <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
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
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < review.rating ? styles.filled : styles.empty}
                    fill={i < review.rating ? '#FFD700' : 'none'}
                  />
                ))}
              </div>
              <p className={styles.comment}>{review.comment}</p>
              <div className={styles.author}>
                <span className={styles.name}>{review.user_name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}









