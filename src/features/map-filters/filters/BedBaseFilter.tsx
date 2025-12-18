'use client';

import { useState, useCallback } from 'react';
import styles from './YearFilter.module.scss';

interface BedBaseFilterProps {
    onFilterChange: (bedBaseFrom: number, bedBaseTo: number, isNotProvided: boolean) => void;
    initialBedBaseFrom?: number;
    initialBedBaseTo?: number;
    initialIsNotProvided?: boolean;
}

export function BedBaseFilter({
    onFilterChange,
    initialBedBaseFrom = undefined,
    initialBedBaseTo = undefined,
    initialIsNotProvided = false
}: BedBaseFilterProps) {
    const [bedBaseFrom, setBedBaseFrom] = useState<number | undefined>(initialBedBaseFrom);
    const [bedBaseTo, setBedBaseTo] = useState<number | undefined>(initialBedBaseTo);

    const handleBedBaseFromChange = useCallback((val: number | undefined) => {
        const numVal = val === undefined || val === null || isNaN(val) || val <= 0 ? undefined : val;
        setBedBaseFrom(numVal);
        const from = numVal ?? 0;
        const to = bedBaseTo && bedBaseTo > 0 ? bedBaseTo : 0;
        onFilterChange(from, to, false);
    }, [bedBaseTo, onFilterChange]);

    const handleBedBaseToChange = useCallback((val: number | undefined) => {
        const numVal = val === undefined || val === null || isNaN(val) || val <= 0 ? undefined : val;
        setBedBaseTo(numVal);
        const from = bedBaseFrom && bedBaseFrom > 0 ? bedBaseFrom : 0;
        const to = numVal ?? 0;
        onFilterChange(from, to, false);
    }, [bedBaseFrom, onFilterChange]);

    return (
        <div className={styles.yearFilter}>
            <h4 className={styles.featuresTitle}>Леглова база</h4>
            <div className={styles.yearControls}>
                <div className={styles.yearInputsRow}>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="bed-base-from" className={styles.yearInputLabel}>
                            От
                        </label>
                        <input
                            type="number"
                            id="bed-base-from"
                            min={0}
                            value={bedBaseFrom ?? ''}
                            onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                handleBedBaseFromChange(val);
                            }}
                            className={styles.yearInput}
                            placeholder="0"
                        />
                    </div>
                    <div className={styles.yearInputWrapper}>
                        <label htmlFor="bed-base-to" className={styles.yearInputLabel}>
                            До
                        </label>
                        <input
                            type="number"
                            id="bed-base-to"
                            min={bedBaseFrom ?? 0}
                            value={bedBaseTo ?? ''}
                            onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                handleBedBaseToChange(val);
                            }}
                            className={styles.yearInput}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

