'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { WATER_OPTIONS } from './constants';
import type { WaterOption } from './constants';
import styles from './ConstructionTypeFilter.module.scss';

interface WaterFilterProps {
    onFilterChange: (selectedOptions: string[]) => void;
    initialSelected?: string[];
}

export function WaterFilter({ onFilterChange, initialSelected = [] }: WaterFilterProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);
    const isInitialMount = useRef(true);
    const isSyncingFromProps = useRef(false);
    const onFilterChangeRef = useRef(onFilterChange);

    // Keep ref updated
    useEffect(() => {
        onFilterChangeRef.current = onFilterChange;
    }, [onFilterChange]);

    // Sync state when initialSelected prop changes
    useEffect(() => {
        isSyncingFromProps.current = true;
        setSelectedOptions(initialSelected);
        isInitialMount.current = false;
    }, [initialSelected]);

    // Call onFilterChange after state updates (but not on initial mount or prop sync)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (isSyncingFromProps.current) {
            isSyncingFromProps.current = false;
            return;
        }
        onFilterChangeRef.current(selectedOptions);
    }, [selectedOptions]);

    const handleToggle = useCallback((optionId: string) => {
        setSelectedOptions((prev) => {
            const updated = prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId];
            return updated;
        });
    }, []);

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


