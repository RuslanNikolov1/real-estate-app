'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { COMPLETION_STATUSES } from './constants';
import type { CompletionStatus } from './types';
import styles from './CompletionStatusFilter.module.scss';

interface CompletionStatusFilterProps {
    onFilterChange: (selectedStatuses: string[]) => void;
    initialSelected?: string[];
}

export function CompletionStatusFilter({ onFilterChange, initialSelected = [] }: CompletionStatusFilterProps) {
    // For multiple selection, keep an array of selected statuses
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialSelected);

    // Sync state when initialSelected changes
    useEffect(() => {
        setSelectedStatuses(initialSelected);
    }, [initialSelected]);

    // Sync filter changes to parent when selectedStatuses changes (but not on initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Update parent filter state when selection changes
        onFilterChange(selectedStatuses);
    }, [selectedStatuses, onFilterChange]);

    const handleToggle = useCallback((statusId: string) => {
        setSelectedStatuses((prev) => {
            // If clicking the same item, deselect it
            if (prev.includes(statusId)) {
                return prev.filter(id => id !== statusId);
            }
            // Otherwise, add the new item (multiple selection)
            return [...prev, statusId];
        });
    }, []);

    return (
        <div className={styles.completionFilter}>
            <h4 className={styles.featuresTitle}>Степен на завършеност</h4>
            <div className={styles.constructionGrid}>
                {COMPLETION_STATUSES.map((status: CompletionStatus) => {
                    const isSelected = selectedStatuses.includes(status.id);
                    return (
                        <button
                            key={status.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleToggle(status.id)}
                        >
                            {status.icon && (
                                <span className={styles.featureIcon}>{status.icon}</span>
                            )}
                            <span className={styles.featureLabel}>{status.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

