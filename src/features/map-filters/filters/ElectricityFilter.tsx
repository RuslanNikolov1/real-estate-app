'use client';

import { useState, useCallback } from 'react';
import { ELECTRICITY_OPTIONS } from './constants';
import type { ElectricityOption } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface ElectricityFilterProps {
    onFilterChange: (selectedOptions: string[]) => void;
    initialSelected?: string[];
}

export function ElectricityFilter({ onFilterChange, initialSelected = [] }: ElectricityFilterProps) {
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
            <h4 className={styles.featuresTitle}>Ток</h4>
            <div className={styles.constructionGrid}>
                {ELECTRICITY_OPTIONS.map((option: ElectricityOption) => {
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



