'use client';

import { useState, useCallback } from 'react';
import { HOTEL_BED_BASE_PRESETS } from './constants';
import { HOTELS_BED_BASE_SLIDER_MAX } from './types';
import type { BedBasePreset } from './constants';
import floorStyles from './FloorFilter.module.scss';
import constructionStyles from './ConstructionTypeFilter.module.scss';

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
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [isNotProvided, setIsNotProvided] = useState(initialIsNotProvided || false);

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
            <div className={floorStyles.floorControls}>
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
                        className={`${floorStyles.yearSlider} ${floorStyles.yearSliderFrom}`}
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
                        className={`${floorStyles.yearSlider} ${floorStyles.yearSliderTo}`}
                        style={{
                            '--slider-value': `${((Math.max(bedBaseFromClamped, bedBaseToClamped) - 0) / HOTELS_BED_BASE_SLIDER_MAX) * 100}%`
                        } as React.CSSProperties}
                    />
                </div>
                <div className={floorStyles.yearInputsRow}>
                    <div className={floorStyles.yearInputWrapper}>
                        <label htmlFor="bed-base-from" className={floorStyles.yearInputLabel}>
                            От
                        </label>
                        <input
                            type="number"
                            id="bed-base-from"
                            min={0}
                            value={bedBaseFrom}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val) && val >= 0 && val <= bedBaseTo) {
                                    handleBedBaseFromChange(val);
                                }
                            }}
                            className={floorStyles.yearInput}
                        />
                    </div>
                    <div className={floorStyles.yearInputWrapper}>
                        <label htmlFor="bed-base-to" className={floorStyles.yearInputLabel}>
                            До
                        </label>
                        <input
                            type="number"
                            id="bed-base-to"
                            min={bedBaseFrom}
                            value={bedBaseTo}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val) && val >= bedBaseFrom) {
                                    handleBedBaseToChange(val);
                                }
                            }}
                            className={floorStyles.yearInput}
                        />
                    </div>
                </div>
                {presets && presets.length > 0 && (
                    <div className={floorStyles.floorOptions}>
                        {presets.map((preset: BedBasePreset) => {
                            const isSelected = selectedPresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className={`${floorStyles.floorOptionButton} ${isSelected ? floorStyles.floorOptionButtonActive : ''}`}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            className={`${floorStyles.floorOptionButton} ${isNotProvided ? floorStyles.floorOptionButtonActive : ''}`}
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

