'use client';

import { useState, useCallback, useEffect } from 'react';
import { HOTEL_BED_BASE_PRESETS } from './constants';
import { HOTELS_BED_BASE_SLIDER_MAX } from './types';
import type { BedBasePreset } from './constants';
import styles from './YearFilter.module.scss';
import constructionStyles from './ConstructionTypeFilter.module.scss';
import areaStyles from './AreaFilter.module.scss';

interface BedBaseFilterProps {
    onFilterChange: (bedBaseFrom: number, bedBaseTo: number, isNotProvided: boolean) => void;
    initialBedBaseFrom?: number;
    initialBedBaseTo?: number;
    initialIsNotProvided?: boolean;
    presets?: BedBasePreset[];
}

export function BedBaseFilter({
    onFilterChange,
    initialBedBaseFrom = 0,
    initialBedBaseTo = HOTELS_BED_BASE_SLIDER_MAX,
    initialIsNotProvided = false,
    presets = HOTEL_BED_BASE_PRESETS
}: BedBaseFilterProps) {
    const [bedBaseFrom, setBedBaseFrom] = useState(initialBedBaseFrom);
    const [bedBaseTo, setBedBaseTo] = useState(initialBedBaseTo);
    const [bedBaseFromInput, setBedBaseFromInput] = useState<string>(String(initialBedBaseFrom));
    const [bedBaseToInput, setBedBaseToInput] = useState<string>(String(initialBedBaseTo));
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [isNotProvided, setIsNotProvided] = useState(initialIsNotProvided || false);

    // Sync input values when state changes from external sources (e.g., presets)
    useEffect(() => {
        setBedBaseFromInput(String(bedBaseFrom));
    }, [bedBaseFrom]);

    useEffect(() => {
        setBedBaseToInput(String(bedBaseTo));
    }, [bedBaseTo]);

    const handleBedBaseFromChange = useCallback((val: number) => {
        // Allow values above slider max in internal state, but ensure from <= to
        if (val >= 0 && val <= bedBaseTo) {
            setBedBaseFrom(val);
            setSelectedPresetId(null);
            setIsNotProvided(false);
            onFilterChange(val, bedBaseTo, false);
        }
    }, [bedBaseTo, onFilterChange]);

    const handleBedBaseToChange = useCallback((val: number) => {
        // Allow values above slider max in internal state
        if (val >= bedBaseFrom) {
            setBedBaseTo(val);
            setSelectedPresetId(null);
            setIsNotProvided(false);
            onFilterChange(bedBaseFrom, val, false);
        }
    }, [bedBaseFrom, onFilterChange]);

    const handlePresetClick = useCallback((preset: BedBasePreset) => {
        setBedBaseFrom(preset.from);
        setBedBaseTo(preset.to);
        setSelectedPresetId(preset.id);
        setIsNotProvided(false);
        onFilterChange(preset.from, preset.to, false);
    }, [onFilterChange]);

    const handleNotProvidedClick = useCallback(() => {
        setSelectedPresetId(null);
        setIsNotProvided(true);
        onFilterChange(0, 0, true);
    }, [onFilterChange]);

    const bedBaseFromClamped = Math.max(0, Math.min(bedBaseFrom, HOTELS_BED_BASE_SLIDER_MAX));
    const bedBaseToClamped = Math.max(0, Math.min(bedBaseTo, HOTELS_BED_BASE_SLIDER_MAX));

    return (
        <div className={constructionStyles.constructionFilter}>
            <h4 className={constructionStyles.featuresTitle}>Леглова база</h4>
            <div className={styles.yearControls}>
                <div className={styles.dualRangeSlider}>
                    <input
                        type="range"
                        min={0}
                        max={HOTELS_BED_BASE_SLIDER_MAX}
                        step={1}
                        value={Math.min(bedBaseFromClamped, bedBaseToClamped)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val)) {
                                handleBedBaseFromChange(Math.min(val, bedBaseTo));
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderFrom}`}
                        style={{
                            '--slider-value': `${((Math.min(bedBaseFromClamped, bedBaseToClamped) - 0) / HOTELS_BED_BASE_SLIDER_MAX) * 100}%`,
                            '--slider-to-value': `${((Math.max(bedBaseFromClamped, bedBaseToClamped) - 0) / HOTELS_BED_BASE_SLIDER_MAX) * 100}%`
                        } as React.CSSProperties}
                    />
                    <input
                        type="range"
                        min={0}
                        max={HOTELS_BED_BASE_SLIDER_MAX}
                        step={1}
                        value={Math.max(bedBaseFromClamped, bedBaseToClamped)}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= bedBaseFrom) {
                                handleBedBaseToChange(val);
                            }
                        }}
                        className={`${styles.yearSlider} ${styles.yearSliderTo}`}
                        style={{
                            '--slider-value': `${((Math.max(bedBaseFromClamped, bedBaseToClamped) - 0) / HOTELS_BED_BASE_SLIDER_MAX) * 100}%`
                        } as React.CSSProperties}
                    />
                </div>
                <div className={styles.yearInputsRow}>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="bed-base-from" className={styles.yearInputLabel}>
                            От
                        </label>
                        <input
                            type="number"
                            id="bed-base-from"
                            min={0}
                            value={bedBaseFromInput}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setBedBaseFromInput(inputValue);
                                
                                // Allow empty input for intermediate typing states
                                if (inputValue === '' || inputValue === '-') {
                                    return;
                                }
                                
                                const val = Number(inputValue);
                                if (!isNaN(val) && val >= 0 && val <= bedBaseTo) {
                                    handleBedBaseFromChange(val);
                                }
                            }}
                            onBlur={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === '' || inputValue === '-') {
                                    // Reset to current valid value on blur if empty
                                    setBedBaseFromInput(String(bedBaseFrom));
                                    return;
                                }
                                
                                const val = Number(inputValue);
                                if (isNaN(val) || val < 0) {
                                    setBedBaseFromInput(String(bedBaseFrom));
                                } else if (val > bedBaseTo) {
                                    // If value exceeds bedBaseTo, clamp it
                                    const clampedVal = bedBaseTo;
                                    setBedBaseFromInput(String(clampedVal));
                                    handleBedBaseFromChange(clampedVal);
                                } else {
                                    handleBedBaseFromChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="bed-base-to" className={styles.yearInputLabel}>
                            До
                        </label>
                        <input
                            type="number"
                            id="bed-base-to"
                            min={bedBaseFrom}
                            value={bedBaseToInput}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setBedBaseToInput(inputValue);
                                
                                // Allow empty input for intermediate typing states
                                if (inputValue === '' || inputValue === '-') {
                                    return;
                                }
                                
                                const val = Number(inputValue);
                                if (!isNaN(val) && val >= bedBaseFrom) {
                                    handleBedBaseToChange(val);
                                }
                            }}
                            onBlur={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === '' || inputValue === '-') {
                                    // Reset to current valid value on blur if empty
                                    setBedBaseToInput(String(bedBaseTo));
                                    return;
                                }
                                
                                const val = Number(inputValue);
                                if (isNaN(val) || val < bedBaseFrom) {
                                    // If value is less than bedBaseFrom, clamp it
                                    const clampedVal = bedBaseFrom;
                                    setBedBaseToInput(String(clampedVal));
                                    handleBedBaseToChange(clampedVal);
                                } else {
                                    handleBedBaseToChange(val);
                                }
                            }}
                            className={styles.yearInput}
                        />
                    </div>
                </div>
                {presets && presets.length > 0 && (
                    <div className={areaStyles.areaPresets}>
                        {presets.map((preset: BedBasePreset) => {
                            const isSelected = selectedPresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className={`${areaStyles.areaPresetButton} ${isSelected ? areaStyles.areaPresetButtonActive : ''}`}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            className={`${areaStyles.areaPresetButton} ${isNotProvided ? areaStyles.areaPresetButtonActive : ''}`}
                            onClick={handleNotProvidedClick}
                        >
                            Не е въведено
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

