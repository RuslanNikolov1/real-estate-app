'use client';

import { useTranslation } from 'react-i18next';

import { useState, useCallback, useMemo } from 'react';
import { PiggyBank } from '@phosphor-icons/react';
import { HOUSE_PRICE_SLIDER_MAX } from './types';
import styles from './PriceFilter.module.scss';

interface HousePriceFilterProps {
    onFilterChange: (priceFrom: number, priceTo: number) => void;
    initialPriceFrom?: number;
    initialPriceTo?: number;
}

export function HousePriceFilter({
    onFilterChange,
    initialPriceFrom = 0,
    initialPriceTo = HOUSE_PRICE_SLIDER_MAX
}: HousePriceFilterProps) {
    const { t } = useTranslation();
    const [priceFrom, setPriceFrom] = useState(initialPriceFrom);
    const [priceTo, setPriceTo] = useState(initialPriceTo);

    const priceFromClamped = Math.max(0, Math.min(priceFrom, HOUSE_PRICE_SLIDER_MAX));
    const priceToClamped = Math.max(0, Math.min(priceTo, HOUSE_PRICE_SLIDER_MAX));

    const piggyBankMinSize = 32;
    const piggyBankMaxSize = 64;
    const piggyBankSize = useMemo(
        () => piggyBankMinSize + (priceToClamped / HOUSE_PRICE_SLIDER_MAX) * (piggyBankMaxSize - piggyBankMinSize),
        [priceToClamped]
    );

    const handlePriceFromChange = useCallback((val: number) => {
        // Allow values greater than slider max, but clamp visual slider
        if (val > priceTo) {
            setPriceTo(val);
            onFilterChange(val, val);
        } else {
            setPriceFrom(val);
            onFilterChange(val, priceTo);
        }
    }, [priceTo, onFilterChange]);

    const handlePriceToChange = useCallback((val: number) => {
        // Allow values greater than slider max, but clamp visual slider
        if (val < priceFrom) {
            setPriceFrom(val);
            setPriceTo(val);
            onFilterChange(val, val);
        } else {
            setPriceTo(val);
            onFilterChange(priceFrom, val);
        }
    }, [priceFrom, onFilterChange]);

    return (
        <div className={styles.container}>
            <div className={styles.priceFilter}>
                <h4 className={styles.priceTitle}>Цена (€)</h4>
                <div className={styles.priceControls}>
                    <div className={styles.dualRangeSlider}>
                        <input
                            type="range"
                            id="house-price-slider-from"
                            min="0"
                            max={HOUSE_PRICE_SLIDER_MAX}
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
                                '--slider-value': `${(priceFromClamped / HOUSE_PRICE_SLIDER_MAX) * 100}%`,
                                '--slider-to-value': `${(priceToClamped / HOUSE_PRICE_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                        <input
                            type="range"
                            id="house-price-slider-to"
                            min="0"
                            max={HOUSE_PRICE_SLIDER_MAX}
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
                                '--slider-value': `${(priceToClamped / HOUSE_PRICE_SLIDER_MAX) * 100}%`
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className={styles.priceInputs}>
                        <div className={styles.priceInputWrapper}>
                            <label htmlFor="house-price-from" className={styles.priceInputLabel}>
                                {t('filters.common.from')}
                            </label>
                            <input
                                type="number"
                                id="house-price-from"
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
                            <label htmlFor="house-price-to" className={styles.priceInputLabel}>
                                {t('filters.common.to')}
                            </label>
                            <input
                                type="number"
                                id="house-price-to"
                                min={0}
                                value={priceTo}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        handlePriceToChange(val);
                                    }
                                }}
                                className={styles.priceInput}
                                placeholder={HOUSE_PRICE_SLIDER_MAX.toString()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

