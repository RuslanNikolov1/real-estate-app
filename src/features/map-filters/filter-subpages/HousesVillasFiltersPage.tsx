'use client';

import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    HOUSE_TYPES
} from '../filters';
import {
    HOUSE_AREA_SLIDER_MAX,
    YARD_AREA_SLIDER_MAX,
    YARD_AREA_CAP,
    HOUSE_PRICE_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';

interface HousesVillasFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: HouseFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
}

export interface HouseFiltersState {
    searchTerm: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    houseTypes: string[];
    houseAreaFrom: number;
    houseAreaTo: number;
    yardAreaFrom: number;
    yardAreaTo: number;
    selectedFeatures: string[];
    priceFrom: number;
    priceTo: number;
}

export function HousesVillasFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch
}: HousesVillasFiltersPageProps) {
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

    // Store current filter values - all house/villa filter state managed here
    const filterValuesRef = useRef<Partial<HouseFiltersState>>({
        searchTerm: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        houseTypes: [],
        houseAreaFrom: 50,
        houseAreaTo: 200,
        yardAreaFrom: 100,
        yardAreaTo: 500,
        selectedFeatures: [],
        priceFrom: 0,
        priceTo: HOUSE_PRICE_SLIDER_MAX
    });

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    const notifyFiltersChange = useCallback(() => {
        if (onFiltersChange) {
            onFiltersChange(filterValuesRef.current as HouseFiltersState);
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

    const handleHouseTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.houseTypes = selectedTypes;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleHouseAreaChange = useCallback((areaFrom: number, areaTo: number) => {
        filterValuesRef.current.houseAreaFrom = areaFrom;
        filterValuesRef.current.houseAreaTo = areaTo;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleYardAreaChange = useCallback((yardAreaFrom: number, yardAreaTo: number) => {
        filterValuesRef.current.yardAreaFrom = yardAreaFrom;
        filterValuesRef.current.yardAreaTo = yardAreaTo;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleFeaturesChange = useCallback((selectedFeatures: string[]) => {
        filterValuesRef.current.selectedFeatures = selectedFeatures;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handlePriceChange = useCallback((priceFrom: number, priceTo: number, pricePerSqmFrom: number, pricePerSqmTo: number) => {
        filterValuesRef.current.priceFrom = priceFrom;
        filterValuesRef.current.priceTo = priceTo;
        // Price per sqm not used for houses/villas, but we still need to handle the callback
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
            houseTypes: [],
            houseAreaFrom: 50,
            houseAreaTo: 200,
            yardAreaFrom: 100,
            yardAreaTo: 500,
            selectedFeatures: [],
            priceFrom: 0,
            priceTo: HOUSE_PRICE_SLIDER_MAX
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



            {/* House Type Filter (Етажност) */}
            <SubtypeFilter
                key={`house-type-${filterKey}`}
                title="Етажност"
                options={HOUSE_TYPES}
                onFilterChange={handleHouseTypeChange}
                initialSelected={filterValuesRef.current.houseTypes || []}
                leftOrder={['one-floor', 'three-floor', 'four-plus-floor']}
                rightOrder={['two-floor', 'house-floor', 'not-specified']}
            />
            {/* Price Filter (Цена) */}
            <PriceFilter
                key={`price-${filterKey}`}
                onFilterChange={handlePriceChange}
                initialPriceFrom={filterValuesRef.current.priceFrom}
                initialPriceTo={filterValuesRef.current.priceTo}
            />
            {/* House Area Filter (РЗП кв.м) */}
            <AreaFilter
                key={`house-area-${filterKey}`}
                onFilterChange={handleHouseAreaChange}
                initialAreaFrom={filterValuesRef.current.houseAreaFrom}
                initialAreaTo={filterValuesRef.current.houseAreaTo}
            />

            {/* Yard Area Filter (Двор кв.м) */}
            <AreaFilter
                key={`yard-area-${filterKey}`}
                onFilterChange={handleYardAreaChange}
                title="Двор кв.м"
                sliderMax={YARD_AREA_SLIDER_MAX}
                areaCap={YARD_AREA_CAP}
                inputIdPrefix="yard-area"
                initialAreaFrom={filterValuesRef.current.yardAreaFrom || 100}
                initialAreaTo={filterValuesRef.current.yardAreaTo || 500}
            />

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={(newSelection) => {
                    filterValuesRef.current.selectedFeatures = newSelection;
                    notifyFiltersChange();
                }}
            />
        </div>
    );
}

