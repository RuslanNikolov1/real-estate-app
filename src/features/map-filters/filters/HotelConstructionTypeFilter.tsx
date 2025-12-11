'use client';

import { useState, useCallback, useEffect } from 'react';
import { HOTEL_CONSTRUCTION_TYPES } from './constants';
import type { HotelConstructionType } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface HotelConstructionTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function HotelConstructionTypeFilter({ onFilterChange, initialSelected = [] }: HotelConstructionTypeFilterProps) {
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
            <h4 className={styles.featuresTitle}>Тип строителство</h4>
            <div className={styles.constructionGrid}>
                {HOTEL_CONSTRUCTION_TYPES.map((type: HotelConstructionType) => {
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






