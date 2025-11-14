'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    HotelCategoryFilter,
    HotelConstructionTypeFilter,
    CompletionStatusFilter,
    BedBaseFilter,
    HOTELS_PROPERTY_TYPES,
    HOTELS_FEATURES
} from '../filters';
import {
    HOTELS_AREA_SLIDER_MAX,
    HOTELS_BED_BASE_SLIDER_MAX,
    HOTELS_PRICE_SLIDER_MAX,
    HOTELS_PRICE_PER_SQM_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';

interface HotelsMotelsFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: HotelsMotelsFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
}

export interface HotelsMotelsFiltersState {
    searchTerm: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom: number;
    areaTo: number;
    isAreaNotProvided: boolean;
    selectedCategories: string[];
    bedBaseFrom: number;
    bedBaseTo: number;
    isBedBaseNotProvided: boolean;
    selectedPresetId: string | null;
    selectedCompletionStatuses: string[];
    selectedConstructionTypes: string[];
    selectedFeatures: string[];
    priceFrom: number;
    priceTo: number;
    pricePerSqmFrom: number;
    pricePerSqmTo: number;
}

export function HotelsMotelsFiltersPage({ 
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch
}: HotelsMotelsFiltersPageProps) {
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
    
    // Store current filter values - all hotels/motels filter state managed here
    const filterValuesRef = useRef<Partial<HotelsMotelsFiltersState>>({
        searchTerm: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        propertyTypes: [],
        areaFrom: 0,
        areaTo: HOTELS_AREA_SLIDER_MAX,
        isAreaNotProvided: false,
        selectedCategories: [],
        bedBaseFrom: 0,
        bedBaseTo: HOTELS_BED_BASE_SLIDER_MAX,
        isBedBaseNotProvided: false,
        selectedPresetId: null,
        selectedCompletionStatuses: [],
        selectedConstructionTypes: [],
        selectedFeatures: [],
        priceFrom: 0,
        priceTo: HOTELS_PRICE_SLIDER_MAX,
        pricePerSqmFrom: 0,
        pricePerSqmTo: HOTELS_PRICE_PER_SQM_SLIDER_MAX
    });

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const notifyFiltersChange = useCallback(() => {
        if (onFiltersChange) {
            onFiltersChange(filterValuesRef.current as HotelsMotelsFiltersState);
        }
    }, [onFiltersChange]);

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

        filterValuesRef.current.searchTerm = searchTerm;
        filterValuesRef.current.city = city;
        filterValuesRef.current.neighborhoods = neighborhoods;
        filterValuesRef.current.distance = distance;
        notifyFiltersChange();
    }, [externalOnLocationChange, notifyFiltersChange]);

    const handlePropertyTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.propertyTypes = selectedTypes;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleAreaChange = useCallback((areaFrom: number, areaTo: number, isNotProvided?: boolean) => {
        filterValuesRef.current.areaFrom = areaFrom;
        filterValuesRef.current.areaTo = areaTo;
        filterValuesRef.current.isAreaNotProvided = isNotProvided || false;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleCategoryChange = useCallback((selectedCategories: string[]) => {
        filterValuesRef.current.selectedCategories = selectedCategories;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleBedBaseChange = useCallback((bedBaseFrom: number, bedBaseTo: number, isNotProvided: boolean) => {
        filterValuesRef.current.bedBaseFrom = bedBaseFrom;
        filterValuesRef.current.bedBaseTo = bedBaseTo;
        filterValuesRef.current.isBedBaseNotProvided = isNotProvided;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleCompletionStatusChange = useCallback((selectedStatuses: string[]) => {
        filterValuesRef.current.selectedCompletionStatuses = selectedStatuses;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleConstructionTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.selectedConstructionTypes = selectedTypes;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handlePriceChange = useCallback((priceFrom: number, priceTo: number, pricePerSqmFrom: number, pricePerSqmTo: number) => {
        filterValuesRef.current.priceFrom = priceFrom;
        filterValuesRef.current.priceTo = priceTo;
        filterValuesRef.current.pricePerSqmFrom = pricePerSqmFrom;
        filterValuesRef.current.pricePerSqmTo = pricePerSqmTo;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleFeaturesChange = useCallback((selectedFeatures: string[]) => {
        filterValuesRef.current.selectedFeatures = selectedFeatures;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

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
        filterValuesRef.current = {
            searchTerm: '',
            city: '',
            neighborhoods: [],
            distance: 0,
            propertyTypes: [],
            areaFrom: 0,
            areaTo: HOTELS_AREA_SLIDER_MAX,
            isAreaNotProvided: false,
            selectedCategories: [],
            bedBaseFrom: 0,
            bedBaseTo: HOTELS_BED_BASE_SLIDER_MAX,
            isBedBaseNotProvided: false,
            selectedPresetId: null,
            selectedCompletionStatuses: [],
            selectedConstructionTypes: [],
            selectedFeatures: [],
            priceFrom: 0,
            priceTo: HOTELS_PRICE_SLIDER_MAX,
            pricePerSqmFrom: 0,
            pricePerSqmTo: HOTELS_PRICE_PER_SQM_SLIDER_MAX
        };
        
        // Reset components by changing key
        setFilterKey(prev => prev + 1);
        notifyFiltersChange();
    }, [notifyFiltersChange, setLocationState]);

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
                            console.log('Search with filters:', filterValuesRef.current);
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
                options={HOTELS_PROPERTY_TYPES}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filterValuesRef.current.propertyTypes || []}
            />

            {/* Area Filter (РЗП в кв.м) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filterValuesRef.current.areaFrom}
                initialAreaTo={filterValuesRef.current.areaTo}
                sliderMax={HOTELS_AREA_SLIDER_MAX}
                areaCap={HOTELS_AREA_SLIDER_MAX}
                title="РЗП в кв.м"
                showNotProvided={true}
            />

            {/* Category Filter (Категория) */}
            <HotelCategoryFilter
                key={`category-${filterKey}`}
                onFilterChange={handleCategoryChange}
                initialSelected={filterValuesRef.current.selectedCategories}
            />

            {/* Bed Base Filter (Леглова база) */}
            <BedBaseFilter
                key={`bed-base-${filterKey}`}
                onFilterChange={handleBedBaseChange}
                initialBedBaseFrom={filterValuesRef.current.bedBaseFrom}
                initialBedBaseTo={filterValuesRef.current.bedBaseTo}
                initialIsNotProvided={filterValuesRef.current.isBedBaseNotProvided}
            />

            {/* Completion Status Filter (Степен на завършеност) */}
            <CompletionStatusFilter
                key={`completion-${filterKey}`}
                onFilterChange={handleCompletionStatusChange}
                initialSelected={filterValuesRef.current.selectedCompletionStatuses}
            />

            {/* Construction Type Filter (Тип строителство) */}
            <HotelConstructionTypeFilter
                key={`construction-${filterKey}`}
                onFilterChange={handleConstructionTypeChange}
                initialSelected={filterValuesRef.current.selectedConstructionTypes}
            />

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={HOTELS_FEATURES}
            />

            {/* Price Filter (Цена) */}
            <PriceFilter
                key={`price-${filterKey}`}
                onFilterChange={handlePriceChange}
                initialPriceFrom={filterValuesRef.current.priceFrom}
                initialPriceTo={filterValuesRef.current.priceTo}
                initialPricePerSqmFrom={filterValuesRef.current.pricePerSqmFrom}
                initialPricePerSqmTo={filterValuesRef.current.pricePerSqmTo}
                priceSliderMax={HOTELS_PRICE_SLIDER_MAX}
                pricePerSqmSliderMax={HOTELS_PRICE_PER_SQM_SLIDER_MAX}
            />
        </div>
    );
}

