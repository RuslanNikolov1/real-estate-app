'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import styles from './ContactBroker.module.scss';

type ValuationFormData = {
  squareMeters: number;
  yearOfConstruction?: number;
  hasAct16: 'yes' | 'no' | 'not-specified';
  hasElevator: 'yes' | 'no';
  floor: number;
  city: string;
  neighborhood: string;
  phone: string;
};

export function ContactBroker() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const valuationSchema = z.object({
    squareMeters: z.number({
      required_error: t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.squareMeters') }),
      invalid_type_error: t('errors.fieldMustBePositive', { fieldLabel: t('home.valuationForm.squareMeters') }),
    }).positive(t('errors.fieldMustBePositive', { fieldLabel: t('home.valuationForm.squareMeters') })),
    yearOfConstruction: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
    hasAct16: z.enum(['yes', 'no', 'not-specified'], {
      required_error: t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.hasAct16') }),
    }),
    hasElevator: z.enum(['yes', 'no'], {
      required_error: t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.hasElevator') }),
    }),
    floor: z.number({
      required_error: t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.floor') }),
      invalid_type_error: t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.floor') }),
    }).int(),
    city: z.string().min(2, t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.city') })),
    neighborhood: z.string().min(2, t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.neighborhood') })),
    phone: z.string().min(5, t('errors.fieldRequired', { fieldLabel: t('home.valuationForm.phone') })),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      hasAct16: 'not-specified',
      hasElevator: 'no',
    },
  });

  const onSubmit = async (data: ValuationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit valuation request');
      }

      setShowToast(true);
      reset();
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      // You could add error toast here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('home.valuationForm.title')}</h2>
        <p className={styles.subtitle}>{t('home.valuationForm.subtitle')}</p>
        <div className={styles.content}>
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
          >
            <div className={styles.formRow}>
              <Input
                label={t('home.valuationForm.squareMeters')}
                type="number"
                step="0.01"
                {...register('squareMeters', { valueAsNumber: true })}
                error={errors.squareMeters?.message}
              />
              <Input
                label={t('home.valuationForm.yearOfConstruction')}
                type="number"
                {...register('yearOfConstruction', { valueAsNumber: true })}
                error={errors.yearOfConstruction?.message}
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.selectWrapper}>
                <label htmlFor="hasAct16" className={styles.label}>
                  {t('home.valuationForm.hasAct16')}
                </label>
                <select
                  id="hasAct16"
                  {...register('hasAct16')}
                  className={`${styles.select} ${errors.hasAct16 ? styles.error : ''}`}
                >
                  <option value="not-specified">{t('home.valuationForm.akt16Options.notSpecified')}</option>
                  <option value="yes">{t('home.valuationForm.akt16Options.yes')}</option>
                  <option value="no">{t('home.valuationForm.akt16Options.no')}</option>
                </select>
                {errors.hasAct16 && (
                  <span className={styles.errorMessage}>
                    {errors.hasAct16.message}
                  </span>
                )}
              </div>
              <div className={styles.selectWrapper}>
                <label htmlFor="hasElevator" className={styles.label}>
                  {t('home.valuationForm.hasElevator')}
                </label>
                <select
                  id="hasElevator"
                  {...register('hasElevator')}
                  className={`${styles.select} ${errors.hasElevator ? styles.error : ''}`}
                >
                  <option value="no">{t('home.valuationForm.akt16Options.no')}</option>
                  <option value="yes">{t('home.valuationForm.akt16Options.yes')}</option>
                </select>
                {errors.hasElevator && (
                  <span className={styles.errorMessage}>
                    {errors.hasElevator.message}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.formRow}>
              <Input
                label={t('home.valuationForm.floor')}
                type="number"
                {...register('floor', { valueAsNumber: true })}
                error={errors.floor?.message}
              />
              <Input
                label={t('home.valuationForm.city')}
                {...register('city')}
                error={errors.city?.message}
              />
            </div>
            <div className={styles.formRow}>
              <Input
                label={t('home.valuationForm.neighborhood')}
                {...register('neighborhood')}
                error={errors.neighborhood?.message}
              />
              <Input
                label={t('home.valuationForm.phone')}
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
            <div className={styles.buttonWrapper}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? t('home.valuationForm.submitting') : t('home.valuationForm.submit')}
            </Button>
            </div>
          </motion.form>
        </div>
      </div>
      <Toast
        message={t('home.valuationForm.successMessage')}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </section>
  );
}

