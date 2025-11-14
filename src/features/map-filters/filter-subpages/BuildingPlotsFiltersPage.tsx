'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    ElectricityFilter,
    WaterFilter,
    BUILDING_PLOTS_FEATURES
} from '../filters';
import {
    BUILDING_PLOTS_AREA_SLIDER_MAX,
    BUILDING_PLOTS_PRICE_SLIDER_MAX,
    BUILDING_PLOTS_PRICE_PER_SQM_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';

interface BuildingPlotsFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: BuildingPlotsFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
}

export interface BuildingPlotsFiltersState {
    searchTerm: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    areaFrom: number;
    areaTo: number;
    priceFrom: number;
    priceTo: number;
    pricePerSqmFrom: number;
    pricePerSqmTo: number;
    selectedFeatures: string[];
    selectedElectricityOptions: string[];
    selectedWaterOptions: string[];
}

export function BuildingPlotsFiltersPage({ 
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady
}: BuildingPlotsFiltersPageProps) {
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
    
    // Store current filter values - all building plots filter state managed here
    const filterValuesRef = useRef<Partial<BuildingPlotsFiltersState>>({
        searchTerm: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        areaFrom: 0,
        areaTo: BUILDING_PLOTS_AREA_SLIDER_MAX,
        priceFrom: 0,
        priceTo: BUILDING_PLOTS_PRICE_SLIDER_MAX,
        pricePerSqmFrom: 0,
        pricePerSqmTo: BUILDING_PLOTS_PRICE_PER_SQM_SLIDER_MAX,
        selectedFeatures: [],
        selectedElectricityOptions: [],
        selectedWaterOptions: []
    });

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const notifyFiltersChange = useCallback(() => {
        if (onFiltersChange) {
            onFiltersChange(filterValuesRef.current as BuildingPlotsFiltersState);
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

    const handleElectricityChange = useCallback((selectedOptions: string[]) => {
        filterValuesRef.current.selectedElectricityOptions = selectedOptions;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleWaterChange = useCallback((selectedOptions: string[]) => {
        filterValuesRef.current.selectedWaterOptions = selectedOptions;
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
            areaFrom: 0,
            areaTo: BUILDING_PLOTS_AREA_SLIDER_MAX,
            priceFrom: 0,
            priceTo: BUILDING_PLOTS_PRICE_SLIDER_MAX,
            pricePerSqmFrom: 0,
            pricePerSqmTo: BUILDING_PLOTS_PRICE_PER_SQM_SLIDER_MAX,
            selectedFeatures: [],
            selectedElectricityOptions: [],
            selectedWaterOptions: []
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
                            // Dummy callback for now - will query database later
                            console.log('Search with filters:', filterValuesRef.current);
                        }}
                        className={styles.searchButton}
                    >
                        Търси
                    </Button>
                </div>
            );
            onActionButtonsReadyRef.current(actionButtons);
        }
    }, [filterKey]);

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

            {/* Area Filter (Квадратура) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filterValuesRef.current.areaFrom}
                initialAreaTo={filterValuesRef.current.areaTo}
                sliderMax={BUILDING_PLOTS_AREA_SLIDER_MAX}
                areaCap={BUILDING_PLOTS_AREA_SLIDER_MAX}
                title="Квадратура"
            />

            {/* Electricity Filter (Ток) */}
            <ElectricityFilter
                key={`electricity-${filterKey}`}
                onFilterChange={handleElectricityChange}
                initialSelected={filterValuesRef.current.selectedElectricityOptions}
            />

            {/* Water Filter (Вода) */}
            <WaterFilter
                key={`water-${filterKey}`}
                onFilterChange={handleWaterChange}
                initialSelected={filterValuesRef.current.selectedWaterOptions}
            />

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={BUILDING_PLOTS_FEATURES}
            />

            {/* Price Filter (Цена) */}
            <PriceFilter
                key={`price-${filterKey}`}
                onFilterChange={handlePriceChange}
                initialPriceFrom={filterValuesRef.current.priceFrom}
                initialPriceTo={filterValuesRef.current.priceTo}
                initialPricePerSqmFrom={filterValuesRef.current.pricePerSqmFrom}
                initialPricePerSqmTo={filterValuesRef.current.pricePerSqmTo}
                priceSliderMax={BUILDING_PLOTS_PRICE_SLIDER_MAX}
                pricePerSqmSliderMax={BUILDING_PLOTS_PRICE_PER_SQM_SLIDER_MAX}
            />
        </div>
    );
}


