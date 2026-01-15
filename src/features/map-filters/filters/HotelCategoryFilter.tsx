'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translateFilterOptions } from '@/lib/filter-translations';
import { HOTEL_CATEGORIES } from './constants';
import type { HotelCategory } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface HotelCategoryFilterProps {
    onFilterChange: (selectedCategories: string[]) => void;
    initialSelected?: string[];
}

export function HotelCategoryFilter({ onFilterChange, initialSelected = [] }: HotelCategoryFilterProps) {
    const { t } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
    const translatedCategories = translateFilterOptions(HOTEL_CATEGORIES, t, 'filters.hotelCategories');

    const handleToggle = useCallback((categoryId: string) => {
        setSelectedCategories((prev) => {
            const updated = prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId];
            onFilterChange(updated);
            return updated;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.constructionFilter}>
            <h4 className={styles.featuresTitle}>{t('filters.titles.category')}</h4>
            <div className={styles.constructionGrid}>
                {translatedCategories.map((category: HotelCategory) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleToggle(category.id)}
                        >
                            {category.icon && (
                                <span className={styles.featureIcon}>{category.icon}</span>
                            )}
                            <span className={styles.featureLabel}>{category.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}






