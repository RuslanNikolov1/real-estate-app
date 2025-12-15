'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    CategoryFilter,
    AGRICULTURAL_PROPERTY_TYPES,
    AGRICULTURAL_FEATURES,
} from '../filters';
import {
    AGRICULTURAL_AREA_SLIDER_MAX,
    AGRICULTURAL_PRICE_SLIDER_MAX,
    AGRICULTURAL_PRICE_PER_SQM_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';
import { useFilterState } from '../hooks/useFilterState';

interface AgriculturalLandFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: AgriculturalLandFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
    initialFilters?: Partial<AgriculturalLandFiltersState>;
}

export interface AgriculturalLandFiltersState {
    searchTerm: string;
    propertyId?: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom?: number;
    areaTo?: number;
    isAreaNotProvided: boolean;
    selectedPresetId: string | null;
    selectedCategories: string[];
    selectedFeatures: string[];
    priceFrom?: number;
    priceTo?: number;
    pricePerSqmFrom?: number;
    pricePerSqmTo?: number;
}

const createInitialAgriculturalFilters = (): AgriculturalLandFiltersState => ({
    searchTerm: '',
    propertyId: '',
    city: '',
    neighborhoods: [],
    distance: 0,
    propertyTypes: [],
    areaFrom: undefined,
    areaTo: undefined,
    isAreaNotProvided: false,
    selectedPresetId: null,
    selectedCategories: [],
    selectedFeatures: [],
    priceFrom: undefined,
    priceTo: undefined,
    pricePerSqmFrom: undefined,
    pricePerSqmTo: undefined
});

export function AgriculturalLandFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    initialFilters
}: AgriculturalLandFiltersPageProps) {
    const cityInputRef = useRef<HTMLDivElement>(null);

    // Use external location state if provided, otherwise use internal state
    const [internalLocationState, setInternalLocationState] = useState({
        searchTerm: '',
        city: '',
        cityCoordinates: undefined as [number, number] | undefined,
        neighborhoods: [] as string[],
        distance: 0
    });

    const locationState = externalLocationState || internalLocationState;
    const setLocationState = externalOnLocationChange
        ? (state: typeof internalLocationState) => {
            externalOnLocationChange(state.searchTerm, state.city, state.neighborhoods, state.distance);
        }
        : setInternalLocationState;

    const { filters, updateFilters, resetFilters } = useFilterState<AgriculturalLandFiltersState>(
        createInitialAgriculturalFilters,
        onFiltersChange,
        initialFilters
    );

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const handleLocationChange = useCallback((searchTerm: string, city: string, neighborhoods: string[], distance: number) => {
        // Update external location state if handler provided, otherwise update internal
        if (externalOnLocationChange) {
            externalOnLocationChange(searchTerm, city, neighborhoods, distance);
        } else {
            // Get city coordinates if city is selected
            let cityCoordinates: [number, number] | undefined = undefined;
            if (city) {
                const burgasCities = require('@/data/burgasCities.json');
                const foundCity = burgasCities.cities.find(
                    (c: { name: string; nameEn: string; coordinates: number[] }) =>
                        c.name.toLowerCase() === city.toLowerCase() ||
                        c.nameEn.toLowerCase() === city.toLowerCase()
                );
                if (foundCity && foundCity.coordinates && foundCity.coordinates.length === 2) {
                    cityCoordinates = [foundCity.coordinates[0], foundCity.coordinates[1]];
                }
            }

            setInternalLocationState({
                searchTerm,
                city,
                cityCoordinates,
                neighborhoods,
                distance
            });
        }

        // Format city name: first letter uppercase, rest lowercase for each word
        const formatCityName = (cityName: string): string => {
            if (!cityName || !cityName.trim()) return cityName;
            return cityName
                .trim()
                .split(/\s+/)
                .map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');
        };

        // Format neighborhood names: first letter uppercase, rest lowercase for each word
        const formatNeighborhoodName = (neighborhoodName: string): string => {
            if (!neighborhoodName || !neighborhoodName.trim()) return neighborhoodName;
            return neighborhoodName
                .trim()
                .split(/\s+/)
                .map(word => {
                    if (word.length === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');
        };

        updateFilters({
            searchTerm,
            city: formatCityName(city),
            neighborhoods: neighborhoods.map(formatNeighborhoodName),
            distance
        });
    }, [externalOnLocationChange, updateFilters]);

    const handlePropertyTypeChange = useCallback((selectedTypes: string[]) => {
        updateFilters({ propertyTypes: selectedTypes });
    }, [updateFilters]);

    const handleAreaChange = useCallback((areaFrom: number, areaTo: number, isNotProvided?: boolean) => {
        updateFilters({
            areaFrom,
            areaTo,
            isAreaNotProvided: isNotProvided || false
        });
    }, [updateFilters]);

    const handlePresetChange = useCallback((presetId: string | null) => {
        updateFilters({ selectedPresetId: presetId });
    }, [updateFilters]);

    const handlePriceChange = useCallback((priceFrom: number, priceTo: number, pricePerSqmFrom: number, pricePerSqmTo: number) => {
        updateFilters({
            priceFrom,
            priceTo,
            pricePerSqmFrom,
            pricePerSqmTo
        });
    }, [updateFilters]);

    const handleFeaturesChange = useCallback((selectedFeatures: string[]) => {
        updateFilters({ selectedFeatures });
    }, [updateFilters]);

    const handleCategoryChange = useCallback((selectedCategories: string[]) => {
        updateFilters({ selectedCategories });
    }, [updateFilters]);

    const handlePropertyIdChange = useCallback((value: string) => {
        updateFilters({ propertyId: value });
    }, [updateFilters]);

    const handleClear = useCallback(() => {
        // Reset location state
        setLocationState({
            searchTerm: '',
            city: '',
            cityCoordinates: undefined,
            neighborhoods: [],
            distance: 0
        });

        // Reset all filter values
        resetFilters();

        // Reset components by changing key
        setFilterKey(prev => prev + 1);
    }, [resetFilters, setLocationState]);

    // Track last filterKey we notified parent about to prevent infinite loops
    const lastNotifiedFilterKeyRef = useRef<number | null>(null);

    // Store callbacks in refs to avoid dependency issues
    const onActionButtonsReadyRef = useRef(onActionButtonsReady);
    const handleClearRef = useRef(handleClear);

    // Update refs when callbacks change
    useEffect(() => {
        onActionButtonsReadyRef.current = onActionButtonsReady;
    }, [onActionButtonsReady]);

    useEffect(() => {
        handleClearRef.current = handleClear;
    }, [handleClear]);

    // Notify parent when action buttons are ready - only when filterKey actually changes
    useEffect(() => {
        if (onActionButtonsReadyRef.current && lastNotifiedFilterKeyRef.current !== filterKey) {
            lastNotifiedFilterKeyRef.current = filterKey;
            const actionButtons = (
                <div className={styles.actionButtons}>
                    <Button
                        variant="outline"
                        onClick={handleClearRef.current}
                        className={styles.clearButton}
                    >
                        Изчисти
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            console.log('Search with filters:', filters);
                            if (onSearch) {
                                onSearch();
                            }
                        }}
                        className={styles.searchButton}
                    >
                        Търси
                    </Button>
                </div>
            );
            onActionButtonsReadyRef.current(actionButtons);
        }
    }, [filterKey, onSearch]);

    return (
        <div key={filterKey} className={styles.leftFiltersWrapper}>
            {/* Location Filters */}
            <div className={styles.leftFilters}>
                <div className={styles.idFilter}>
                    <Input
                        label="ID на имот"
                        placeholder="Въведете ID"
                        value={filters.propertyId || ''}
                        onChange={(event) => handlePropertyIdChange(event.target.value)}
                    />
                </div>
                <LocationFiltersGroup
                    onFilterChange={handleLocationChange}
                    initialSearchTerm={locationState.searchTerm}
                    initialCity={locationState.city}
                    initialNeighborhoods={locationState.neighborhoods}
                    initialDistance={locationState.distance}
                    cityInputRef={cityInputRef}
                />
            </div>



            {/* Property Type Filter (Вид) */}
            <SubtypeFilter
                key={`property-type-${filterKey}`}
                title="Вид"
                options={AGRICULTURAL_PROPERTY_TYPES}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filters.propertyTypes || []}
            />
            {/* Price Filter (Цена на имота в лева) */}
            <PriceFilter
                key={`price-${filterKey}`}
                onFilterChange={handlePriceChange}
                initialPriceFrom={filters.priceFrom}
                initialPriceTo={filters.priceTo}
                initialPricePerSqmFrom={filters.pricePerSqmFrom}
                initialPricePerSqmTo={filters.pricePerSqmTo}
                priceSliderMax={AGRICULTURAL_PRICE_SLIDER_MAX}
                pricePerSqmSliderMax={AGRICULTURAL_PRICE_PER_SQM_SLIDER_MAX}
            />
            {/* Area Filter (Площ) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filters.areaFrom}
                initialAreaTo={filters.areaTo}
                sliderMax={AGRICULTURAL_AREA_SLIDER_MAX}
                areaCap={AGRICULTURAL_AREA_SLIDER_MAX}
                title="Площ (кв.м.)"
                onPresetChange={handlePresetChange}
                initialPresetId={filters.selectedPresetId}
            />


            <div className={styles.leftFilters}>
                {/* Category Filter (Категория) */}
                <CategoryFilter
                    key={`category-${filterKey}`}
                    onFilterChange={handleCategoryChange}
                    initialSelected={filters.selectedCategories}
                />
            </div>

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filters.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={AGRICULTURAL_FEATURES}
            />

        </div>
    );
}


