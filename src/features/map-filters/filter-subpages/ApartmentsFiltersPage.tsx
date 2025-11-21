'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    ConstructionYearFilter,
    FloorFilter,
    CompletionStatusFilter,
    APARTMENT_SUBTYPES
} from '../filters';
import {
    PRICE_SLIDER_MAX,
    PRICE_PER_SQM_SLIDER_MAX,
    YEAR_SLIDER_MIN,
    YEAR_SLIDER_MAX,
    FLOOR_SLIDER_MIN,
    FLOOR_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';

interface ApartmentsFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: ApartmentFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
}

export interface ApartmentFiltersState {
    searchTerm: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    apartmentSubtypes: string[];
    areaFrom: number;
    areaTo: number;
    priceFrom: number;
    priceTo: number;
    pricePerSqmFrom: number;
    pricePerSqmTo: number;
    selectedFeatures: string[];
    selectedConstructionTypes: string[];
    yearFrom: number;
    yearTo: number;
    isYearNotProvided: boolean;
    floorFrom: number;
    floorTo: number;
    selectedFloorOptions: string[];
    isFloorNotProvided: boolean;
    selectedCompletionStatuses: string[];
}

export function ApartmentsFiltersPage({ 
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch
}: ApartmentsFiltersPageProps) {
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
    
    // Store current filter values - all apartment filter state managed here
    const filterValuesRef = useRef<Partial<ApartmentFiltersState>>({
        searchTerm: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        apartmentSubtypes: [],
        areaFrom: 20,
        areaTo: 100,
        priceFrom: 0,
        priceTo: PRICE_SLIDER_MAX,
        pricePerSqmFrom: 0,
        pricePerSqmTo: PRICE_PER_SQM_SLIDER_MAX,
        selectedFeatures: [],
        selectedConstructionTypes: [],
        yearFrom: YEAR_SLIDER_MIN,
        yearTo: YEAR_SLIDER_MAX,
        isYearNotProvided: false,
        floorFrom: FLOOR_SLIDER_MIN,
        floorTo: FLOOR_SLIDER_MAX,
        selectedFloorOptions: [],
        isFloorNotProvided: false,
        selectedCompletionStatuses: []
    });

    // State for right column filters (for controlled components)
    const [rightColumnFilterState, setRightColumnFilterState] = useState({
        selectedFeatures: [] as string[],
        selectedConstructionTypes: [] as string[],
        yearFrom: YEAR_SLIDER_MIN as number | undefined,
        yearTo: YEAR_SLIDER_MAX as number | undefined,
        isYearNotProvided: false,
        floorFrom: FLOOR_SLIDER_MIN as number | undefined,
        floorTo: FLOOR_SLIDER_MAX as number | undefined,
        selectedFloorOptions: [] as string[],
        isFloorNotProvided: false,
        selectedCompletionStatuses: [] as string[]
    });

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const notifyFiltersChange = useCallback(() => {
        if (onFiltersChange) {
            onFiltersChange(filterValuesRef.current as ApartmentFiltersState);
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


    const handleApartmentSubtypeChange = useCallback((selectedSubtypes: string[]) => {
        filterValuesRef.current.apartmentSubtypes = selectedSubtypes;
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
        setRightColumnFilterState(prev => ({ ...prev, selectedFeatures }));
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleConstructionChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.selectedConstructionTypes = selectedTypes;
        setRightColumnFilterState(prev => ({ ...prev, selectedConstructionTypes: selectedTypes }));
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleYearChange = useCallback((yearFrom: number, yearTo: number, isNotProvided: boolean) => {
        filterValuesRef.current.yearFrom = yearFrom;
        filterValuesRef.current.yearTo = yearTo;
        filterValuesRef.current.isYearNotProvided = isNotProvided;
        setRightColumnFilterState(prev => ({ ...prev, yearFrom, yearTo, isYearNotProvided: isNotProvided }));
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleFloorChange = useCallback((floorFrom: number, floorTo: number, selectedOptions: string[], isNotProvided: boolean) => {
        filterValuesRef.current.floorFrom = floorFrom;
        filterValuesRef.current.floorTo = floorTo;
        filterValuesRef.current.selectedFloorOptions = selectedOptions;
        filterValuesRef.current.isFloorNotProvided = isNotProvided;
        setRightColumnFilterState(prev => ({ ...prev, floorFrom, floorTo, selectedFloorOptions: selectedOptions, isFloorNotProvided: isNotProvided }));
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleCompletionStatusChange = useCallback((selectedStatuses: string[]) => {
        filterValuesRef.current.selectedCompletionStatuses = selectedStatuses;
        setRightColumnFilterState(prev => ({ ...prev, selectedCompletionStatuses: selectedStatuses }));
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
            apartmentSubtypes: [],
            areaFrom: 20,
            areaTo: 100,
            priceFrom: 0,
            priceTo: PRICE_SLIDER_MAX,
            pricePerSqmFrom: 0,
            pricePerSqmTo: PRICE_PER_SQM_SLIDER_MAX,
            selectedFeatures: [],
            selectedConstructionTypes: [],
            yearFrom: YEAR_SLIDER_MIN,
            yearTo: YEAR_SLIDER_MAX,
            isYearNotProvided: false,
            floorFrom: FLOOR_SLIDER_MIN,
            floorTo: FLOOR_SLIDER_MAX,
            selectedFloorOptions: [],
            isFloorNotProvided: false,
            selectedCompletionStatuses: []
        };
        // Reset right column filter state
        setRightColumnFilterState({
            selectedFeatures: [],
            selectedConstructionTypes: [],
            yearFrom: YEAR_SLIDER_MIN,
            yearTo: YEAR_SLIDER_MAX,
            isYearNotProvided: false,
            floorFrom: FLOOR_SLIDER_MIN,
            floorTo: FLOOR_SLIDER_MAX,
            selectedFloorOptions: [],
            isFloorNotProvided: false,
            selectedCompletionStatuses: []
        });
        // Reset components by changing key
        setFilterKey(prev => prev + 1);
        notifyFiltersChange();
    }, [notifyFiltersChange]);


    // Notify parent when action buttons are ready
    useEffect(() => {
        if (onActionButtonsReady) {
            const actionButtons = (
                <div className={styles.actionButtons}>
                    <Button
                        variant="outline"
                        onClick={handleClear}
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
            onActionButtonsReady(actionButtons);
        }
    }, [filterKey, handleClear, onActionButtonsReady, onSearch]);

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

            

            {/* Apartment Subtype Filter */}
            <SubtypeFilter
                key={`subtype-${filterKey}`}
                title="Вид на имота"
                options={APARTMENT_SUBTYPES}
                onFilterChange={handleApartmentSubtypeChange}
                initialSelected={filterValuesRef.current.apartmentSubtypes || []}
                leftOrder={['studio', 'two-bedroom', 'maisonette', 'attic']}
                rightOrder={['one-bedroom', 'multi-bedroom', 'atelier']}
            />
{/* Price Filter */}
<PriceFilter
                onFilterChange={handlePriceChange}
            />
            {/* Area Filter */}
            <AreaFilter
                onFilterChange={handleAreaChange}
            />

            {/* Features Filter */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                onFilterChange={handleFeaturesChange}
                initialSelected={rightColumnFilterState.selectedFeatures}
            />

            {/* Construction & Year Filter */}
            <ConstructionYearFilter
                key={`construction-year-${filterKey}`}
                onConstructionChange={handleConstructionChange}
                onYearChange={handleYearChange}
                initialSelectedTypes={rightColumnFilterState.selectedConstructionTypes}
                initialYearFrom={rightColumnFilterState.yearFrom}
                initialYearTo={rightColumnFilterState.yearTo}
                initialIsYearNotProvided={rightColumnFilterState.isYearNotProvided}
            />

            {/* Floor Filter */}
            <FloorFilter
                key={`floor-${filterKey}`}
                onFilterChange={handleFloorChange}
                initialFloorFrom={rightColumnFilterState.floorFrom}
                initialFloorTo={rightColumnFilterState.floorTo}
                initialSpecialOptions={rightColumnFilterState.selectedFloorOptions}
                initialIsNotProvided={rightColumnFilterState.isFloorNotProvided}
            />

            {/* Completion Status Filter */}
            <CompletionStatusFilter
                key={`completion-${filterKey}`}
                onFilterChange={handleCompletionStatusChange}
                initialSelected={rightColumnFilterState.selectedCompletionStatuses}
            />
        </div>
    );
}

