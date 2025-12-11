'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { FLOOR_SPECIAL_OPTIONS } from './constants';
import type { FloorSpecialOption } from './types';
import styles from './FloorFilter.module.scss';

interface FloorFilterProps {
    onFilterChange: (floorFrom: number, floorTo: number, selectedOptions: string[], isNotProvided: boolean) => void;
    initialFloorFrom?: number;
    initialFloorTo?: number;
    initialSpecialOptions?: string[];
    initialIsNotProvided?: boolean;
    floorOptions?: FloorSpecialOption[];
}

// Filter to only show the specified options: basement, first-residential, not-last, last, attic
const ALLOWED_FLOOR_OPTIONS = ['basement', 'first-residential', 'not-last', 'last', 'attic'];

export function FloorFilter({
    onFilterChange,
    initialSpecialOptions = [],
    floorOptions = FLOOR_SPECIAL_OPTIONS
}: FloorFilterProps) {
    // Filter floor options to only show allowed ones
    const filteredFloorOptions = useMemo(() => {
        return floorOptions.filter(option => ALLOWED_FLOOR_OPTIONS.includes(option.id));
    }, [floorOptions]);

    // For single selection, we only keep the first item or null
    const [selectedOption, setSelectedOption] = useState<string | null>(
        initialSpecialOptions.length > 0 ? initialSpecialOptions[0] : null
    );

    // Sync state when initialSpecialOptions changes
    useEffect(() => {
        setSelectedOption(initialSpecialOptions.length > 0 ? initialSpecialOptions[0] : null);
    }, [initialSpecialOptions]);

    const handleToggle = useCallback((optionId: string) => {
        setSelectedOption((prev) => {
            // If clicking the same item, deselect it
            if (prev === optionId) {
                // Pass undefined for floorFrom/floorTo since we don't use sliders anymore
                onFilterChange(0, 0, [], false);
                return null;
            }
            // Otherwise, select the new item (single selection)
            // Pass undefined for floorFrom/floorTo since we don't use sliders anymore
            onFilterChange(0, 0, [optionId], false);
            return optionId;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.floorFilter}>
            <h4 className={styles.featuresTitle}>Етаж</h4>
            <div className={styles.constructionGrid}>
                {filteredFloorOptions.map((option: FloorSpecialOption) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleToggle(option.id)}
                        >
                            <span className={styles.featureLabel}>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

