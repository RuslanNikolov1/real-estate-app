'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { APARTMENT_FEATURE_FILTERS } from './constants';
import type { FeatureFilter } from './types';
import styles from './FeaturesFilter.module.scss';

interface FeaturesFilterProps {
    onFilterChange: (selectedFeatures: string[]) => void;
    initialSelected?: string[];
    features?: FeatureFilter[];
}

export function FeaturesFilter({ onFilterChange, initialSelected = [], features }: FeaturesFilterProps) {
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialSelected);
    const [featureSearchTerm, setFeatureSearchTerm] = useState('');
    const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
    const featureInputRef = useRef<HTMLInputElement>(null);
    const featureDropdownRef = useRef<HTMLDivElement>(null);

    // Sync state when initialSelected changes (e.g., when filterKey changes and component remounts)
    // IMPORTANT: Do NOT call onFilterChange here - only sync internal state
    // onFilterChange should only be called on user interaction
    useEffect(() => {
        setSelectedFeatures(initialSelected);
    }, [initialSelected]);

    const featureFilters = useMemo<FeatureFilter[]>(() => {
        return features || APARTMENT_FEATURE_FILTERS;
    }, [features]);

    // Sync filter changes to parent when selectedFeatures changes (but not on initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Update parent filter state when selection changes
        onFilterChange(selectedFeatures);
    }, [selectedFeatures, onFilterChange]);

    const handleFeatureToggle = useCallback((featureId: string) => {
        const nonAllFeatures = featureFilters.filter((feature) => feature.id !== 'all').map((feature) => feature.id);

        if (featureId === 'all') {
            setSelectedFeatures((prev) => {
                const hasAllSelected = nonAllFeatures.every((id) => prev.includes(id));
                return hasAllSelected ? [] : nonAllFeatures;
            });
            return;
        }

        setSelectedFeatures((prev) => {
            const isSelected = prev.includes(featureId);
            const updated = isSelected ? prev.filter((id) => id !== featureId) : [...prev.filter((id) => id !== 'all'), featureId];

            const hasAllSelected = nonAllFeatures.every((id) => updated.includes(id));

            if (hasAllSelected) {
                return nonAllFeatures;
            }

            return updated;
        });
    }, [featureFilters]);

    return (
        <div className={styles.featuresFilter}>
            <h4 className={styles.featuresTitle}>Особености</h4>
            <div className={styles.autocompleteWrapper}>
                <Input
                    id="features-search"
                    label="Търсене на особеност"
                    placeholder="Изберете особеност..."
                    value={featureSearchTerm}
                    onChange={(event) => {
                        setFeatureSearchTerm(event.target.value);
                        setShowFeatureDropdown(true);
                    }}
                    onFocus={() => setShowFeatureDropdown(true)}
                    onBlur={(e) => {
                        setTimeout(() => {
                            if (!featureDropdownRef.current?.contains(document.activeElement)) {
                                setShowFeatureDropdown(false);
                            }
                        }, 200);
                    }}
                    ref={featureInputRef}
                    className={styles.filterInput}
                />
                {showFeatureDropdown && (
                    <div
                        ref={featureDropdownRef}
                        className={styles.cityDropdown}
                    >
                        {featureFilters
                            .filter((feature) => feature.id !== 'all')
                            .filter((feature) => {
                                const searchTerm = featureSearchTerm.toLowerCase().trim();
                                if (!searchTerm) return true;
                                return feature.label.toLowerCase().includes(searchTerm);
                            })
                            .map((feature) => {
                                const isSelected = selectedFeatures.includes(feature.id);
                                return (
                                    <button
                                        key={feature.id}
                                        type="button"
                                        className={`${styles.cityDropdownItem} ${isSelected ? styles.featureDropdownItemSelected : ''}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                        }}
                                        onClick={() => {
                                            handleFeatureToggle(feature.id);
                                            setFeatureSearchTerm('');
                                            setShowFeatureDropdown(false);
                                        }}
                                    >
                                        {feature.icon && (
                                            <span className={styles.featureIcon}>{feature.icon}</span>
                                        )}
                                        <span>{feature.label}</span>
                                    </button>
                                );
                            })}
                        {featureFilters
                            .filter((feature) => feature.id !== 'all')
                            .filter((feature) => {
                                const searchTerm = featureSearchTerm.toLowerCase().trim();
                                if (!searchTerm) return true;
                                return feature.label.toLowerCase().includes(searchTerm);
                            }).length === 0 && (
                                <div className={styles.noNeighborhoodsMessage}>
                                    Няма налични особенности
                                </div>
                            )}
                    </div>
                )}
            </div>
            
            <div className={styles.featuresGrid}>
                {featureFilters.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature.id);
                    return (
                        <button
                            key={feature.id}
                            type="button"
                            className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                            onClick={() => handleFeatureToggle(feature.id)}
                        >
                            {feature.icon && (
                                <span className={styles.featureIcon}>{feature.icon}</span>
                            )}
                            <span className={styles.featureLabel}>{feature.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

