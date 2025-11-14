'use client';

import { useState, useCallback } from 'react';
import { WATER_OPTIONS } from './constants';
import type { WaterOption } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface WaterFilterProps {
    onFilterChange: (selectedOptions: string[]) => void;
    initialSelected?: string[];
}

export function WaterFilter({ onFilterChange, initialSelected = [] }: WaterFilterProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);

    const handleToggle = useCallback((optionId: string) => {
        setSelectedOptions((prev) => {
            const updated = prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId];
            onFilterChange(updated);
            return updated;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.constructionFilter}>
            <h4 className={styles.featuresTitle}>Вода</h4>
            <div className={styles.constructionGrid}>
                {WATER_OPTIONS.map((option: WaterOption) => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleToggle(option.id)}
                        >
                            {option.icon && (
                                <span className={styles.featureIcon}>{option.icon}</span>
                            )}
                            <span className={styles.featureLabel}>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


