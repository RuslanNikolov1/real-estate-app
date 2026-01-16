'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import styles from './PropertySearch.module.scss';

interface PropertySearchProps {
  // No props needed anymore - just navigation buttons
}

export function PropertySearch({}: PropertySearchProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 426);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSalesClick = () => {
    router.push('/sale/search');
  };

  const handleRentClick = () => {
    router.push('/rent/search');
  };

  const buttonSize = isSmallScreen ? 'sm' : 'lg';

  return (
      <div className={styles.searchContainer}>
        <div className={styles.buttonGroup}>
          <Button variant="outline" onClick={handleSalesClick} className={styles.actionButton} size={buttonSize}>
            <CheckCircle size={28} />
            {t('home.salesButton')}
          </Button>
          <Button variant="outline" onClick={handleRentClick} className={styles.actionButton} size={buttonSize}>
            <Calendar size={28} />
            {t('home.rentButton')}
          </Button>
        </div>
      </div>
  );
}

