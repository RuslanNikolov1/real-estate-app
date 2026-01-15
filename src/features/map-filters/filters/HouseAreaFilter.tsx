'use client';

import { useTranslation } from 'react-i18next';

import { useState, useCallback, useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HOUSE_AREA_SLIDER_MAX, HOUSE_AREA_CAP } from './types';
import styles from './AreaFilter.module.scss';

interface HouseAreaFilterProps {
    onFilterChange: (areaFrom: number, areaTo: number) => void;
    initialAreaFrom?: number;
    initialAreaTo?: number;
}

export function HouseAreaFilter({ 
    onFilterChange, 
    initialAreaFrom = 50, 
    initialAreaTo = 200 
}: HouseAreaFilterProps) {
    const { t } = useTranslation();
    const [areaFrom, setAreaFrom] = useState(initialAreaFrom);
    const [areaTo, setAreaTo] = useState(initialAreaTo);

    const cappedAreaFrom = Math.min(areaFrom, HOUSE_AREA_CAP);
    const cappedAreaTo = Math.min(areaTo, HOUSE_AREA_CAP);
    const squareSideFrom = Math.sqrt(cappedAreaFrom) * 600 / Math.sqrt(HOUSE_AREA_CAP);
    const squareSideTo = Math.sqrt(cappedAreaTo) * 600 / Math.sqrt(HOUSE_AREA_CAP);
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
        if (val <= areaTo) {
            setAreaFrom(val);
            onFilterChange(val, areaTo);
        }
    }, [areaTo, onFilterChange]);

    const handleAreaToChange = useCallback((val: number) => {
        if (val >= areaFrom) {
            setAreaTo(val);
            onFilterChange(areaFrom, val);
        }
    }, [areaFrom, onFilterChange]);

    return (
        <div
            className={styles.container}
            style={areaLeftFiltersStyle}
        >
            <div className={styles.areaFilter}>
                <h4 className={styles.areaTitle}>РЗП кв.м</h4>
                <div className={styles.areaControls}>
                    <div className={styles.dualRangeSlider}>
                        <input
                            type="range"
                            id="house-area-slider-from"
                            min="0"
                            max={HOUSE_AREA_SLIDER_MAX}
                            step="1"
                            value={Math.min(areaFrom, HOUSE_AREA_SLIDER_MAX)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleAreaFromChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderFrom}`}
                            style={{
                                '--slider-value': `${(Math.min(areaFrom, HOUSE_AREA_SLIDER_MAX) / HOUSE_AREA_SLIDER_MAX) * 100}%`,
                                '--slider-to-value': `${(Math.min(areaTo, HOUSE_AREA_SLIDER_MAX) / HOUSE_AREA_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                        <input
                            type="range"
                            id="house-area-slider-to"
                            min="0"
                            max={HOUSE_AREA_SLIDER_MAX}
                            step="1"
                            value={Math.min(areaTo, HOUSE_AREA_SLIDER_MAX)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleAreaToChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderTo}`}
                            style={{
                                '--slider-value': `${(Math.min(areaTo, HOUSE_AREA_SLIDER_MAX) / HOUSE_AREA_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className={styles.areaInputs}>
                        <div className={styles.areaInputWrapper}>
                            <label htmlFor="house-area-from" className={styles.areaInputLabel}>
                                {t('filters.common.from')}
                            </label>
                            <input
                                type="number"
                                id="house-area-from"
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
                            <label htmlFor="house-area-to" className={styles.areaInputLabel}>
                                {t('filters.common.to')}
                            </label>
                            <input
                                type="number"
                                id="house-area-to"
                                min={areaFrom}
                                value={areaTo}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= areaFrom) {
                                        handleAreaToChange(val);
                                    }
                                }}
                                className={styles.areaInput}
                                placeholder={HOUSE_AREA_SLIDER_MAX.toString()}
                            />
                        </div>
                    </div>
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



