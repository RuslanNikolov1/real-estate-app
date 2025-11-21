'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FunnelIcon,
  CheckCircle,
  Calendar
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import burgasCities from '@/data/burgasCities.json';
import styles from './PropertySearch.module.scss';
import { propertyTypes } from '@/data/propertyTypes';

interface PropertySearchProps {
  isExpanded?: boolean;
  onExpand?: () => void;
  onSearch?: (searchFilters: { mode: 'sales' | 'rent'; city: string; types?: string[] }) => void;
}

export function PropertySearch({
  isExpanded = false,
  onExpand,
  onSearch,
}: PropertySearchProps) {
  const { t } = useTranslation();
  const isLandingExperience = !onSearch;
  const [selectedButton, setSelectedButton] = useState<'sales' | 'rent' | null>(null);
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

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
    setShowCityDropdown(false);
    onExpand?.();
  };

  const handlePropertyTypeSelect = (typeId: string) => {
    if (isLandingExperience) {
      window.location.href = `/mock-search?type=${typeId}`;
      handleClose();
      return;
    }

    if (selectedButton === 'sales') {
      window.location.href = `/sale/search/${typeId}`;
      handleClose();
      return;
    }

    if (selectedButton === 'rent') {
      window.location.href = `/rent/search/${typeId}`;
      handleClose();
      return;
    }

    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSearchSubmit = () => {
    if (isLandingExperience || !selectedButton) return;

    if (!city.trim()) {
      setCityError('Моля, въведете град');
      return;
    }

    setCityError('');

    const searchFilters = {
      mode: selectedButton,
      city: city.trim(),
      types: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
    };

    if (onSearch) {
      onSearch(searchFilters);
    } else {
      const params = new URLSearchParams();
      params.set('mode', selectedButton);
      params.set('city', city.trim());
      if (selectedPropertyTypes.length > 0) {
        params.set('types', selectedPropertyTypes.join(','));
      }
      window.location.href = `/properties?${params.toString()}`;
    }
  };

  const handleExtendedFiltersClick = () => {
    if (selectedButton === 'sales') {
      window.location.href = '/sale/search';
      handleClose();
      return;
    }
    if (selectedButton === 'rent') {
      window.location.href = '/rent/search';
      handleClose();
      return;
    }
    window.location.href = '/map-filters';
    handleClose();
  };

  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
    setCityError('');
    setShowCityDropdown(false);
  };

  const filteredCities = useMemo(() => {
    const term = city.trim().toLowerCase();
    if (!term) {
      return burgasCities.cities.slice(0, 6);
    }
    return burgasCities.cities.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.nameEn.toLowerCase().includes(term)
      );
    });
  }, [city]);

  useEffect(() => {
    if (!showCityDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        cityDropdownRef.current?.contains(target) ||
        cityInputRef.current?.contains(target)
      ) {
        return;
      }
      setShowCityDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCityDropdown]);

  useEffect(() => {
    if (!isExpanded) {
      setShowCityDropdown(false);
    }
  }, [isExpanded]);

  const canSearch =
    city.trim() !== '' && selectedButton !== null && selectedPropertyTypes.length > 0;

  // Filter property types based on mode
  const availablePropertyTypes = useMemo(() => {
    if (selectedButton === 'rent') {
      // Rent-specific categories
      const rentCategories = [
        'apartments',
        'houses-villas',
        'stores-offices',
        'building-plots',
        'warehouses-industrial',
        'garages-parking',
        'hotels-motels',
        'restaurants'
      ];
      
      return propertyTypes
        .filter(type => rentCategories.includes(type.id))
        .map(type => {
          // Override labels for rent mode
          const labelOverrides: Record<string, string> = {
            'houses-villas': 'Къщи',
            'building-plots': 'Парцели/Терени',
            'warehouses-industrial': 'Складове/Промишлени и стопански имоти под наем',
            'garages-parking': 'Гаражи/Паркинги/Паркоместа под наем',
            'hotels-motels': 'Хотели/Почивни станции',
            'restaurants': 'Заведения'
          };
          
          return {
            ...type,
            label: labelOverrides[type.id] || type.label
          };
        });
    }
    // For sales, show all property types
    return propertyTypes;
  }, [selectedButton]);

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
                <div className={styles.cityDropdownWrapper}>
                  <Input
                    id="modal-city"
                    placeholder="Въведете град"
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      if (!isLandingExperience && cityError) {
                        setCityError('');
                      }
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    ref={cityInputRef}
                    error={isLandingExperience ? undefined : cityError}
                    className={styles.cityInput}
                    autoComplete="off"
                  />
                  {showCityDropdown && (
                    <div className={styles.cityDropdown} ref={cityDropdownRef}>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={styles.cityDropdownItem}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleCitySelect(c.name)}
                          >
                            <span className={styles.cityName}>{c.name}</span>
                            <span className={styles.cityNameEn}>{c.nameEn}</span>
                          </button>
                        ))
                      ) : (
                        <div className={styles.cityDropdownEmpty}>
                          Няма съвпадения
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.searchContent}>
                {selectedButton && (
                  <div className={styles.propertyTypesGrid}>
                    {availablePropertyTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = selectedPropertyTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          className={`${styles.propertyTypeButton} ${
                            !isLandingExperience && isSelected ? styles.selected : ''
                          }`}
                          onClick={() => handlePropertyTypeSelect(type.id)}
                          aria-pressed={!isLandingExperience ? isSelected : undefined}
                        >
                          <div className={styles.propertyTypeContent}>
                            <IconComponent size={28} weight="fill" />
                            <span>{type.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <div className={styles.leftActions}>
                  <Button
                    onClick={handleExtendedFiltersClick}
                    className={styles.extendedFiltersButton}
                  >
                    <FunnelIcon size={18} />
                    Разширени филтри
                  </Button>
                </div>
                {!isLandingExperience && (
                  <Button
                    variant="primary"
                    onClick={handleSearchSubmit}
                    disabled={!selectedButton || !canSearch}
                    className={styles.modalSearchButton}
                  >
                    {t('common.search')}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

