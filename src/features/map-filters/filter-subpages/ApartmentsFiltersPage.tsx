'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, MoneyWavy } from '@phosphor-icons/react';
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
import priceFilterStyles from '../filters/PriceFilter.module.scss';

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
    isRentMode?: boolean;
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
    selectedConstructionTypes?: string[];
    yearFrom?: number;
    yearTo?: number;
    isYearNotProvided?: boolean;
    floorFrom: number;
    floorTo: number;
    selectedFloorOptions: string[];
    isFloorNotProvided: boolean;
    selectedCompletionStatuses?: string[];
    // Rent-specific fields
    selectedFurnishing?: string[];
    monthlyRentFrom?: number;
    monthlyRentTo?: number;
    rentPerSqmFrom?: number;
    rentPerSqmTo?: number;
}

export function ApartmentsFiltersPage({ 
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    isRentMode = false
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
    
    // Furnishing options for rent mode
    const FURNISHING_OPTIONS = [
        { id: 'furnished', label: 'Обзаведен' },
        { id: 'partially-furnished', label: 'Частично обзаведен' },
        { id: 'unfurnished', label: 'Необзаведен' }
    ];

    // Rent price constants
    const RENT_SLIDER_MAX = 1800;
    const RENT_SLIDER_MIN = 20;
    const RENT_PER_SQM_SLIDER_MAX = 24;
    const RENT_PER_SQM_SLIDER_MIN = 0;

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
        selectedCompletionStatuses: [],
        // Rent-specific fields
        selectedFurnishing: [],
        monthlyRentFrom: RENT_SLIDER_MIN,
        monthlyRentTo: RENT_SLIDER_MAX,
        rentPerSqmFrom: RENT_PER_SQM_SLIDER_MIN,
        rentPerSqmTo: RENT_PER_SQM_SLIDER_MAX
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

    // Rent-specific handlers
    const handleFurnishingChange = useCallback((selectedFurnishing: string[]) => {
        filterValuesRef.current.selectedFurnishing = selectedFurnishing;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleMonthlyRentChange = useCallback((rentFrom: number, rentTo: number) => {
        filterValuesRef.current.monthlyRentFrom = rentFrom;
        filterValuesRef.current.monthlyRentTo = rentTo;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleRentPerSqmChange = useCallback((rentPerSqmFrom: number, rentPerSqmTo: number) => {
        filterValuesRef.current.rentPerSqmFrom = rentPerSqmFrom;
        filterValuesRef.current.rentPerSqmTo = rentPerSqmTo;
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
            selectedCompletionStatuses: [],
            // Reset rent-specific fields
            selectedFurnishing: [],
            monthlyRentFrom: RENT_SLIDER_MIN,
            monthlyRentTo: RENT_SLIDER_MAX,
            rentPerSqmFrom: RENT_PER_SQM_SLIDER_MIN,
            rentPerSqmTo: RENT_PER_SQM_SLIDER_MAX
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

    // Rent Price Filter Component
    const RentPriceFilter = React.memo(({ 
        title, 
        unit, 
        sliderMin, 
        sliderMax, 
        from, 
        to, 
        onFilterChange 
    }: {
        title: string;
        unit: string;
        sliderMin: number;
        sliderMax: number;
        from: number;
        to: number;
        onFilterChange: (from: number, to: number) => void;
    }) => {
        const [rentFrom, setRentFrom] = useState(from);
        const [rentTo, setRentTo] = useState(to);

        useEffect(() => {
            setRentFrom(from);
            setRentTo(to);
        }, [from, to]);

        const rentFromClamped = Math.max(sliderMin, Math.min(rentFrom, sliderMax));
        const rentToClamped = Math.max(sliderMin, Math.min(rentTo, sliderMax));

        const piggyBankSize = useMemo(
            () => {
                const minSize = 32;
                const maxSize = 64;
                const range = sliderMax - sliderMin;
                const normalizedValue = range > 0 ? (rentToClamped - sliderMin) / range : 0;
                return minSize + normalizedValue * (maxSize - minSize);
            },
            [rentToClamped, sliderMin, sliderMax]
        );

        const handleFromChange = useCallback((val: number) => {
            if (val > rentTo) {
                setRentTo(val);
                setRentFrom(val);
                onFilterChange(val, val);
            } else {
                setRentFrom(val);
                onFilterChange(val, rentTo);
            }
        }, [rentTo, onFilterChange]);

        const handleToChange = useCallback((val: number) => {
            if (val < rentFrom) {
                setRentFrom(val);
                setRentTo(val);
                onFilterChange(val, val);
            } else {
                setRentTo(val);
                onFilterChange(rentFrom, val);
            }
        }, [rentFrom, onFilterChange]);

        return (
            <div className={priceFilterStyles.container}>
                <div className={priceFilterStyles.priceFilter}>
                    <h4 className={priceFilterStyles.priceTitle}>{title} ({unit})</h4>
                    <div className={priceFilterStyles.priceControls}>
                        <div className={priceFilterStyles.dualRangeSlider}>
                            <input
                                type="range"
                                min={sliderMin}
                                max={sliderMax}
                                step={sliderMax <= 100 ? 1 : sliderMax <= 1000 ? 20 : 50}
                                value={rentFromClamped}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) {
                                        handleFromChange(val);
                                    }
                                }}
                                className={`${priceFilterStyles.priceSlider} ${priceFilterStyles.priceSliderFrom}`}
                                style={{
                                    '--slider-value': `${((rentFromClamped - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                                    '--slider-to-value': `${((rentToClamped - sliderMin) / (sliderMax - sliderMin)) * 100}%`
                                } as React.CSSProperties}
                            />
                            <input
                                type="range"
                                min={sliderMin}
                                max={sliderMax}
                                step={sliderMax <= 100 ? 1 : sliderMax <= 1000 ? 20 : 50}
                                value={rentToClamped}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) {
                                        handleToChange(val);
                                    }
                                }}
                                className={`${priceFilterStyles.priceSlider} ${priceFilterStyles.priceSliderTo}`}
                                style={{
                                    '--slider-value': `${((rentToClamped - sliderMin) / (sliderMax - sliderMin)) * 100}%`
                                } as React.CSSProperties}
                            />
                        </div>
                        <div className={priceFilterStyles.priceInputs}>
                            <div className={priceFilterStyles.priceInputWrapper}>
                                <label htmlFor={`${title}-from`} className={priceFilterStyles.priceInputLabel}>
                                    От
                                </label>
                                <input
                                    type="number"
                                    id={`${title}-from`}
                                    min={sliderMin}
                                    value={rentFrom}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val >= sliderMin) {
                                            handleFromChange(val);
                                        }
                                    }}
                                    className={priceFilterStyles.priceInput}
                                    placeholder={sliderMin.toString()}
                                />
                            </div>
                            <div className={priceFilterStyles.pricePiggyBankWrapper} aria-hidden="true">
                                <PiggyBank
                                    className={priceFilterStyles.pricePiggyBankIcon}
                                    size={piggyBankSize}
                                />
                            </div>
                            <div className={priceFilterStyles.priceInputWrapper}>
                                <label htmlFor={`${title}-to`} className={priceFilterStyles.priceInputLabel}>
                                    До
                                </label>
                                <input
                                    type="number"
                                    id={`${title}-to`}
                                    min={sliderMin}
                                    value={rentTo}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val) && val >= sliderMin) {
                                            handleToChange(val);
                                        }
                                    }}
                                    className={priceFilterStyles.priceInput}
                                    placeholder={sliderMax.toString()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });
    RentPriceFilter.displayName = 'RentPriceFilter';

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

            {/* Price/Rent Filters - Conditional based on mode */}
            {isRentMode ? (
                <>
                    {/* Furnishing Filter */}
                    <SubtypeFilter
                        key={`furnishing-${filterKey}`}
                        title="Обзавеждане"
                        options={FURNISHING_OPTIONS}
                        onFilterChange={handleFurnishingChange}
                        initialSelected={filterValuesRef.current.selectedFurnishing || []}
                    />
                    
                    {/* Monthly Rent Filter */}
                    <RentPriceFilter
                        title="Месечен наем"
                        unit="лева"
                        sliderMin={RENT_SLIDER_MIN}
                        sliderMax={RENT_SLIDER_MAX}
                        from={filterValuesRef.current.monthlyRentFrom || RENT_SLIDER_MIN}
                        to={filterValuesRef.current.monthlyRentTo || RENT_SLIDER_MAX}
                        onFilterChange={handleMonthlyRentChange}
                    />

                    {/* Rent Per Sqm Filter */}
                    <RentPriceFilter
                        title="Цена за кв.м"
                        unit="лева"
                        sliderMin={RENT_PER_SQM_SLIDER_MIN}
                        sliderMax={RENT_PER_SQM_SLIDER_MAX}
                        from={filterValuesRef.current.rentPerSqmFrom || RENT_PER_SQM_SLIDER_MIN}
                        to={filterValuesRef.current.rentPerSqmTo || RENT_PER_SQM_SLIDER_MAX}
                        onFilterChange={handleRentPerSqmChange}
                    />
                </>
            ) : (
                <PriceFilter
                    onFilterChange={handlePriceChange}
                />
            )}

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

            {/* Construction & Year Filter - Only for sale mode */}
            {!isRentMode && (
                <ConstructionYearFilter
                    key={`construction-year-${filterKey}`}
                    onConstructionChange={handleConstructionChange}
                    onYearChange={handleYearChange}
                    initialSelectedTypes={rightColumnFilterState.selectedConstructionTypes}
                    initialYearFrom={rightColumnFilterState.yearFrom}
                    initialYearTo={rightColumnFilterState.yearTo}
                    initialIsYearNotProvided={rightColumnFilterState.isYearNotProvided}
                />
            )}

            {/* Floor Filter */}
            <FloorFilter
                key={`floor-${filterKey}`}
                onFilterChange={handleFloorChange}
                initialFloorFrom={rightColumnFilterState.floorFrom}
                initialFloorTo={rightColumnFilterState.floorTo}
                initialSpecialOptions={rightColumnFilterState.selectedFloorOptions}
                initialIsNotProvided={rightColumnFilterState.isFloorNotProvided}
            />

            {/* Completion Status Filter - Only for sale mode */}
            {!isRentMode && (
                <CompletionStatusFilter
                    key={`completion-${filterKey}`}
                    onFilterChange={handleCompletionStatusChange}
                    initialSelected={rightColumnFilterState.selectedCompletionStatuses}
                />
            )}
        </div>
    );
}

