'use client';

import { motion } from 'framer-motion';
import { PencilSimple, Trash, CaretUp, CaretDown, Medal } from '@phosphor-icons/react';
import { Certificate } from '@/types';
import { Button } from '@/components/ui/Button';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import styles from './AdminCertificateCard.module.scss';

interface AdminCertificateCardProps {
  certificate: Certificate;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function AdminCertificateCard({
  certificate,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: AdminCertificateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        <CloudinaryImage
          src={certificate.image_url}
          publicId={certificate.public_id}
          alt={certificate.title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.orderBadge}>
          <Medal size={16} />
          <span>#{certificate.order}</span>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{certificate.title}</h3>
        {certificate.description && (
          <p className={styles.description}>{certificate.description}</p>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.orderControls}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={styles.orderButton}
            aria-label="Move up"
          >
            <CaretUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={styles.orderButton}
            aria-label="Move down"
          >
            <CaretDown size={16} />
          </button>
        </div>
        <div className={styles.actionButtons}>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <PencilSimple size={16} />
            Редактирай
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash size={16} />
            Изтрий
          </Button>
        </div>
      </div>
    </motion.div>
  );
}













