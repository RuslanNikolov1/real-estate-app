'use client';

import { useState, useCallback, useEffect } from 'react';
import { CONSTRUCTION_FILTERS } from './constants';
import type { ConstructionFilter } from './types';
import styles from './ConstructionTypeFilter.module.scss';

interface ConstructionTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function ConstructionTypeFilter({ onFilterChange, initialSelected = [] }: ConstructionTypeFilterProps) {
    // For single selection, we only keep the first item or null
    const [selectedType, setSelectedType] = useState<string | null>(initialSelected.length > 0 ? initialSelected[0] : null);

    // Sync state when initialSelected changes
    useEffect(() => {
        setSelectedType(initialSelected.length > 0 ? initialSelected[0] : null);
    }, [initialSelected]);

    const handleToggle = useCallback((typeId: string) => {
        setSelectedType((prev) => {
            // If clicking the same item, deselect it
            if (prev === typeId) {
                onFilterChange([]);
                return null;
            }
            // Otherwise, select the new item (single selection)
            onFilterChange([typeId]);
            return typeId;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.constructionFilter}>
            <h4 className={styles.featuresTitle}>Вид строителство</h4>
            <div className={styles.constructionGrid}>
                {CONSTRUCTION_FILTERS.map((type: ConstructionFilter) => {
                    const isSelected = selectedType === type.id;
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

