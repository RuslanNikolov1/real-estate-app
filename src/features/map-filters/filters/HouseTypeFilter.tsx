'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HOUSE_TYPES } from './constants';
import type { HouseType } from './types';
import styles from './ApartmentSubtypeFilter.module.scss';

interface HouseTypeFilterProps {
    onFilterChange: (selectedTypes: string[]) => void;
    initialSelected?: string[];
}

export function HouseTypeFilter({ onFilterChange, initialSelected = [] }: HouseTypeFilterProps) {
    const [selectedHouseTypes, setSelectedHouseTypes] = useState<string[]>(initialSelected);

    const handleHouseTypeToggle = useCallback((typeId: string) => {
        if (typeId === 'all') {
            if (selectedHouseTypes.includes('all')) {
                setSelectedHouseTypes([]);
                onFilterChange([]);
            } else {
                const allIds = HOUSE_TYPES.map(t => t.id);
                setSelectedHouseTypes(allIds);
                onFilterChange(allIds);
            }
        } else {
            setSelectedHouseTypes((prev) => {
                const newSelection = prev.includes(typeId)
                    ? prev.filter(id => id !== typeId)
                    : [...prev.filter(id => id !== 'all'), typeId];

                const allTypesExceptAll = HOUSE_TYPES.filter(t => t.id !== 'all').map(t => t.id);
                const hasAllTypes = allTypesExceptAll.every(id => newSelection.includes(id));

                const finalSelection = hasAllTypes ? HOUSE_TYPES.map(t => t.id) : newSelection;
                onFilterChange(finalSelection);
                return finalSelection;
            });
        }
    }, [selectedHouseTypes, onFilterChange]);

    const layoutData = useMemo(() => {
        const [allType, ...otherTypes] = HOUSE_TYPES;
        const typeMap = new Map(otherTypes.map(type => [type.id, type]));
        const leftOrder = ['one-floor', 'three-floor', 'four-plus-floor'];
        const rightOrder = ['two-floor', 'house-floor', 'not-specified'];

        const leftColumnTypes = leftOrder
            .map(id => typeMap.get(id))
            .filter((type): type is HouseType => Boolean(type));

        const rightColumnTypes = rightOrder
            .map(id => typeMap.get(id))
            .filter((type): type is HouseType => Boolean(type));

        const usedTypeIds = new Set(['all', ...leftColumnTypes.map(t => t.id), ...rightColumnTypes.map(t => t.id)]);
        const remainingTypes = otherTypes.filter(type => !usedTypeIds.has(type.id));

        remainingTypes.forEach((type, index) => {
            if (index % 2 === 0) {
                leftColumnTypes.push(type);
            } else {
                rightColumnTypes.push(type);
            }
        });

        const maxRows = Math.max(leftColumnTypes.length, rightColumnTypes.length);

        return { allType, leftColumnTypes, rightColumnTypes, maxRows };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.container}
        >
            <div className={styles.apartmentSubtypeFilter}>
                <h4 className={styles.apartmentSubtypeTitle}>Етажност</h4>
                <div className={styles.apartmentSubtypeOptions}>
                    {layoutData.allType && (
                        <label
                            key={layoutData.allType.id}
                            className={`${styles.apartmentSubtypeOption} ${styles.allOption}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedHouseTypes.includes(layoutData.allType.id)}
                                onChange={() => handleHouseTypeToggle(layoutData.allType.id)}
                                className={styles.apartmentSubtypeCheckbox}
                            />
                            <span className={styles.apartmentSubtypeLabel}>
                                {layoutData.allType.label}
                            </span>
                        </label>
                    )}

                    <div className={styles.apartmentSubtypeRows}>
                        {Array.from({ length: layoutData.maxRows }).map((_, rowIndex) => {
                            const leftType = layoutData.leftColumnTypes[rowIndex];
                            const rightType = layoutData.rightColumnTypes[rowIndex];
                            const isLeftChecked = leftType
                                ? selectedHouseTypes.includes(leftType.id)
                                : false;
                            const isRightChecked = rightType
                                ? selectedHouseTypes.includes(rightType.id)
                                : false;

                            return (
                                <div key={`house-type-row-${rowIndex}`} className={styles.apartmentSubtypeRow}>
                                    {leftType ? (
                                        <label
                                            className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionLeft}`}
                                            key={`${leftType.id}-left-${rowIndex}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isLeftChecked}
                                                onChange={() => handleHouseTypeToggle(leftType.id)}
                                                className={styles.apartmentSubtypeCheckbox}
                                            />
                                            <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelLeft}`}>
                                                {leftType.label}
                                                {leftType.icon && (
                                                    <span className={styles.apartmentSubtypeIconGroup}>
                                                        {leftType.icon}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ) : (
                                        <span className={styles.apartmentSubtypePlaceholder} />
                                    )}

                                    <span className={styles.apartmentSubtypeSeparator} aria-hidden="true" />

                                    {rightType ? (
                                        <label
                                            className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionRight}`}
                                            key={`${rightType.id}-right-${rowIndex}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isRightChecked}
                                                onChange={() => handleHouseTypeToggle(rightType.id)}
                                                className={styles.apartmentSubtypeCheckbox}
                                            />
                                            <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelRight}`}>
                                                {rightType.icon && (
                                                    <span className={`${styles.apartmentSubtypeIconGroup} ${styles.apartmentSubtypeIconGroupRight}`}>
                                                        {rightType.icon}
                                                    </span>
                                                )}
                                                {rightType.label}
                                            </span>
                                        </label>
                                    ) : (
                                        <span className={styles.apartmentSubtypePlaceholder} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}






