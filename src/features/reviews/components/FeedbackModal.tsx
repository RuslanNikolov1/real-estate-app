'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import styles from './FeedbackModal.module.scss';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setComment('');
        setSuccess(false);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !success) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, success, onClose]);

  const handleSubmit = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // #region agent log
      const allCookies = typeof document !== 'undefined' ? document.cookie : '';
      const cookieNames = allCookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FeedbackModal.tsx:handleSubmit:before-fetch',message:'before fetch request',data:{commentLength:comment.trim().length,hasCredentials:typeof document!=='undefined',cookieCount:cookieNames.length,cookieNames:cookieNames,hasSupabaseCookie:cookieNames.some(n=>n.includes('sb-')||n.includes('supabase'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({ comment: comment.trim() }),
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FeedbackModal.tsx:handleSubmit:after-fetch',message:'after fetch request',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={() => !success && onClose()}>
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {!success ? (
              <>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label={t('reviews.modalClose')}
                >
                  <X size={24} weight="bold" />
                </button>

                <h2 className={styles.title}>{t('reviews.modalTitle')}</h2>
                <p className={styles.subtitle}>
                  {t('reviews.modalSubtitle')}
                </p>

                <textarea
                  className={styles.textarea}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviews.modalPlaceholder')}
                  maxLength={500}
                  rows={6}
                  disabled={isSubmitting}
                />
                
                <div className={styles.charCount}>
                  {comment.length}/500
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    {t('reviews.modalCancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !comment.trim()}
                  >
                    {isSubmitting ? t('reviews.modalSubmitting') : t('reviews.modalSubmit')}
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.successMessage}>
                <CheckCircle size={64} weight="fill" className={styles.successIcon} />
                <h3 className={styles.successTitle}>{t('reviews.modalSuccessTitle')}</h3>
                <p className={styles.successText}>
                  {t('reviews.modalSuccessText')}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
