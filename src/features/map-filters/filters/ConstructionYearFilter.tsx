'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateFilterOptions } from '@/lib/filter-translations';
import { CONSTRUCTION_FILTERS } from './constants';
import { YEAR_SLIDER_MIN, YEAR_SLIDER_MAX } from './types';
import type { ConstructionFilter } from './types';
import styles from './ConstructionYearFilter.module.scss';

interface ConstructionYearFilterProps {
    onConstructionChange: (selectedTypes: string[]) => void;
    onYearChange: (yearFrom: number, yearTo: number, isNotProvided: boolean) => void;
    initialSelectedTypes?: string[];
    initialYearFrom?: number;
    initialYearTo?: number;
    initialIsYearNotProvided?: boolean;
}

export function ConstructionYearFilter({
    onConstructionChange,
    onYearChange,
    initialSelectedTypes = [],
    initialYearFrom = YEAR_SLIDER_MIN,
    initialYearTo = YEAR_SLIDER_MAX,
    initialIsYearNotProvided = false
}: ConstructionYearFilterProps) {
    const { t } = useTranslation();
    // For single selection, we only keep the first item or null
    const [selectedType, setSelectedType] = useState<string | null>(initialSelectedTypes.length > 0 ? initialSelectedTypes[0] : null);
    const [yearFrom, setYearFrom] = useState(initialYearFrom);
    const [yearTo, setYearTo] = useState(initialYearTo);
    const [isYearNotProvided, setIsYearNotProvided] = useState(initialIsYearNotProvided);
    const translatedTypes = translateFilterOptions(CONSTRUCTION_FILTERS, t, 'filters.construction');

    // Sync state when initialSelectedTypes changes
    useEffect(() => {
        setSelectedType(initialSelectedTypes.length > 0 ? initialSelectedTypes[0] : null);
    }, [initialSelectedTypes]);

    const handleConstructionToggle = useCallback((typeId: string) => {
        setSelectedType((prev) => {
            // If clicking the same item, deselect it
            if (prev === typeId) {
                onConstructionChange([]);
                return null;
            }
            // Otherwise, select the new item (single selection)
            onConstructionChange([typeId]);
            return typeId;
        });
    }, [onConstructionChange]);

    const handleYearFromChange = useCallback((val: number) => {
        const clamped = Math.max(YEAR_SLIDER_MIN, Math.min(val, yearTo));
        setYearFrom(clamped);
        setIsYearNotProvided(false);
        onYearChange(clamped, yearTo, false);
    }, [yearTo, onYearChange]);

    const handleYearToChange = useCallback((val: number) => {
        const clamped = Math.min(YEAR_SLIDER_MAX, Math.max(val, yearFrom));
        setYearTo(clamped);
        setIsYearNotProvided(false);
        onYearChange(yearFrom, clamped, false);
    }, [yearFrom, onYearChange]);

    const handleNotProvidedChange = useCallback((checked: boolean) => {
        setIsYearNotProvided(checked);
        if (checked) {
            setYearFrom(YEAR_SLIDER_MIN);
            setYearTo(YEAR_SLIDER_MAX);
            onYearChange(YEAR_SLIDER_MIN, YEAR_SLIDER_MAX, true);
        } else {
            onYearChange(yearFrom, yearTo, false);
        }
    }, [yearFrom, yearTo, onYearChange]);

    return (
        <div className={styles.container}>
            {/* Construction Type Section */}
            <div className={styles.constructionFilter}>
                <h4 className={styles.title}>{t('filters.titles.construction')}</h4>
                <div className={styles.constructionGrid}>
                    {translatedTypes.map((type: ConstructionFilter) => {
                        const isSelected = selectedType === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                                onClick={() => handleConstructionToggle(type.id)}
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

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Year Section */}
            <div className={styles.yearFilter}>
                <h4 className={styles.title}>{t('filters.common.from')} {yearFrom} {t('filters.common.to')} {yearTo}</h4>
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
                                {t('filters.common.from')}
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
                                {t('filters.common.to')}
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
                            {t('filters.common.notSpecified')}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

