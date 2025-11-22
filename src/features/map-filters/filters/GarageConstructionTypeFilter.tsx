'use client';

import { useState, useCallback } from 'react';
import { GARAGE_CONSTRUCTION_TYPES } from './constants';
import type { GarageConstructionType } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface GarageConstructionTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function GarageConstructionTypeFilter({ onFilterChange, initialSelected = [] }: GarageConstructionTypeFilterProps) {
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
            <h4 className={styles.featuresTitle}>Вид конструкция</h4>
            <div className={styles.constructionGrid}>
                {GARAGE_CONSTRUCTION_TYPES.map((type: GarageConstructionType) => {
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






