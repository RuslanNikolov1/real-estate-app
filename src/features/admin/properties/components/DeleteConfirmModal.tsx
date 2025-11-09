'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Property } from '@/types';
import styles from './DeleteConfirmModal.module.scss';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  property,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !property) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.iconContainer}>
                <AlertTriangle size={32} className={styles.warningIcon} />
              </div>
              <h2>Потвърждение за изтриване</h2>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.warningText}>
                Сигурни ли сте, че искате да изтриете този имот? Това действие не може да бъде отменено.
              </p>

              <div className={styles.propertyInfo}>
                <h3 className={styles.propertyTitle}>{property.title}</h3>
                <p className={styles.propertyLocation}>
                  {property.city}
                  {property.neighborhood && `, ${property.neighborhood}`}
                </p>
                <div className={styles.propertyDetails}>
                  <span>{property.area} м²</span>
                  {property.rooms && <span>{property.rooms} стаи</span>}
                  <span className={styles.price}>
                    {property.price.toLocaleString()} {property.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                disabled={isDeleting}
                className={styles.deleteButton}
              >
                <Trash2 size={20} />
                {isDeleting ? 'Изтриване...' : 'Изтрий имота'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}











