'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    FloorFilter,
    ConstructionTypeFilter,
    CompletionStatusFilter,
    BuildingTypeFilter,
    COMMERCIAL_PROPERTY_TYPES,
    COMMERCIAL_FEATURES,
    COMMERCIAL_FLOOR_OPTIONS
} from '../filters';
import {
    COMMERCIAL_AREA_SLIDER_MAX,
    COMMERCIAL_PRICE_SLIDER_MAX,
    COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX,
    FLOOR_SLIDER_MIN,
    FLOOR_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';

interface StoresOfficesFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: CommercialFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
}

export interface CommercialFiltersState {
    searchTerm: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom: number;
    areaTo: number;
    priceFrom: number;
    priceTo: number;
    pricePerSqmFrom: number;
    pricePerSqmTo: number;
    selectedFeatures: string[];
    selectedFloorOptions: string[];
    floorFrom: number;
    floorTo: number;
    isFloorNotProvided: boolean;
    selectedConstructionTypes: string[];
    selectedCompletionStatuses: string[];
    selectedBuildingTypes: string[];
}

export function StoresOfficesFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch
}: StoresOfficesFiltersPageProps) {
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

    // Store current filter values - all commercial filter state managed here
    const filterValuesRef = useRef<Partial<CommercialFiltersState>>({
        searchTerm: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        propertyTypes: [],
        areaFrom: 0,
        areaTo: COMMERCIAL_AREA_SLIDER_MAX,
        priceFrom: 0,
        priceTo: COMMERCIAL_PRICE_SLIDER_MAX,
        pricePerSqmFrom: 0,
        pricePerSqmTo: COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX,
        selectedFeatures: [],
        selectedFloorOptions: [],
        floorFrom: FLOOR_SLIDER_MIN,
        floorTo: FLOOR_SLIDER_MAX,
        isFloorNotProvided: false,
        selectedConstructionTypes: [],
        selectedCompletionStatuses: [],
        selectedBuildingTypes: []
    });

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const notifyFiltersChange = useCallback(() => {
        if (onFiltersChange) {
            onFiltersChange(filterValuesRef.current as CommercialFiltersState);
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

    const handleAreaChange = useCallback((areaFrom: number, areaTo: number) => {
        filterValuesRef.current.areaFrom = areaFrom;
        filterValuesRef.current.areaTo = areaTo;
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

    const handleFloorChange = useCallback((floorFrom: number, floorTo: number, selectedOptions: string[], isNotProvided: boolean) => {
        filterValuesRef.current.floorFrom = floorFrom;
        filterValuesRef.current.floorTo = floorTo;
        filterValuesRef.current.selectedFloorOptions = selectedOptions;
        filterValuesRef.current.isFloorNotProvided = isNotProvided;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleConstructionTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.selectedConstructionTypes = selectedTypes;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleCompletionStatusChange = useCallback((selectedStatuses: string[]) => {
        filterValuesRef.current.selectedCompletionStatuses = selectedStatuses;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleBuildingTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.selectedBuildingTypes = selectedTypes;
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
            areaTo: COMMERCIAL_AREA_SLIDER_MAX,
            priceFrom: 0,
            priceTo: COMMERCIAL_PRICE_SLIDER_MAX,
            pricePerSqmFrom: 0,
            pricePerSqmTo: COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX,
            selectedFeatures: [],
            selectedFloorOptions: [],
            floorFrom: FLOOR_SLIDER_MIN,
            floorTo: FLOOR_SLIDER_MAX,
            isFloorNotProvided: false,
            selectedConstructionTypes: [],
            selectedCompletionStatuses: [],
            selectedBuildingTypes: []
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



            {/* Property Type Filter (Подходящ за) */}
            <SubtypeFilter
                key={`property-type-${filterKey}`}
                title="Подходящ за"
                options={COMMERCIAL_PROPERTY_TYPES}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filterValuesRef.current.propertyTypes || []}
                leftOrder={['store', 'cabinet', 'sport']}
                rightOrder={['office', 'beauty-salon', 'other']}
            />
            {/* Price Filter (Цена) */}
            <PriceFilter
                key={`price-${filterKey}`}
                onFilterChange={handlePriceChange}
                initialPriceFrom={filterValuesRef.current.priceFrom}
                initialPriceTo={filterValuesRef.current.priceTo}
                initialPricePerSqmFrom={filterValuesRef.current.pricePerSqmFrom}
                initialPricePerSqmTo={filterValuesRef.current.pricePerSqmTo}
                priceSliderMax={COMMERCIAL_PRICE_SLIDER_MAX}
                pricePerSqmSliderMax={COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX}
            />
            {/* Area Filter (Квадратура) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filterValuesRef.current.areaFrom}
                initialAreaTo={filterValuesRef.current.areaTo}
                sliderMax={COMMERCIAL_AREA_SLIDER_MAX}
                areaCap={COMMERCIAL_AREA_SLIDER_MAX}
                title="Квадратура"
            />

            {/* Floor Filter (Етаж) */}
            <FloorFilter
                key={`floor-${filterKey}`}
                onFilterChange={handleFloorChange}
                initialFloorFrom={filterValuesRef.current.floorFrom}
                initialFloorTo={filterValuesRef.current.floorTo}
                initialSpecialOptions={filterValuesRef.current.selectedFloorOptions}
                initialIsNotProvided={filterValuesRef.current.isFloorNotProvided}
                floorOptions={COMMERCIAL_FLOOR_OPTIONS}
            />

            <div className={styles.leftFilters}>
                {/* Construction Type Filter (Тип строителство) */}
                <ConstructionTypeFilter
                    key={`construction-${filterKey}`}
                    onFilterChange={handleConstructionTypeChange}
                    initialSelected={filterValuesRef.current.selectedConstructionTypes}
                />
            </div>
            {/* Completion Status Filter (Степен на завършеност) */}
            <CompletionStatusFilter
                key={`completion-${filterKey}`}
                onFilterChange={handleCompletionStatusChange}
                initialSelected={filterValuesRef.current.selectedCompletionStatuses}
            />
            <div className={styles.leftFilters}>
                {/* Building Type Filter (Вид сграда) */}
                <BuildingTypeFilter
                    key={`building-type-${filterKey}`}
                    onFilterChange={handleBuildingTypeChange}
                    initialSelected={filterValuesRef.current.selectedBuildingTypes}
                />
            </div>

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={COMMERCIAL_FEATURES}
            />
        </div>
    );
}


