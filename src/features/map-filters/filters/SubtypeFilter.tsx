'use client';

import { useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './SubtypeFilter.module.scss';

export type SubtypeOption = {
    id: string;
    label: string;
    icon?: ReactNode;
};

interface SubtypeFilterProps {
    title: string;
    options: SubtypeOption[];
    onFilterChange: (selectedIds: string[]) => void;
    initialSelected?: string[];
    leftOrder?: string[];
    rightOrder?: string[];
}

export function SubtypeFilter({ 
    title, 
    options, 
    onFilterChange, 
    initialSelected = [],
    leftOrder = [],
    rightOrder = []
}: SubtypeFilterProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

    // Sync state when initialSelected changes (e.g., when filterKey changes and component remounts)
    useEffect(() => {
        setSelectedIds(initialSelected);
    }, [initialSelected]);

    // IMPORTANT: This component always sends English IDs (option.id), never labels
    // This ensures language-agnostic filtering regardless of the site's UI language
    // Labels can be translated for display, but IDs remain English for database consistency
    const handleSubtypeToggle = useCallback((subtypeId: string) => {
        if (subtypeId === 'all') {
            if (selectedIds.includes('all')) {
                setSelectedIds([]);
                onFilterChange([]);
            } else {
                // Always use option.id (English IDs like 'studio', 'one-bedroom')
                const allIds = options.map(o => o.id);
                setSelectedIds(allIds);
                onFilterChange(allIds);
            }
        } else {
            setSelectedIds((prev) => {
                const newSelection = prev.includes(subtypeId)
                    ? prev.filter(id => id !== subtypeId)
                    : [...prev.filter(id => id !== 'all'), subtypeId];

                const allOptionsExceptAll = options.filter(o => o.id !== 'all').map(o => o.id);
                const hasAllOptions = allOptionsExceptAll.every(id => newSelection.includes(id));

                // Always use option.id (English IDs)
                const finalSelection = hasAllOptions ? options.map(o => o.id) : newSelection;
                onFilterChange(finalSelection);
                return finalSelection;
            });
        }
    }, [selectedIds, options, onFilterChange]);

    const layoutData = useMemo(() => {
        const [allOption, ...otherOptions] = options;
        const optionMap = new Map(otherOptions.map(option => [option.id, option]));

        let leftColumnOptions: SubtypeOption[];
        let rightColumnOptions: SubtypeOption[];

        if (leftOrder.length > 0 || rightOrder.length > 0) {
            // Use custom ordering if provided
            leftColumnOptions = leftOrder
                .map(id => optionMap.get(id))
                .filter((option): option is SubtypeOption => Boolean(option));

            rightColumnOptions = rightOrder
                .map(id => optionMap.get(id))
                .filter((option): option is SubtypeOption => Boolean(option));

            const usedIds = new Set(['all', ...leftColumnOptions.map(o => o.id), ...rightColumnOptions.map(o => o.id)]);
            const remainingOptions = otherOptions.filter(option => !usedIds.has(option.id));

            // Distribute remaining options
            remainingOptions.forEach((option, index) => {
                if (index % 2 === 0) {
                    leftColumnOptions.push(option);
                } else {
                    rightColumnOptions.push(option);
                }
            });
        } else {
            // Default: distribute evenly
            leftColumnOptions = [];
            rightColumnOptions = [];
            
            otherOptions.forEach((option, index) => {
                if (index % 2 === 0) {
                    leftColumnOptions.push(option);
                } else {
                    rightColumnOptions.push(option);
                }
            });
        }

        const maxRows = Math.max(leftColumnOptions.length, rightColumnOptions.length);

        return { allOption, leftColumnOptions, rightColumnOptions, maxRows };
    }, [options, leftOrder, rightOrder]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.container}
        >
            <div className={styles.apartmentSubtypeFilter}>
                <h4 className={styles.apartmentSubtypeTitle}>{title}</h4>
                <div className={styles.apartmentSubtypeOptions}>
                    {layoutData.allOption && (
                        <label
                            key={layoutData.allOption.id}
                            className={`${styles.apartmentSubtypeOption} ${styles.allOption}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(layoutData.allOption.id)}
                                onChange={() => handleSubtypeToggle(layoutData.allOption.id)}
                                className={styles.apartmentSubtypeCheckbox}
                            />
                            <span className={styles.apartmentSubtypeLabel}>
                                {layoutData.allOption.label}
                            </span>
                        </label>
                    )}

                    <div className={styles.apartmentSubtypeRows}>
                        {Array.from({ length: layoutData.maxRows }).map((_, rowIndex) => {
                            const leftOption = layoutData.leftColumnOptions[rowIndex];
                            const rightOption = layoutData.rightColumnOptions[rowIndex];
                            const isLeftChecked = leftOption
                                ? selectedIds.includes(leftOption.id)
                                : false;
                            const isRightChecked = rightOption
                                ? selectedIds.includes(rightOption.id)
                                : false;

                            return (
                                <div key={`subtype-row-${rowIndex}`} className={styles.apartmentSubtypeRow}>
                                    {leftOption ? (
                                        <label
                                            className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionLeft}`}
                                            key={`${leftOption.id}-left-${rowIndex}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isLeftChecked}
                                                onChange={() => handleSubtypeToggle(leftOption.id)}
                                                className={styles.apartmentSubtypeCheckbox}
                                            />
                                            <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelLeft}`}>
                                                {leftOption.label}
                                                {leftOption.icon && (
                                                    <span className={styles.apartmentSubtypeIconGroup}>
                                                        {leftOption.icon}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ) : (
                                        <span className={styles.apartmentSubtypePlaceholder} />
                                    )}

                                    <span className={styles.apartmentSubtypeSeparator} aria-hidden="true" />

                                    {rightOption ? (
                                        <label
                                            className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionRight}`}
                                            key={`${rightOption.id}-right-${rowIndex}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isRightChecked}
                                                onChange={() => handleSubtypeToggle(rightOption.id)}
                                                className={styles.apartmentSubtypeCheckbox}
                                            />
                                            <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelRight}`}>
                                                {rightOption.label}
                                                {rightOption.icon && (
                                                    <span className={`${styles.apartmentSubtypeIconGroup} ${styles.apartmentSubtypeIconGroupRight}`}>
                                                        {rightOption.icon}
                                                    </span>
                                                )}
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

