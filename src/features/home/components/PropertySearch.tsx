'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  MapTrifold,
  CheckCircle,
  Calendar
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './PropertySearch.module.scss';
import { propertyTypes } from '@/data/propertyTypes';
import { PropertySearchFilters, PropertyType } from '@/types';

interface PropertySearchProps {
  isExpanded?: boolean;
  onExpand?: () => void;
  onSearch?: (searchFilters: PropertySearchFilters) => void;
}

export function PropertySearch({
  isExpanded = false,
  onExpand,
  onSearch,
}: PropertySearchProps) {
  const { t } = useTranslation();
  const [selectedButton, setSelectedButton] = useState<'sales' | 'rent' | null>(null);
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);

  const handleSalesClick = () => {
    setSelectedButton('sales');
    onExpand?.();
  };

  const handleRentClick = () => {
    setSelectedButton('rent');
    onExpand?.();
  };

  const handleClose = () => {
    setSelectedButton(null);
    setSelectedPropertyTypes([]);
    setCity('');
    setCityError('');
    onExpand?.();
  };

  const handlePropertyTypeToggle = (typeId: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleExtendedFiltersClick = () => {
    window.location.href = '/map-filters';
    handleClose();
  };

  const handleSearchSubmit = () => {
    if (!selectedButton) return;

    // Validate city
    if (!city.trim()) {
      setCityError('Моля, въведете град');
      return;
    }

    setCityError('');

    // If onSearch callback is provided, call it with filters
    if (onSearch) {
      const searchFilters: PropertySearchFilters = {
        city: city.trim(),
        status: selectedButton === 'sales' ? ['for-sale'] : ['for-rent'],
        type: selectedPropertyTypes.length > 0 
          ? (selectedPropertyTypes as PropertyType[])
          : undefined,
      };
      onSearch(searchFilters);
      return;
    }

    // Otherwise, use the default navigation behavior
    const params = new URLSearchParams();

    params.set('mode', selectedButton);
    params.set('city', city.trim());

    if (selectedPropertyTypes.length > 0) {
      params.set('types', selectedPropertyTypes.join(','));
    }

    window.location.href = `/properties?${params.toString()}`;
  };

  const canSearch =
    city.trim() !== '' && (selectedButton === 'rent' ? true : selectedPropertyTypes.length > 0);

  return (
    <>
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

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalBackdrop}
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              className={styles.modalContent}
            >
              <div className={styles.searchHeader}>
                <button onClick={handleClose} className={styles.closeButton}>
                  <X weight="bold" size={24} />
                </button>
              </div>

              <div className={styles.topFilters}>
                <Input
                  id="modal-city"
                  placeholder="Въведете град"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    if (cityError) {
                      setCityError('');
                    }
                  }}
                  error={cityError}
                  className={styles.cityInput}
                />
              </div>

              <div className={styles.searchContent}>
                {selectedButton === 'sales' ? (
                  <>
                    <div className={styles.propertyTypesGrid}>
                      {propertyTypes.map((type) => {
                        const IconComponent = type.icon;
                        const isSelected = selectedPropertyTypes.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            className={`${styles.propertyTypeButton} ${isSelected ? styles.selected : ''}`}
                            onClick={() => handlePropertyTypeToggle(type.id)}
                            aria-pressed={isSelected}
                          >
                            <div className={styles.propertyTypeContent}>
                              <IconComponent size={28} weight="fill" />
                              <span>{type.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className={styles.searchActions}>
                    <Button
                      variant="outline"
                      onClick={handleExtendedFiltersClick}
                      className={styles.extendedFiltersButton}
                    >
                      <MapTrifold size={18} />
                      Разширени филтри
                    </Button>
                    <div className={styles.rightActions}>
                      <Button variant="primary" onClick={handleSearchSubmit} disabled={!selectedButton || !city.trim()}>
                        {t('common.search')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <div className={styles.leftActions}>
                  <Button
                    variant="outline"
                    onClick={handleExtendedFiltersClick}
                    className={styles.extendedFiltersButton}
                  >
                    <MapTrifold size={18} />
                    Разширени филтри
                  </Button>
                </div>
                <Button
                  variant="primary"
                  onClick={handleSearchSubmit}
                  disabled={!selectedButton || !canSearch}
                  className={styles.modalSearchButton}
                >
                  {t('common.search')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

