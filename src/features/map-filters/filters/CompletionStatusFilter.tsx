'use client';

import { useState, useCallback, useEffect } from 'react';
import { COMPLETION_STATUSES } from './constants';
import type { CompletionStatus } from './types';
import styles from './CompletionStatusFilter.module.scss';

interface CompletionStatusFilterProps {
    onFilterChange: (selectedStatuses: string[]) => void;
    initialSelected?: string[];
}

export function CompletionStatusFilter({ onFilterChange, initialSelected = [] }: CompletionStatusFilterProps) {
    // For single selection, we only keep the first item or null
    const [selectedStatus, setSelectedStatus] = useState<string | null>(initialSelected.length > 0 ? initialSelected[0] : null);

    // Sync state when initialSelected changes
    useEffect(() => {
        setSelectedStatus(initialSelected.length > 0 ? initialSelected[0] : null);
    }, [initialSelected]);

    const handleToggle = useCallback((statusId: string) => {
        setSelectedStatus((prev) => {
            // If clicking the same item, deselect it
            if (prev === statusId) {
                onFilterChange([]);
                return null;
            }
            // Otherwise, select the new item (single selection)
            onFilterChange([statusId]);
            return statusId;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.completionFilter}>
            <h4 className={styles.featuresTitle}>Степен на завършеност</h4>
            <div className={styles.constructionGrid}>
                {COMPLETION_STATUSES.map((status: CompletionStatus) => {
                    const isSelected = selectedStatus === status.id;
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

