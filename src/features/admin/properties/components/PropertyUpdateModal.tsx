'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FloppyDisk, CurrencyDollar, Tag } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Property } from '@/types';
import styles from './PropertyUpdateModal.module.scss';

const updateSchema = z.object({
  price: z.number().min(0, 'Цената трябва да е положително число').optional(),
  status: z.enum(['for-sale', 'for-rent', 'sold', 'rented']).optional(),
  currency: z.string().optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

interface PropertyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onUpdate: (id: string, updates: Partial<Property>) => void;
}

export function PropertyUpdateModal({
  isOpen,
  onClose,
  property,
  onUpdate,
}: PropertyUpdateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      price: property?.price,
      status: property?.status === 'for-sale' || property?.status === 'for-rent' 
        ? property.status 
        : 'for-sale',
      currency: property?.currency,
    },
  });

  useEffect(() => {
    if (property) {
      reset({
        price: property.price,
        status: property.status === 'for-sale' || property.status === 'for-rent' 
          ? property.status 
          : 'for-sale',
        currency: property.currency,
      });
    }
  }, [property, reset]);

  const onSubmit = (data: UpdateFormData) => {
    if (!property) return;

    const updates: Partial<Property> = {};
    if (data.price !== undefined) {
      updates.price = data.price;
    }
    if (data.status) {
      updates.status = data.status;
    }
    if (data.currency) {
      updates.currency = data.currency;
    }

    onUpdate(property.id, updates);
    onClose();
  };

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
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Обновяване на имот</h2>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.propertyInfo}>
              <h3 className={styles.propertyTitle}>{property.title}</h3>
              <p className={styles.propertyLocation}>
                {property.city}
                {property.neighborhood && `, ${property.neighborhood}`}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <CurrencyDollar size={20} />
                  Цена
                </h3>
                <div className={styles.formRow}>
                  <Input
                    label="Цена"
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    error={errors.price?.message}
                  />
                  <Input
                    label="Валута"
                    {...register('currency')}
                    error={errors.currency?.message}
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <Tag size={20} />
                  Статус
                </h3>
                <div className={styles.selectWrapper}>
                  <label className={styles.label}>Статус</label>
                  <select
                    {...register('status')}
                    className={styles.select}
                  >
                    <option value="for-sale">За продажба</option>
                    <option value="for-rent">Под наем</option>
                    <option value="sold">Продаден</option>
                    <option value="rented">Отдаден под наем</option>
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  <FloppyDisk size={20} /> Запази промените
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Отказ
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

