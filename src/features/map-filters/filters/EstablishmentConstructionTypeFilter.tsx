'use client';

import { useState, useCallback } from 'react';
import { ESTABLISHMENT_CONSTRUCTION_TYPES } from './constants';
import type { EstablishmentConstructionType } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface EstablishmentConstructionTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function EstablishmentConstructionTypeFilter({ onFilterChange, initialSelected = [] }: EstablishmentConstructionTypeFilterProps) {
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
            <h4 className={styles.featuresTitle}>Тип строителство</h4>
            <div className={styles.constructionGrid}>
                {ESTABLISHMENT_CONSTRUCTION_TYPES.map((type: EstablishmentConstructionType) => {
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




