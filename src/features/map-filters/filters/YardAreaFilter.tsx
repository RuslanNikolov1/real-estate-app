'use client';

import { useState, useCallback, useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { YARD_AREA_SLIDER_MAX, YARD_AREA_CAP } from './types';
import styles from './AreaFilter.module.scss';

interface YardAreaFilterProps {
    onFilterChange: (yardAreaFrom: number, yardAreaTo: number) => void;
    initialYardAreaFrom?: number;
    initialYardAreaTo?: number;
}

export function YardAreaFilter({ 
    onFilterChange, 
    initialYardAreaFrom = 100, 
    initialYardAreaTo = 500 
}: YardAreaFilterProps) {
    const [yardAreaFrom, setYardAreaFrom] = useState(initialYardAreaFrom);
    const [yardAreaTo, setYardAreaTo] = useState(initialYardAreaTo);

    const cappedAreaFrom = Math.min(yardAreaFrom, YARD_AREA_CAP);
    const cappedAreaTo = Math.min(yardAreaTo, YARD_AREA_CAP);
    const squareSideFrom = Math.sqrt(cappedAreaFrom) * 600 / Math.sqrt(YARD_AREA_CAP);
    const squareSideTo = Math.sqrt(cappedAreaTo) * 600 / Math.sqrt(YARD_AREA_CAP);
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

    const handleYardAreaFromChange = useCallback((val: number) => {
        if (val <= yardAreaTo) {
            setYardAreaFrom(val);
            onFilterChange(val, yardAreaTo);
        }
    }, [yardAreaTo, onFilterChange]);

    const handleYardAreaToChange = useCallback((val: number) => {
        if (val >= yardAreaFrom) {
            setYardAreaTo(val);
            onFilterChange(yardAreaFrom, val);
        }
    }, [yardAreaFrom, onFilterChange]);

    return (
        <div
            className={styles.container}
            style={areaLeftFiltersStyle}
        >
            <div className={styles.areaFilter}>
                <h4 className={styles.areaTitle}>Двор кв.м</h4>
                <div className={styles.areaControls}>
                    <div className={styles.dualRangeSlider}>
                        <input
                            type="range"
                            id="yard-area-slider-from"
                            min="0"
                            max={YARD_AREA_SLIDER_MAX}
                            step="1"
                            value={Math.min(yardAreaFrom, YARD_AREA_SLIDER_MAX)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleYardAreaFromChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderFrom}`}
                            style={{
                                '--slider-value': `${(Math.min(yardAreaFrom, YARD_AREA_SLIDER_MAX) / YARD_AREA_SLIDER_MAX) * 100}%`,
                                '--slider-to-value': `${(Math.min(yardAreaTo, YARD_AREA_SLIDER_MAX) / YARD_AREA_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                        <input
                            type="range"
                            id="yard-area-slider-to"
                            min="0"
                            max={YARD_AREA_SLIDER_MAX}
                            step="1"
                            value={Math.min(yardAreaTo, YARD_AREA_SLIDER_MAX)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleYardAreaToChange(val);
                            }}
                            className={`${styles.areaSlider} ${styles.areaSliderTo}`}
                            style={{
                                '--slider-value': `${(Math.min(yardAreaTo, YARD_AREA_SLIDER_MAX) / YARD_AREA_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className={styles.areaInputs}>
                        <div className={styles.areaInputWrapper}>
                            <label htmlFor="yard-area-from" className={styles.areaInputLabel}>
                                От
                            </label>
                            <input
                                type="number"
                                id="yard-area-from"
                                min="0"
                                value={yardAreaFrom}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= yardAreaTo) {
                                        handleYardAreaFromChange(val);
                                    }
                                }}
                                className={styles.areaInput}
                                placeholder="0"
                            />
                        </div>
                        <div className={styles.areaInputWrapper}>
                            <label htmlFor="yard-area-to" className={styles.areaInputLabel}>
                                До
                            </label>
                            <input
                                type="number"
                                id="yard-area-to"
                                min={yardAreaFrom}
                                value={yardAreaTo}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= yardAreaFrom) {
                                        handleYardAreaToChange(val);
                                    }
                                }}
                                className={styles.areaInput}
                                placeholder={YARD_AREA_SLIDER_MAX.toString()}
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
                        src="/bed-top-view.svg"
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



