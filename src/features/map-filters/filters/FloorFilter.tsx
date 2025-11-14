'use client';

import { useState, useCallback } from 'react';
import { FLOOR_SPECIAL_OPTIONS } from './constants';
import { FLOOR_SLIDER_MIN, FLOOR_SLIDER_MAX } from './types';
import type { FloorSpecialOption } from './types';
import styles from './FloorFilter.module.scss';

interface FloorFilterProps {
    onFilterChange: (floorFrom: number, floorTo: number, specialOptions: string[], isNotProvided: boolean) => void;
    initialFloorFrom?: number;
    initialFloorTo?: number;
    initialSpecialOptions?: string[];
    initialIsNotProvided?: boolean;
    floorOptions?: FloorSpecialOption[];
}

export function FloorFilter({
    onFilterChange,
    initialFloorFrom = FLOOR_SLIDER_MIN,
    initialFloorTo = FLOOR_SLIDER_MAX,
    initialSpecialOptions = [],
    initialIsNotProvided = false,
    floorOptions = FLOOR_SPECIAL_OPTIONS
}: FloorFilterProps) {
    const [floorFrom, setFloorFrom] = useState(initialFloorFrom);
    const [floorTo, setFloorTo] = useState(initialFloorTo);
    const [selectedFloorOptions, setSelectedFloorOptions] = useState<string[]>(initialSpecialOptions);
    const [isFloorNotProvided, setIsFloorNotProvided] = useState(initialIsNotProvided);

    const handleFloorOptionToggle = useCallback((optionId: string) => {
        setSelectedFloorOptions((prev) => {
            const updated = prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId];
            setIsFloorNotProvided(false);
            onFilterChange(floorFrom, floorTo, updated, false);
            return updated;
        });
    }, [floorFrom, floorTo, onFilterChange]);

    const handleFloorFromChange = useCallback((val: number) => {
        const clamped = Math.max(FLOOR_SLIDER_MIN, Math.min(val, floorTo));
        setFloorFrom(clamped);
        setIsFloorNotProvided(false);
        onFilterChange(clamped, floorTo, selectedFloorOptions, false);
    }, [floorTo, selectedFloorOptions, onFilterChange]);

    const handleFloorToChange = useCallback((val: number) => {
        const clamped = Math.min(FLOOR_SLIDER_MAX, Math.max(val, floorFrom));
        setFloorTo(clamped);
        setIsFloorNotProvided(false);
        onFilterChange(floorFrom, clamped, selectedFloorOptions, false);
    }, [floorFrom, selectedFloorOptions, onFilterChange]);

    return (
        <div className={styles.floorFilter}>
            <h4 className={styles.featuresTitle}>Етаж</h4>
            <div className={styles.floorControls}>
                <div className={styles.dualRangeSlider}>
                    <input
                        type="range"
                        min={FLOOR_SLIDER_MIN}
                        max={FLOOR_SLIDER_MAX}
                        step={1}
                        value={Math.min(floorFrom, floorTo)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val)) {
                                handleFloorFromChange(Math.min(val, floorTo));
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderFrom}`}
                        style={{
                            '--slider-value': `${((Math.min(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`,
                            '--slider-to-value': `${((Math.max(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`
                        } as React.CSSProperties}
                    />
                    <input
                        type="range"
                        min={FLOOR_SLIDER_MIN}
                        max={FLOOR_SLIDER_MAX}
                        step={1}
                        value={Math.max(floorFrom, floorTo)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val)) {
                                handleFloorToChange(Math.max(val, floorFrom));
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderTo}`}
                        style={{
                            '--slider-value': `${((Math.max(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`
                        } as React.CSSProperties}
                    />
                </div>
                <div className={styles.yearInputsRow}>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="floor-from" className={styles.yearInputLabel}>
                            От
                        </label>
                        <input
                            type="number"
                            id="floor-from"
                            min={FLOOR_SLIDER_MIN}
                            max={FLOOR_SLIDER_MAX}
                            value={floorFrom}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handleFloorFromChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="floor-to" className={styles.yearInputLabel}>
                            До
                        </label>
                        <input
                            type="number"
                            id="floor-to"
                            min={FLOOR_SLIDER_MIN}
                            max={FLOOR_SLIDER_MAX}
                            value={floorTo}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handleFloorToChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                </div>
                <div className={styles.floorOptions}>
                    {floorOptions.map((option: FloorSpecialOption) => {
                        const isSelected = selectedFloorOptions.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={`${styles.floorOptionButton} ${isSelected ? styles.floorOptionButtonActive : ''}`}
                                onClick={() => handleFloorOptionToggle(option.id)}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

