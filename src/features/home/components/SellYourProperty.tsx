'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import styles from './SellYourProperty.module.scss';

export function SellYourProperty() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{t('home.sellYourProperty')}</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={styles.toggleButton}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <X size={24} /> : <Plus size={24} />}
            </button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={styles.content}
              >
                <p className={styles.description}>
                  {t('home.sellPropertyDescription')}
                </p>
                <div className={styles.actions}>
                  <Button variant="primary" size="lg">
                    {t('home.addListing')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}









