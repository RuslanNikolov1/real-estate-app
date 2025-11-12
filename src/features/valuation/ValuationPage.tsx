'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calculator,
  TrendUp,
  PaperPlaneTilt,
  CheckCircle,
} from '@phosphor-icons/react';
import styles from './ValuationPage.module.scss';

const valuationRequestSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().min(1, 'Телефонът е задължителен'),
  property_type: z.enum(['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel']),
  city: z.string().min(1, 'Градът е задължителен'),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  area: z.number().min(1, 'Площта трябва да е положително число'),
  rooms: z.number().optional(),
  year_built: z.number().optional(),
  current_price: z.number().optional(),
  message: z.string().optional(),
});

type ValuationRequestFormData = z.infer<typeof valuationRequestSchema>;

const futurePriceSchema = z.object({
  current_price: z.number().min(1, 'Текущата цена е задължителна'),
  years: z.number().min(1, 'Броят години трябва да е поне 1').max(30, 'Максимум 30 години'),
  annual_growth_rate: z.number().min(0, 'Процентът на растеж не може да е отрицателен').max(20, 'Максимум 20%'),
});

type FuturePriceFormData = z.infer<typeof futurePriceSchema>;

export function ValuationPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'future'>('manual');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [futurePrice, setFuturePrice] = useState<number | null>(null);

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest, isSubmitting: isSubmittingRequest },
    reset: resetRequest,
  } = useForm<ValuationRequestFormData>({
    resolver: zodResolver(valuationRequestSchema),
    defaultValues: {
      property_type: 'apartment',
      city: 'Бургас',
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
      alert('Грешка при изпращането на запитването. Моля, опитайте отново.');
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
            <h1 className={styles.title}>Имотни оценки</h1>
            <p className={styles.subtitle}>
              Получете професионална оценка на вашия имот или изчислете бъдещата му стойност
            </p>
          </motion.div>

          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('manual')}
              className={`${styles.tab} ${activeTab === 'manual' ? styles.active : ''}`}
            >
              <Calculator size={20} />
              Ръчна оценка от консултант
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className={`${styles.tab} ${activeTab === 'future' ? styles.active : ''}`}
            >
              <TrendUp size={20} />
              Прогноза за бъдеща цена
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
                <h2 className={styles.formTitle}>Заявка за оценка от консултант</h2>
                <p className={styles.formDescription}>
                  Попълнете формата по-долу и нашият експерт ще се свърже с вас за професионална оценка на вашия имот.
                </p>

                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.successMessage}
                  >
                    <CheckCircle size={24} />
                    <div>
                      <h3>Заявката е изпратена успешно!</h3>
                      <p>Нашият консултант ще се свърже с вас в най-близко време.</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmitRequest(onSubmitRequest)} className={styles.form}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Лични данни</h3>
                    <div className={styles.formRow}>
                      <Input
                        label="Име *"
                        {...registerRequest('name')}
                        error={errorsRequest.name?.message}
                      />
                      <Input
                        label="Имейл *"
                        type="email"
                        {...registerRequest('email')}
                        error={errorsRequest.email?.message}
                      />
                    </div>
                    <Input
                      label="Телефон *"
                      type="tel"
                      {...registerRequest('phone')}
                      error={errorsRequest.phone?.message}
                    />
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Данни за имота</h3>
                    <div className={styles.formRow}>
                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>Тип имот *</label>
                        <select
                          {...registerRequest('property_type')}
                          className={styles.select}
                        >
                          <option value="apartment">Апартамент</option>
                          <option value="house">Къща</option>
                          <option value="villa">Вила</option>
                          <option value="office">Офис</option>
                          <option value="shop">Магазин</option>
                          <option value="warehouse">Склад</option>
                          <option value="land">Земя</option>
                          <option value="hotel">Хотел</option>
                        </select>
                      </div>
                      <Input
                        label="Град *"
                        {...registerRequest('city')}
                        error={errorsRequest.city?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label="Квартал"
                        {...registerRequest('neighborhood')}
                        error={errorsRequest.neighborhood?.message}
                      />
                      <Input
                        label="Адрес"
                        {...registerRequest('address')}
                        error={errorsRequest.address?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label="Площ (м²) *"
                        type="number"
                        {...registerRequest('area', { valueAsNumber: true })}
                        error={errorsRequest.area?.message}
                      />
                      <Input
                        label="Стаи"
                        type="number"
                        {...registerRequest('rooms', { valueAsNumber: true })}
                        error={errorsRequest.rooms?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label="Година на строеж"
                        type="number"
                        {...registerRequest('year_built', { valueAsNumber: true })}
                        error={errorsRequest.year_built?.message}
                      />
                      <Input
                        label="Текуща цена (лв)"
                        type="number"
                        {...registerRequest('current_price', { valueAsNumber: true })}
                        error={errorsRequest.current_price?.message}
                      />
                    </div>
                    <div className={styles.textareaWrapper}>
                      <label className={styles.label}>Допълнителна информация</label>
                      <textarea
                        {...registerRequest('message')}
                        className={styles.textarea}
                        rows={4}
                        placeholder="Опишете допълнителни детайли за имота..."
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
                    {isSubmittingRequest ? 'Изпращане...' : 'Изпрати заявка'}
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
                <h2 className={styles.formTitle}>Прогноза за бъдеща цена</h2>
                <p className={styles.formDescription}>
                  Изчислете колко ще бъде цената на вашия имот в бъдеще, базирано на очаквания годишен процент на растеж.
                </p>

                <form onSubmit={handleSubmitFuture(onSubmitFuture)} className={styles.form}>
                  <div className={styles.formSection}>
                    <div className={styles.formRow}>
                      <Input
                        label="Текуща цена (лв) *"
                        type="number"
                        {...registerFuture('current_price', { valueAsNumber: true })}
                        error={errorsFuture.current_price?.message}
                      />
                      <Input
                        label="Брой години *"
                        type="number"
                        {...registerFuture('years', { valueAsNumber: true })}
                        error={errorsFuture.years?.message}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <Input
                        label="Годишен процент на растеж (%) *"
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
                          <h3>Прогнозна цена</h3>
                        </div>
                        <div className={styles.previewContent}>
                          <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>Текуща цена:</span>
                            <span className={styles.priceValue}>
                              {currentPrice.toLocaleString()} лв
                            </span>
                          </div>
                          <div className={styles.priceRow}>
                            <span className={styles.priceLabel}>
                              След {years} {years === 1 ? 'година' : 'години'}:
                            </span>
                            <span className={styles.futurePriceValue}>
                              {previewPrice.toLocaleString()} лв
                            </span>
                          </div>
                          <div className={styles.growthInfo}>
                            <span>Очакван растеж: {growthRate}% годишно</span>
                            <span>
                              Общо увеличение: {((previewPrice / currentPrice - 1) * 100).toFixed(2)}%
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
                          <h3>Резултат</h3>
                        </div>
                        <div className={styles.resultContent}>
                          <p className={styles.resultText}>
                            Прогнозната цена на имота след {years} {years === 1 ? 'година' : 'години'} е:
                          </p>
                          <p className={styles.resultPrice}>
                            {futurePrice.toLocaleString()} лв
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
                      Изчисли бъдеща цена
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

