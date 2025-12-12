'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import styles from './PropertySearch.module.scss';

interface PropertySearchProps {
  // No props needed anymore - just navigation buttons
}

export function PropertySearch({}: PropertySearchProps) {
  const router = useRouter();

  const handleSalesClick = () => {
    router.push('/sale/search');
  };

  const handleRentClick = () => {
    router.push('/rent/search');
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.buttonGroup}>
        <Button variant="outline" onClick={handleSalesClick} className={styles.actionButton} size="lg">
          <CheckCircle size={28} />
          Продажби
        </Button>
        <Button variant="outline" onClick={handleRentClick} className={styles.actionButton} size="lg">
          <Calendar size={28} />
          Наеми
        </Button>
      </div>
    </div>
  );
}

