'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import {
  Calculator,
  TrendUp,
  PaperPlaneTilt,
  CheckCircle,
} from '@phosphor-icons/react';
import styles from './ValuationPage.module.scss';

type ValuationRequestFormData = {
  name: string;
  email: string;
  phone: string;
  property_type: 'apartment' | 'house' | 'villa' | 'office' | 'shop' | 'warehouse' | 'land' | 'hotel';
  city: string;
  neighborhood?: string;
  address?: string;
  area: number;
  rooms?: number;
  year_built?: number;
  current_price?: number;
  message?: string;
};

type FuturePriceFormData = {
  current_price: number;
  years: number;
  annual_growth_rate: number;
};

export function ValuationPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'manual' | 'future'>('manual');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [futurePrice, setFuturePrice] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Create dynamic Zod schemas with translations
  const valuationRequestSchema = useMemo(() => z.object({
    name: z.string().min(1, t('valuation.validation.nameRequired')),
    email: z.string().email(t('valuation.validation.emailInvalid')),
    phone: z.string().min(1, t('valuation.validation.phoneRequired')),
    property_type: z.enum(['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel']),
    city: z.string().min(1, t('valuation.validation.cityRequired')),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    area: z.number().min(1, t('valuation.validation.areaMustBePositive')),
    rooms: z.number().optional(),
    year_built: z.number().optional(),
    current_price: z.number().optional(),
    message: z.string().optional(),
  }), [t]);

  const futurePriceSchema = useMemo(() => z.object({
    current_price: z.number().min(1, t('valuation.validation.currentPriceRequired')),
    years: z.number().min(1, t('valuation.validation.yearsMin')).max(30, t('valuation.validation.yearsMax')),
    annual_growth_rate: z.number().min(0, t('valuation.validation.growthRateMin')).max(20, t('valuation.validation.growthRateMax')),
  }), [t]);

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest, isSubmitting: isSubmittingRequest },
    reset: resetRequest,
  } = useForm<ValuationRequestFormData>({
    resolver: zodResolver(valuationRequestSchema),
    defaultValues: {
      property_type: 'apartment',
      city: 'Burgas',
    },
  });

  const {
    register: registerFuture,
    handleSubmit: handleSubmitFuture,
    formState: { errors: errorsFuture },
    watch: watchFuture,
  } = useForm<FuturePriceFormData>({
    resolver: zodResolver(futurePriceSchema),
    defaultValues: {
      years: 5,
      annual_growth_rate: 3,
    },
  });

  const onSubmitRequest = async (data: ValuationRequestFormData) => {
    try {
      // TODO: API call to submit valuation request
      console.log('Valuation request:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      resetRequest();
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting valuation request:', error);
      setToastMessage(t('valuation.errorSubmitting'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const onSubmitFuture = (data: FuturePriceFormData) => {
    // Calculate future price using compound interest formula
    // Future Value = Present Value * (1 + rate)^years
    const futureValue = data.current_price * Math.pow(1 + data.annual_growth_rate / 100, data.years);
    setFuturePrice(Math.round(futureValue));
  };

  const currentPrice = watchFuture('current_price');
  const years = watchFuture('years') || 5;
  const growthRate = watchFuture('annual_growth_rate') || 3;

  // Calculate preview if current price is set
  const previewPrice = currentPrice && currentPrice > 0
    ? Math.round(currentPrice * Math.pow(1 + growthRate / 100, years))
    : null;

  return (
    <div className={styles.valuationPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.header}
          >
            <h1 className={styles.title}>{t('valuation.title')}</h1>
            <p className={styles.subtitle}>
              {t('valuation.subtitle')}
            </p>
          </motion.div>

          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('manual')}
              className={`${styles.tab} ${activeTab === 'manual' ? styles.active : ''}`}
            >
              <Calculator size={20} />
              {t('valuation.manualTab')}
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className={`${styles.tab} ${activeTab === 'future' ? styles.active : ''}`}
            >
              <TrendUp size={20} />
              {t('valuation.futureTab')}
            </button>
          </div>

          {activeTab === 'manual' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.content}
            >
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>{t('valuation.formTitle')}</h2>
                <p className={styles.formDescription}>
                  {t('valuation.formDescription')}
                </p>

                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.successMessage}
                  >
                    <CheckCircle size={24} />
                    <div>
                      <h3>{t('valuation.successTitle')}</h3>
                      <p>{t('valuation.successMessage')}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmitRequest(onSubmitRequest)} className={styles.form}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>{t('valuation.personalDataSection')}</h3>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.nameLabel')}
                        {...registerRequest('name')}
                        error={errorsRequest.name?.message}
                      />
                      <Input
                        label={t('valuation.emailLabel')}
                        type="email"
                        {...registerRequest('email')}
                        error={errorsRequest.email?.message}
                      />
                    </div>
                    <Input
                      label={t('valuation.phoneLabel')}
                      type="tel"
                      {...registerRequest('phone')}
                      error={errorsRequest.phone?.message}
                    />
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>{t('valuation.propertyDataSection')}</h3>
                    <div className={styles.formRow}>
                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>{t('valuation.propertyTypeLabel')}</label>
                        <select
                          {...registerRequest('property_type')}
                          className={styles.select}
                        >
                          <option value="apartment">{t('valuation.propertyTypes.apartment')}</option>
                          <option value="house">{t('valuation.propertyTypes.house')}</option>
                          <option value="villa">{t('valuation.propertyTypes.villa')}</option>
                          <option value="office">{t('valuation.propertyTypes.office')}</option>
                          <option value="shop">{t('valuation.propertyTypes.shop')}</option>
                          <option value="warehouse">{t('valuation.propertyTypes.warehouse')}</option>
                          <option value="land">{t('valuation.propertyTypes.land')}</option>
                          <option value="hotel">{t('valuation.propertyTypes.hotel')}</option>
                        </select>
                      </div>
                      <Input
                        label={t('valuation.cityLabel')}
                        {...registerRequest('city')}
                        error={errorsRequest.city?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.neighborhoodLabel')}
                        {...registerRequest('neighborhood')}
                        error={errorsRequest.neighborhood?.message}
                      />
                      <Input
                        label={t('valuation.addressLabel')}
                        {...registerRequest('address')}
                        error={errorsRequest.address?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.areaLabel')}
                        type="number"
                        {...registerRequest('area', { valueAsNumber: true })}
                        error={errorsRequest.area?.message}
                      />
                      <Input
                        label={t('valuation.roomsLabel')}
                        type="number"
                        {...registerRequest('rooms', { valueAsNumber: true })}
                        error={errorsRequest.rooms?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.yearBuiltLabel')}
                        type="number"
                        {...registerRequest('year_built', { valueAsNumber: true })}
                        error={errorsRequest.year_built?.message}
                      />
                      <Input
                        label={t('valuation.currentPriceLabel')}
                        type="number"
                        {...registerRequest('current_price', { valueAsNumber: true })}
                        error={errorsRequest.current_price?.message}
                      />
                    </div>
                    <div className={styles.textareaWrapper}>
                      <label className={styles.label}>{t('valuation.additionalInfoLabel')}</label>
                      <textarea
                        {...registerRequest('message')}
                        className={styles.textarea}
                        rows={4}
                        placeholder={t('valuation.additionalInfoPlaceholder')}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmittingRequest}
                    className={styles.submitButton}
                  >
                    <PaperPlaneTilt size={20} />
                    {isSubmittingRequest ? t('valuation.submittingButton') : t('valuation.submitButton')}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'future' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.content}
            >
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>{t('valuation.futureFormTitle')}</h2>
                <p className={styles.formDescription}>
                  {t('valuation.futureFormDescription')}
                </p>

                <form onSubmit={handleSubmitFuture(onSubmitFuture)} className={styles.form}>
                  <div className={styles.formSection}>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.currentPriceLabel')}
                        type="number"
                        {...registerFuture('current_price', { valueAsNumber: true })}
                        error={errorsFuture.current_price?.message}
                      />
                      <Input
                        label={t('valuation.yearsLabel')}
                        type="number"
                        {...registerFuture('years', { valueAsNumber: true })}
                        error={errorsFuture.years?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label={t('valuation.growthRateLabel')}
                        type="number"
                        step="0.1"
                        {...registerFuture('annual_growth_rate', { valueAsNumber: true })}
                        error={errorsFuture.annual_growth_rate?.message}
                      />
                    </div>

                    {previewPrice && currentPrice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.previewCard}
                      >
                        <div className={styles.previewHeader}>
                          <TrendUp size={24} />
                          <h3>{t('valuation.previewTitle')}</h3>
                        </div>
                        <div className={styles.previewContent}>
                          <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>{t('valuation.currentPricePreview')}</span>
                            <span className={styles.priceValue}>
                              {currentPrice.toLocaleString()} €
                            </span>
                          </div>
                          <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>
                              {t('valuation.futurePricePreview', { years })}
                            </span>
                            <span className={styles.futurePriceValue}>
                              {previewPrice.toLocaleString()} €
                            </span>
                          </div>
                          <div className={styles.growthInfo}>
                            <span>{t('valuation.expectedGrowth', { rate: growthRate })}</span>
                            <span>
                              {t('valuation.totalIncrease', { percent: ((previewPrice / currentPrice - 1) * 100).toFixed(2) })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {futurePrice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.resultCard}
                      >
                        <div className={styles.resultHeader}>
                          <CheckCircle size={24} />
                          <h3>{t('valuation.resultTitle')}</h3>
                        </div>
                        <div className={styles.resultContent}>
                          <p className={styles.resultText}>
                            {t('valuation.resultText', { years })}
                          </p>
                          <p className={styles.resultPrice}>
                            {futurePrice.toLocaleString()} €
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className={styles.submitButton}
                    >
                      <Calculator size={20} />
                      {t('valuation.calculateButton')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

