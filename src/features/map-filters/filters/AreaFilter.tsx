'use client';

import { useState, useCallback, useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { AREA_SLIDER_MAX, SQUARE_AREA_CAP, YARD_AREA_SLIDER_MAX, YARD_AREA_CAP } from './types';
import type { AreaPreset } from './constants';
import styles from './AreaFilter.module.scss';

interface AreaFilterProps {
    onFilterChange: (areaFrom: number, areaTo: number, isNotProvided?: boolean) => void;
    initialAreaFrom?: number;
    initialAreaTo?: number;
    title?: string;
    sliderMax?: number;
    areaCap?: number;
    inputIdPrefix?: string;
    presets?: AreaPreset[];
    onPresetChange?: (presetId: string | null) => void;
    initialPresetId?: string | null;
    showNotProvided?: boolean;
}

export function AreaFilter({ 
    onFilterChange, 
    initialAreaFrom, 
    initialAreaTo,
    title,
    sliderMax = AREA_SLIDER_MAX,
    areaCap = SQUARE_AREA_CAP,
    inputIdPrefix = 'area',
    presets,
    onPresetChange,
    initialPresetId = null,
    showNotProvided = false
}: AreaFilterProps) {
    const { t } = useTranslation();
    // Use default values for UI display only
    const defaultAreaFrom = 20;
    const defaultAreaTo = 100;
    const [areaFrom, setAreaFrom] = useState(initialAreaFrom ?? defaultAreaFrom);
    const [areaTo, setAreaTo] = useState(initialAreaTo ?? defaultAreaTo);
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(initialPresetId || null);
    const [isNotProvided, setIsNotProvided] = useState(false);

    const cappedAreaFrom = Math.min(areaFrom, areaCap);
    const cappedAreaTo = Math.min(areaTo, areaCap);
    const squareSideFrom = Math.sqrt(cappedAreaFrom) * 600 / Math.sqrt(areaCap);
    const squareSideTo = Math.sqrt(cappedAreaTo) * 600 / Math.sqrt(areaCap);
    const largestSquareSide = Math.max(squareSideFrom, squareSideTo);
    const isFromSmaller = squareSideFrom < squareSideTo;
    const isToSmaller = squareSideTo < squareSideFrom;
    const bedImageHeight = 80;
    const totalSquareHeight = largestSquareSide ? largestSquareSide + bedImageHeight : 0;
    const areaLeftFiltersStyle: CSSProperties = totalSquareHeight
        ? { minHeight: totalSquareHeight }
        : {};
    const bedWrapperStyle: CSSProperties = largestSquareSide
        ? { minHeight: largestSquareSide + bedImageHeight }
        : {};

    const handleAreaFromChange = useCallback((val: number) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:61',message:'handleAreaFromChange called',data:{val,areaTo,willUpdate:val <= areaTo,currentAreaFrom:areaFrom},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (val <= areaTo) {
            setAreaFrom(val);
            setSelectedPresetId(null);
            setIsNotProvided(false);
            onFilterChange(val, areaTo, false);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:67',message:'AreaFrom updated',data:{newVal:val,areaTo},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:70',message:'AreaFrom update blocked by validation',data:{val,areaTo,reason:'val > areaTo'},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
        }
    }, [areaTo, onFilterChange, areaFrom]);

    const handleAreaToChange = useCallback((val: number) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:70',message:'handleAreaToChange called',data:{val,areaFrom,willUpdate:val >= areaFrom,currentAreaTo:areaTo},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        if (val >= areaFrom) {
            setAreaTo(val);
            setSelectedPresetId(null);
            setIsNotProvided(false);
            onFilterChange(areaFrom, val, false);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:77',message:'AreaTo updated',data:{newVal:val,areaFrom},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:80',message:'AreaTo update blocked by validation',data:{val,areaFrom,reason:'val < areaFrom'},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
        }
    }, [areaFrom, onFilterChange, areaTo]);

    const handlePresetClick = useCallback((preset: AreaPreset) => {
        setAreaFrom(preset.from);
        setAreaTo(preset.to);
        setSelectedPresetId(preset.id);
        setIsNotProvided(false);
        onFilterChange(preset.from, preset.to, false);
        if (onPresetChange) {
            onPresetChange(preset.id);
        }
    }, [onFilterChange, onPresetChange]);

    const handleNotProvidedClick = useCallback(() => {
        setSelectedPresetId(null);
        setIsNotProvided(true);
        onFilterChange(0, 0, true);
        if (onPresetChange) {
            onPresetChange('not-provided');
        }
    }, [onFilterChange, onPresetChange]);

    return (
        <div
            className={styles.container}
            style={areaLeftFiltersStyle}
        >
            <div className={styles.areaFilter}>
                <h4 className={styles.areaTitle}>{title || t('filters.titles.area')}</h4>
                <div className={styles.areaControls}>
                    <div className={styles.dualRangeSlider}>
                        <input
                            type="range"
                            id={`${inputIdPrefix}-slider-from`}
                            min="0"
                            max={sliderMax}
                            step="1"
                            value={Math.min(areaFrom, sliderMax)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                // #region agent log
                                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:115',message:'Slider from onChange triggered',data:{rawValue:e.target.value,parsedVal:val,currentAreaFrom:areaFrom,currentAreaTo:areaTo},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H2'})}).catch(()=>{});
                                // #endregion
                                handleAreaFromChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderFrom}`}
                            style={{
                                '--slider-value': `${(Math.min(areaFrom, sliderMax) / sliderMax) * 100}%`,
                                '--slider-to-value': `${(Math.min(areaTo, sliderMax) / sliderMax) * 100}%`
                            } as React.CSSProperties}
                        />
                        <input
                            type="range"
                            id={`${inputIdPrefix}-slider-to`}
                            min="0"
                            max={sliderMax}
                            step="1"
                            value={Math.min(areaTo, sliderMax)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                // #region agent log
                                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AreaFilter.tsx:132',message:'Slider to onChange triggered',data:{rawValue:e.target.value,parsedVal:val,currentAreaFrom:areaFrom,currentAreaTo:areaTo},timestamp:Date.now(),sessionId:'debug-session',runId:'slider-debug',hypothesisId:'H2'})}).catch(()=>{});
                                // #endregion
                                handleAreaToChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderTo}`}
                            style={{
                                '--slider-value': `${(Math.min(areaTo, sliderMax) / sliderMax) * 100}%`
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className={styles.areaInputs}>
                        <div className={styles.areaInputWrapper}>
                            <label htmlFor={`${inputIdPrefix}-from`} className={styles.areaInputLabel}>
                                {t('filters.common.from')}
                            </label>
                            <input
                                type="number"
                                id={`${inputIdPrefix}-from`}
                                min="0"
                                value={areaFrom}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= areaTo) {
                                        handleAreaFromChange(val);
                                    }
                                }}
                                className={styles.areaInput}
                                placeholder="0"
                            />
                        </div>
                        <div className={styles.areaInputWrapper}>
                            <label htmlFor={`${inputIdPrefix}-to`} className={styles.areaInputLabel}>
                                {t('filters.common.to')}
                            </label>
                            <input
                                type="number"
                                id={`${inputIdPrefix}-to`}
                                min={areaFrom}
                                value={areaTo}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= areaFrom) {
                                        handleAreaToChange(val);
                                    }
                                }}
                                className={styles.areaInput}
                                placeholder={sliderMax.toString()}
                            />
                        </div>
                    </div>
                    {(presets && presets.length > 0 || showNotProvided) && (
                        <div className={styles.areaPresets}>
                            {presets && presets.map((preset) => {
                                const isSelected = selectedPresetId === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={`${styles.areaPresetButton} ${isSelected ? styles.areaPresetButtonActive : ''}`}
                                        onClick={() => handlePresetClick(preset)}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                            {(showNotProvided || (presets && presets.length > 0)) && (
                                <button
                                    type="button"
                                    className={`${styles.areaPresetButton} ${isNotProvided ? styles.areaPresetButtonActive : ''}`}
                                    onClick={handleNotProvidedClick}
                                >
                                    {t('filters.common.notSpecified')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div
                    className={styles.bedTopViewWrapper}
                    style={bedWrapperStyle}
                >
                    <motion.div
                        className={`${styles.bedTopViewSquare} ${isFromSmaller
                            ? styles.bedTopViewSquareYellow
                            : styles.bedTopViewSquareRed
                            }`}
                        initial={{ width: 0, height: 0 }}
                        animate={{
                            width: squareSideFrom,
                            height: squareSideFrom
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                    <motion.div
                        className={`${styles.bedTopViewSquare} ${isToSmaller
                            ? styles.bedTopViewSquareYellow
                            : styles.bedTopViewSquareRed
                            }`}
                        initial={{ width: 0, height: 0 }}
                        animate={{
                            width: squareSideTo,
                            height: squareSideTo
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                    <Image
                        src="/real-red-bed.png"
                        alt="Bed top view illustration"
                        width={200}
                        height={60}
                        className={styles.bedTopViewImage}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

