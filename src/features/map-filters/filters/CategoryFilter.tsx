'use client';

import { useState, useCallback } from 'react';
import { AGRICULTURAL_CATEGORIES } from './constants';
import type { CategoryOption } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface CategoryFilterProps {
    onFilterChange: (selectedCategories: string[]) => void;
    initialSelected?: string[];
}

export function CategoryFilter({ onFilterChange, initialSelected = [] }: CategoryFilterProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);

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
            <h4 className={styles.featuresTitle}>Категория</h4>
            <div className={styles.constructionGrid}>
                {AGRICULTURAL_CATEGORIES.map((category: CategoryOption) => {
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


