'use client';

import { useState, useCallback } from 'react';
import { YEAR_SLIDER_MIN, YEAR_SLIDER_MAX } from './types';
import styles from './YearFilter.module.scss';

interface YearFilterProps {
    onFilterChange: (yearFrom: number, yearTo: number, isNotProvided: boolean) => void;
    initialYearFrom?: number;
    initialYearTo?: number;
    initialIsNotProvided?: boolean;
}

export function YearFilter({
    onFilterChange,
    initialYearFrom = YEAR_SLIDER_MIN,
    initialYearTo = YEAR_SLIDER_MAX,
    initialIsNotProvided = false
}: YearFilterProps) {
    const [yearFrom, setYearFrom] = useState(initialYearFrom);
    const [yearTo, setYearTo] = useState(initialYearTo);
    const [isYearNotProvided, setIsYearNotProvided] = useState(initialIsNotProvided);

    const handleYearFromChange = useCallback((val: number) => {
        const clamped = Math.max(YEAR_SLIDER_MIN, Math.min(val, yearTo));
        setYearFrom(clamped);
        setIsYearNotProvided(false);
        onFilterChange(clamped, yearTo, false);
    }, [yearTo, onFilterChange]);

    const handleYearToChange = useCallback((val: number) => {
        const clamped = Math.min(YEAR_SLIDER_MAX, Math.max(val, yearFrom));
        setYearTo(clamped);
        setIsYearNotProvided(false);
        onFilterChange(yearFrom, clamped, false);
    }, [yearFrom, onFilterChange]);

    const handleNotProvidedChange = useCallback((checked: boolean) => {
        setIsYearNotProvided(checked);
        if (checked) {
            setYearFrom(YEAR_SLIDER_MIN);
            setYearTo(YEAR_SLIDER_MAX);
            onFilterChange(YEAR_SLIDER_MIN, YEAR_SLIDER_MAX, true);
        } else {
            onFilterChange(yearFrom, yearTo, false);
        }
    }, [yearFrom, yearTo, onFilterChange]);

    return (
        <div className={styles.yearFilter}>
            <h4 className={styles.featuresTitle}>Година на строителство</h4>
            <div className={styles.yearControls}>
                <div className={styles.dualRangeSlider}>
                    <input
                        type="range"
                        min={YEAR_SLIDER_MIN}
                        max={YEAR_SLIDER_MAX}
                        step={1}
                        value={Math.min(yearFrom, yearTo)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val)) {
                                handleYearFromChange(Math.min(val, yearTo));
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderFrom}`}
                        style={{
                            '--slider-value': `${((Math.min(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`,
                            '--slider-to-value': `${((Math.max(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`
                        } as React.CSSProperties}
                    />
                    <input
                        type="range"
                        min={YEAR_SLIDER_MIN}
                        max={YEAR_SLIDER_MAX}
                        step={1}
                        value={Math.max(yearFrom, yearTo)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val)) {
                                handleYearToChange(Math.max(val, yearFrom));
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderTo}`}
                        style={{
                            '--slider-value': `${((Math.max(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`
                        } as React.CSSProperties}
                    />
                </div>
                <div className={styles.yearInputsRow}>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="year-from" className={styles.yearInputLabel}>
                            От
                        </label>
                        <input
                            type="number"
                            id="year-from"
                            min={YEAR_SLIDER_MIN}
                            max={YEAR_SLIDER_MAX}
                            value={yearFrom}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handleYearFromChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="year-to" className={styles.yearInputLabel}>
                            До
                        </label>
                        <input
                            type="number"
                            id="year-to"
                            min={YEAR_SLIDER_MIN}
                            max={YEAR_SLIDER_MAX}
                            value={yearTo}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handleYearToChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                    <label className={styles.yearNotProvided}>
                        <input
                            type="checkbox"
                            checked={isYearNotProvided}
                            onChange={(e) => handleNotProvidedChange(e.target.checked)}
                        />
                        Не е посочено
                    </label>
                </div>
            </div>
        </div>
    );
}

