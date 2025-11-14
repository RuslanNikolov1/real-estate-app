'use client';

import { useState, useCallback } from 'react';
import { COMPLETION_STATUSES } from './constants';
import type { CompletionStatus } from './types';
import styles from './CompletionStatusFilter.module.scss';

interface CompletionStatusFilterProps {
    onFilterChange: (selectedStatuses: string[]) => void;
    initialSelected?: string[];
}

export function CompletionStatusFilter({ onFilterChange, initialSelected = [] }: CompletionStatusFilterProps) {
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialSelected);

    const handleToggle = useCallback((statusId: string) => {
        setSelectedStatuses((prev) => {
            const updated = prev.includes(statusId)
                ? prev.filter((id) => id !== statusId)
                : [...prev, statusId];
            onFilterChange(updated);
            return updated;
        });
    }, [onFilterChange]);

    return (
        <div className={styles.completionFilter}>
            <h4 className={styles.featuresTitle}>Степен на завършеност</h4>
            <div className={styles.completionGrid}>
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

