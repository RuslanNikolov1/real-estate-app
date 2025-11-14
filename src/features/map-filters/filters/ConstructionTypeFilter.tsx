'use client';

import { useState, useCallback } from 'react';
import { CONSTRUCTION_FILTERS } from './constants';
import type { ConstructionFilter } from './types';
import styles from './ConstructionTypeFilter.module.scss';

interface ConstructionTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function ConstructionTypeFilter({ onFilterChange, initialSelected = [] }: ConstructionTypeFilterProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(initialSelected);

    const handleToggle = useCallback((typeId: string) => {
        setSelectedTypes((prev) => {
            const updated = prev.includes(typeId)
                ? prev.filter((id) => id !== typeId)
                : [...prev, typeId];
            onFilterChange(updated);
            return updated;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.constructionFilter}>
            <h4 className={styles.featuresTitle}>Вид строителство</h4>
            <div className={styles.constructionGrid}>
                {CONSTRUCTION_FILTERS.map((type: ConstructionFilter) => {
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                        <button
                            key={type.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleToggle(type.id)}
                        >
                            {type.icon && (
                                <span className={styles.featureIcon}>{type.icon}</span>
                            )}
                            <span className={styles.featureLabel}>{type.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

