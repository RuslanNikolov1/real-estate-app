'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank, MoneyWavy } from '@phosphor-icons/react';
import { PRICE_SLIDER_MAX, PRICE_PER_SQM_SLIDER_MAX } from './types';
import styles from './PriceFilter.module.scss';

interface PriceFilterProps {
    onFilterChange: (
        priceFrom: number,
        priceTo: number,
        pricePerSqmFrom: number,
        pricePerSqmTo: number
    ) => void;
    initialPriceFrom?: number;
    initialPriceTo?: number;
    initialPricePerSqmFrom?: number;
    initialPricePerSqmTo?: number;
    priceSliderMax?: number;
    pricePerSqmSliderMin?: number;
    pricePerSqmSliderMax?: number;
    showPricePerSqm?: boolean;
    priceTitle?: string;
}

export function PriceFilter({
    onFilterChange,
    initialPriceFrom,
    initialPriceTo,
    initialPricePerSqmFrom,
    initialPricePerSqmTo,
    priceSliderMax = PRICE_SLIDER_MAX,
    pricePerSqmSliderMin = 0,
    pricePerSqmSliderMax = PRICE_PER_SQM_SLIDER_MAX,
    showPricePerSqm = true,
    priceTitle
}: PriceFilterProps) {
    const { t } = useTranslation();
    // Use default values for UI display only
    const defaultPriceFrom = 0;
    const defaultPriceTo = PRICE_SLIDER_MAX;
    const defaultPricePerSqmFrom = 0;
    const defaultPricePerSqmTo = PRICE_PER_SQM_SLIDER_MAX;
    
    const [priceFrom, setPriceFrom] = useState(initialPriceFrom ?? defaultPriceFrom);
    const [priceTo, setPriceTo] = useState(initialPriceTo ?? defaultPriceTo);
    const [pricePerSqmFrom, setPricePerSqmFrom] = useState(initialPricePerSqmFrom ?? defaultPricePerSqmFrom);
    const [pricePerSqmTo, setPricePerSqmTo] = useState(initialPricePerSqmTo ?? defaultPricePerSqmTo);

    const priceFromClamped = Math.max(0, Math.min(priceFrom, priceSliderMax));
    const priceToClamped = Math.max(0, Math.min(priceTo, priceSliderMax));
    const pricePerSqmFromClamped = Math.max(pricePerSqmSliderMin, Math.min(pricePerSqmFrom, pricePerSqmSliderMax));
    const pricePerSqmToClamped = Math.max(pricePerSqmSliderMin, Math.min(pricePerSqmTo, pricePerSqmSliderMax));

    const piggyBankMinSize = 32;
    const piggyBankMaxSize = 64;
    const piggyBankSize = useMemo(
        () => piggyBankMinSize + (priceToClamped / priceSliderMax) * (piggyBankMaxSize - piggyBankMinSize),
        [priceToClamped, priceSliderMax]
    );
    const piggyBankSqmSize = useMemo(
        () => {
            const range = pricePerSqmSliderMax - pricePerSqmSliderMin;
            const normalizedValue = range > 0 ? (pricePerSqmToClamped - pricePerSqmSliderMin) / range : 0;
            return piggyBankMinSize + normalizedValue * (piggyBankMaxSize - piggyBankMinSize);
        },
        [pricePerSqmToClamped, pricePerSqmSliderMin, pricePerSqmSliderMax]
    );

    const handlePriceFromChange = useCallback((val: number) => {
        // Allow values above slider max in internal state, but clamp for slider display
        if (val > priceTo) {
            setPriceTo(val);
            onFilterChange(val, val, pricePerSqmFrom, pricePerSqmTo);
        } else {
            setPriceFrom(val);
            onFilterChange(val, priceTo, pricePerSqmFrom, pricePerSqmTo);
        }
    }, [priceTo, pricePerSqmFrom, pricePerSqmTo, onFilterChange]);

    const handlePriceToChange = useCallback((val: number) => {
        // Allow values above slider max in internal state, but clamp for slider display
        if (val < priceFrom) {
            setPriceFrom(val);
            setPriceTo(val);
            onFilterChange(val, val, pricePerSqmFrom, pricePerSqmTo);
        } else {
            setPriceTo(val);
            onFilterChange(priceFrom, val, pricePerSqmFrom, pricePerSqmTo);
        }
    }, [priceFrom, pricePerSqmFrom, pricePerSqmTo, onFilterChange]);

    const handlePricePerSqmFromChange = useCallback((val: number) => {
        // Allow values above slider max in internal state, but clamp for slider display
        if (val > pricePerSqmTo) {
            setPricePerSqmTo(val);
            onFilterChange(priceFrom, priceTo, val, val);
        } else {
            setPricePerSqmFrom(val);
            onFilterChange(priceFrom, priceTo, val, pricePerSqmTo);
        }
    }, [pricePerSqmTo, priceFrom, priceTo, onFilterChange]);

    const handlePricePerSqmToChange = useCallback((val: number) => {
        // Allow values above slider max in internal state, but clamp for slider display
        if (val < pricePerSqmFrom) {
            setPricePerSqmFrom(val);
            setPricePerSqmTo(val);
            onFilterChange(priceFrom, priceTo, val, val);
        } else {
            setPricePerSqmTo(val);
            onFilterChange(priceFrom, priceTo, pricePerSqmFrom, val);
        }
    }, [pricePerSqmFrom, priceFrom, priceTo, onFilterChange]);

    return (
        <div className={styles.container}>
            <div className={styles.priceFilter}>
                <h4 className={styles.priceTitle}>{priceTitle || t('filters.titles.price')}</h4>
                <div className={styles.priceControls}>
                    <div className={styles.dualRangeSlider}>
                        <input
                            type="range"
                            id="price-slider-from"
                            min="0"
                            max={priceSliderMax}
                            step="1000"
                            value={priceFromClamped}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handlePriceFromChange(val);
                                }
                            }}
                            className={`${styles.priceSlider} ${styles.priceSliderFrom}`}
                            style={{
                                '--slider-value': `${(priceFromClamped / priceSliderMax) * 100}%`,
                                '--slider-to-value': `${(priceToClamped / priceSliderMax) * 100}%`
                            } as React.CSSProperties}
                        />
                        <input
                            type="range"
                            id="price-slider-to"
                            min="0"
                            max={priceSliderMax}
                            step="1000"
                            value={priceToClamped}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                    handlePriceToChange(val);
                                }
                            }}
                            className={`${styles.priceSlider} ${styles.priceSliderTo}`}
                            style={{
                                '--slider-value': `${(priceToClamped / priceSliderMax) * 100}%`
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className={styles.priceInputs}>
                        <div className={styles.priceInputWrapper}>
                            <label htmlFor="price-from" className={styles.priceInputLabel}>
                                {t('filters.common.from')}
                            </label>
                            <input
                                type="number"
                                id="price-from"
                                min={0}
                                value={priceFrom}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        handlePriceFromChange(val);
                                    }
                                }}
                                className={styles.priceInput}
                                placeholder="0"
                            />
                        </div>
                        <div className={styles.pricePiggyBankWrapper} aria-hidden="true">
                            <PiggyBank
                                className={styles.pricePiggyBankIcon}
                                size={piggyBankSize}
                            />
                        </div>
                        <div className={styles.priceInputWrapper}>
                            <label htmlFor="price-to" className={styles.priceInputLabel}>
                                {t('filters.common.to')}
                            </label>
                            <input
                                type="number"
                                id="price-to"
                                min={0}
                                value={priceTo}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        handlePriceToChange(val);
                                    }
                                }}
                                className={styles.priceInput}
                                placeholder={priceSliderMax.toString()}
                            />
                        </div>
                    </div>
                    {showPricePerSqm && (
                        <div className={styles.pricePerSqmContainer}>
                            <h4 className={styles.pricePerSqmTitle}>{t('filters.titles.pricePerSqm')}</h4>
                        <div className={styles.dualRangeSlider}>
                            <input
                                type="range"
                                id="price-per-sqm-slider-from"
                                min={pricePerSqmSliderMin}
                                max={pricePerSqmSliderMax}
                                step="10"
                                value={pricePerSqmFromClamped}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) {
                                        handlePricePerSqmFromChange(val);
                                    }
                                }}
                                className={`${styles.pricePerSqmSlider} ${styles.pricePerSqmSliderFrom}`}
                                style={{
                                    '--slider-value': `${((pricePerSqmFromClamped - pricePerSqmSliderMin) / (pricePerSqmSliderMax - pricePerSqmSliderMin)) * 100}%`,
                                    '--slider-to-value': `${((pricePerSqmToClamped - pricePerSqmSliderMin) / (pricePerSqmSliderMax - pricePerSqmSliderMin)) * 100}%`
                                } as React.CSSProperties}
                            />
                            <input
                                type="range"
                                id="price-per-sqm-slider-to"
                                min={pricePerSqmSliderMin}
                                max={pricePerSqmSliderMax}
                                step="10"
                                value={pricePerSqmToClamped}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) {
                                        handlePricePerSqmToChange(val);
                                    }
                                }}
                                className={`${styles.pricePerSqmSlider} ${styles.pricePerSqmSliderTo}`}
                                style={{
                                    '--slider-value': `${((pricePerSqmToClamped - pricePerSqmSliderMin) / (pricePerSqmSliderMax - pricePerSqmSliderMin)) * 100}%`
                                } as React.CSSProperties}
                            />
                        </div>
                        <div className={styles.priceInputs}>
                            <div className={styles.priceInputWrapper}>
                                <label htmlFor="price-per-sqm-from" className={styles.priceInputLabel}>
                                    {t('filters.common.from')}
                                </label>
                                <input
                                    type="number"
                                    id="price-per-sqm-from"
                                    min={pricePerSqmSliderMin}
                                    value={pricePerSqmFrom}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val >= pricePerSqmSliderMin) {
                                            handlePricePerSqmFromChange(val);
                                        }
                                    }}
                                    className={styles.priceInput}
                                    placeholder={pricePerSqmSliderMin.toString()}
                                />
                            </div>
                            <div className={styles.pricePiggyBankWrapper} aria-hidden="true">
                                <MoneyWavy
                                    className={styles.pricePiggyBankIcon}
                                    size={piggyBankSqmSize}
                                />
                            </div>
                            <div className={styles.priceInputWrapper}>
                                <label htmlFor="price-per-sqm-to" className={styles.priceInputLabel}>
                                    {t('filters.common.to')}
                                </label>
                                <input
                                    type="number"
                                    id="price-per-sqm-to"
                                    min={0}
                                    value={pricePerSqmTo}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val >= 0) {
                                            handlePricePerSqmToChange(val);
                                        }
                                    }}
                                    className={styles.priceInput}
                                    placeholder={pricePerSqmSliderMax.toString()}
                                />
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}

