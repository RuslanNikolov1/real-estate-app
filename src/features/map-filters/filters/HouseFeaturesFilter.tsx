'use client';

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { HOUSE_FEATURES } from './constants';
import type { FeatureFilter } from './types';
import styles from './FeaturesFilter.module.scss';

interface HouseFeaturesFilterProps {
  selectedFeatures: string[];                 // controlled prop
  onFilterChange: (selectedFeatures: string[]) => void;
  featureSearchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function HouseFeaturesFilter({
  selectedFeatures,
  onFilterChange,
  featureSearchTerm = '',
  onSearchChange,
}: HouseFeaturesFilterProps) {
  const featureFilters = useMemo<FeatureFilter[]>(() => HOUSE_FEATURES, []);
  const allFeature = featureFilters.find(f => f.id === 'all');
  const otherFeatures = featureFilters.filter(f => f.id !== 'all');

  const toggleFeature = (featureId: string) => {
    if (featureId === 'all') {
      // Select ALL feature IDs (except "all")
      const allIds = otherFeatures.map(f => f.id);
  
      // Check if everything is already selected
      const hasAll = allIds.every(id => selectedFeatures.includes(id));
  
      // Toggle
      const newSelection = hasAll ? [] : allIds;
  
      onFilterChange(newSelection);
      return;
    }
  
    // Normal buttons toggle
    const already = selectedFeatures.includes(featureId);
    let newSelection = already
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
  
    // Remove accidental "all" from selection
    newSelection = newSelection.filter(id => id !== 'all');
  
    // If after toggling all individual features are selected → activate "all"
    const allIds = otherFeatures.map(f => f.id);
    const nowHasAll = allIds.every(id => newSelection.includes(id));
  
    if (nowHasAll) {
      newSelection = allIds;
    }
  
    onFilterChange(newSelection);
  };
  

  const filteredFeatures = useMemo(() => {
    if (!featureSearchTerm?.trim()) return featureFilters;
    const s = featureSearchTerm.toLowerCase();
    return featureFilters.filter(f => f.label.toLowerCase().includes(s));
  }, [featureFilters, featureSearchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.featuresFilter}>
        <h4 className={styles.featuresTitle}>Особености</h4>

        <div className={styles.featureSearchWrapper}>
          <div className={styles.autocompleteWrapper}>
            <Input
              id="features-search"
              placeholder="Търсене на особености"
              value={featureSearchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={styles.featureSearchInput}
            />
          </div>
        </div>

        <div className={styles.featuresGrid}>
          {allFeature && (
            <button
              type="button"
              className={`${styles.featureButton} ${styles.allFeatureButton} ${
                otherFeatures.every(f => selectedFeatures.includes(f.id)) ? styles.active : ''
              }`}
              onClick={() => toggleFeature(allFeature.id)}
            >
              {allFeature.label}
            </button>
          )}

          {otherFeatures.map(feature => {
            const isSelected = selectedFeatures.includes(feature.id);
            return (
              <button
                key={feature.id}
                type="button"
                className={`${styles.featureButton} ${isSelected ? styles.active : ''}`}
                onClick={() => toggleFeature(feature.id)}
              >
                {feature.icon && <span className={styles.featureIcon}>{feature.icon}</span>}
                <span>{feature.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
