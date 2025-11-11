'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronDown, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './PropertySearch.module.scss';
import { PropertySearchFilters, PropertyType, PropertyStatus } from '@/types';

interface PropertySearchProps {
  onSearch: (filters: PropertySearchFilters) => void;
  isExpanded?: boolean;
  onExpand?: () => void;
}

export function PropertySearch({
  onSearch,
  isExpanded = false,
  onExpand,
}: PropertySearchProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [filters, setFilters] = useState<PropertySearchFilters>({
    location_type: [],
    type: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLocationTypeToggle = (type: 'urban' | 'mountain' | 'coastal') => {
    setFilters((prev) => {
      const current = prev.location_type || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, location_type: updated };
    });
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    setFilters((prev) => {
      const current = prev.type || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, type: updated };
    });
  };

  const handleStatusToggle = (status: PropertyStatus) => {
    setFilters((prev) => {
      const current = prev.status || [];
      const updated = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return { ...prev, status: updated };
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.compactSearch}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              className={styles.searchInput}
              onClick={onExpand}
            />
          </div>
          <Button variant="outline" onClick={onExpand} className={styles.expandButton}>
            {t('common.filter')}
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
              onClick={onExpand}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              className={styles.modalContent}
            >
              <div className={styles.searchHeader}>
                <h2>{t('common.search')}</h2>
                <button onClick={() => onExpand?.()} className={styles.closeButton}>
                  <X />
                </button>
              </div>

              <div className={styles.searchContent}>
                <div className={styles.locationTypeSection}>
                  <label className={styles.label}>{t('search.locationType')}</label>
                  <div className={styles.locationTypeButtons}>
                    {(['urban', 'mountain', 'coastal'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleLocationTypeToggle(type)}
                        className={`${styles.locationTypeButton} ${filters.location_type?.includes(type) ? styles.active : ''
                          }`}
                      >
                        {t(`search.${type}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.propertyTypeSection}>
                  <label className={styles.label}>Тип имот</label>
                  <div className={styles.locationTypeButtons}>
                    {(['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel'] as PropertyType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => handlePropertyTypeToggle(type)}
                        className={`${styles.locationTypeButton} ${filters.type?.includes(type) ? styles.active : ''
                          }`}
                      >
                        {type === 'apartment' && 'Апартамент'}
                        {type === 'house' && 'Къща'}
                        {type === 'villa' && 'Вила'}
                        {type === 'office' && 'Офис'}
                        {type === 'shop' && 'Магазин'}
                        {type === 'warehouse' && 'Склад'}
                        {type === 'land' && 'Земя'}
                        {type === 'hotel' && 'Хотел'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.statusSection}>
                  <label className={styles.label}>Статус</label>
                  <div className={styles.locationTypeButtons}>
                    {(['for-sale', 'for-rent'] as PropertyStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusToggle(status)}
                        className={`${styles.locationTypeButton} ${filters.status?.includes(status) ? styles.active : ''
                          }`}
                      >
                        {status === 'for-sale' ? t('nav.forSale') : t('nav.forRent')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.advancedSection}>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={styles.advancedToggle}
                  >
                    {t('common.filter')}
                    <ChevronDown
                      className={`${styles.chevron} ${showAdvanced ? styles.rotated : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.advancedFilters}
                      >
                        <div className={styles.filterRow}>
                          <Input
                            type="number"
                            label={t('search.priceRange') + ' (мин)'}
                            placeholder="0"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                min_price: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                          <Input
                            type="number"
                            label={t('search.priceRange') + ' (макс)'}
                            placeholder="∞"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                max_price: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                        </div>

                        <div className={styles.filterRow}>
                          <Input
                            type="number"
                            label={t('search.areaRange') + ' (мин)'}
                            placeholder="0"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                min_area: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                          <Input
                            type="number"
                            label={t('search.areaRange') + ' (макс)'}
                            placeholder="∞"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                max_area: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                        </div>

                        <div className={styles.filterRow}>
                          <Input
                            type="number"
                            label={t('search.rooms')}
                            placeholder="0"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                rooms: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                          <Input
                            type="number"
                            label={t('search.bathrooms')}
                            placeholder="0"
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                bathrooms: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.searchActions}>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/map-filters')}
                    className={styles.extendedFiltersButton}
                  >
                    <Map size={18} />
                    Разширени филтри
                  </Button>
                  <div className={styles.rightActions}>
                    <Button variant="outline" onClick={() => setFilters({})}>
                      {t('common.clear')}
                    </Button>
                    <Button variant="primary" onClick={handleSearch}>
                      {t('common.search')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

