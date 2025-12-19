'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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

// Filter to only show the specified options: basement, ground, first-residential, not-last, last, attic
const ALLOWED_FLOOR_OPTIONS = ['basement', 'ground', 'first-residential', 'not-last', 'last', 'attic'];

export function FloorFilter({
    onFilterChange,
    initialSpecialOptions = [],
    floorOptions = FLOOR_SPECIAL_OPTIONS
}: FloorFilterProps) {
    // Filter floor options to only show allowed ones
    const filteredFloorOptions = useMemo(() => {
        return floorOptions.filter(option => ALLOWED_FLOOR_OPTIONS.includes(option.id));
    }, [floorOptions]);

    // For multiple selection, keep an array of selected options
    const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSpecialOptions);

    // Sync state when initialSpecialOptions changes
    useEffect(() => {
        setSelectedOptions(initialSpecialOptions);
    }, [initialSpecialOptions]);

    // Sync filter changes to parent when selectedOptions changes (but not on initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Update parent filter state when selection changes
        onFilterChange(0, 0, selectedOptions, false);
    }, [selectedOptions, onFilterChange]);

    const handleToggle = useCallback((optionId: string) => {
        setSelectedOptions((prev) => {
            // If clicking the same item, deselect it
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            }
            // Otherwise, add the new item (multiple selection)
            return [...prev, optionId];
        });
    }, []);

    return (
        <div className={styles.floorFilter}>
            <h4 className={styles.featuresTitle}>Етаж</h4>
            <div className={styles.constructionGrid}>
                {filteredFloorOptions.map((option: FloorSpecialOption) => {
                    const isSelected = selectedOptions.includes(option.id);
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

