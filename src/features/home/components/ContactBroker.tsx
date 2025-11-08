'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './ContactBroker.module.scss';

const contactSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл адрес'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Съобщението трябва да е поне 10 символа'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactBroker() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('home.contactBroker')}</h2>
        <div className={styles.content}>
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <Mail size={24} />
              <div>
                <h3>Имейл</h3>
                <a href="mailto:info@example.com">info@example.com</a>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Phone size={24} />
              <div>
                <h3>Телефон</h3>
                <a href="tel:+359888888888">+359 888 888 888</a>
              </div>
            </div>
            <div className={styles.infoItem}>
              <MessageSquare size={24} />
              <div>
                <h3>Съобщение</h3>
                <p>Попълнете формата отдясно</p>
              </div>
            </div>
          </div>
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
          >
            <Input
              label="Име"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Имейл"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Телефон (по избор)"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <div className={styles.textareaWrapper}>
              <label htmlFor="message" className={styles.label}>
                Съобщение
              </label>
              <textarea
                id="message"
                {...register('message')}
                className={`${styles.textarea} ${errors.message ? styles.error : ''}`}
                rows={5}
              />
              {errors.message && (
                <span className={styles.errorMessage}>
                  {errors.message.message}
                </span>
              )}
            </div>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.successMessage}
              >
                Съобщението е изпратено успешно!
              </motion.div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className={styles.submitButton}
            >
              Изпрати
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

