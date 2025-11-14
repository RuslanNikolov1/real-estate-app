'use client';

import { useState, useCallback } from 'react';
import { BUILDING_TYPES } from './constants';
import type { BuildingType } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface BuildingTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function BuildingTypeFilter({ onFilterChange, initialSelected = [] }: BuildingTypeFilterProps) {
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
            <h4 className={styles.featuresTitle}>Вид сграда</h4>
            <div className={styles.constructionGrid}>
                {BUILDING_TYPES.map((type: BuildingType) => {
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


