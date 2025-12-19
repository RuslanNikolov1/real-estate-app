'use client';

import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { PiggyBank } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    HOUSE_TYPES
} from '../filters';
import { HOUSE_FEATURES, RENT_HOUSE_FEATURES } from '../filters/constants';
import {
    HOUSE_AREA_SLIDER_MAX,
    YARD_AREA_SLIDER_MAX,
    YARD_AREA_CAP,
    HOUSE_PRICE_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';
import priceFilterStyles from '../filters/PriceFilter.module.scss';

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
    isRentMode?: boolean;
}

export interface HouseFiltersState {
    searchTerm: string;
    propertyId?: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    houseTypes: string[];
    houseAreaFrom: number;
    houseAreaTo: number;
    yardAreaFrom: number;
    yardAreaTo: number;
    selectedFeatures: string[];
    priceFrom?: number;
    priceTo?: number;
    // Rent-specific fields
    selectedFurnishing?: string[];
    monthlyRentFrom?: number;
    monthlyRentTo?: number;
    rentPerSqmFrom?: number;
    rentPerSqmTo?: number;
}

export function HousesVillasFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    isRentMode = false
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
    const [propertyId, setPropertyId] = useState('');

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
    const RENT_SLIDER_MAX = 6300;
    const RENT_SLIDER_MIN = 25;
    const RENT_PER_SQM_SLIDER_MAX = 28;
    const RENT_PER_SQM_SLIDER_MIN = 0;

    // Store current filter values - all house/villa filter state managed here
    // Use undefined for numeric filters so they're not sent unless user explicitly sets them
    const filterValuesRef = useRef<Partial<HouseFiltersState>>({
        searchTerm: '',
        propertyId: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        houseTypes: [],
        houseAreaFrom: undefined,
        houseAreaTo: undefined,
        yardAreaFrom: undefined,
        yardAreaTo: undefined,
        selectedFeatures: [],
        priceFrom: undefined,
        priceTo: undefined,
        // Rent-specific fields
        selectedFurnishing: [],
        monthlyRentFrom: undefined,
        monthlyRentTo: undefined,
        rentPerSqmFrom: undefined,
        rentPerSqmTo: undefined
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
                    // Keep abbreviations like "ж.к", "ж.к.", "ул.", etc. lowercase
                    const lowerWord = word.toLowerCase();
                    if (lowerWord.startsWith('ж.к') || lowerWord.startsWith('ул.') || lowerWord.startsWith('бул.')) {
                        return lowerWord;
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');
        };

        filterValuesRef.current.searchTerm = searchTerm;
        filterValuesRef.current.city = formatCityName(city);
        filterValuesRef.current.neighborhoods = neighborhoods.map(formatNeighborhoodName);
        filterValuesRef.current.distance = distance;
        notifyFiltersChange();
    }, [externalOnLocationChange, notifyFiltersChange]);

    const handlePropertyIdChange = useCallback((value: string) => {
        setPropertyId(value);
        filterValuesRef.current.propertyId = value.trim();
        notifyFiltersChange();
    }, [notifyFiltersChange]);

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

    const handleClear = useCallback(() => {
        // Reset location state
        setLocationState({
            searchTerm: '',
            city: '',
            cityCoordinates: undefined,
            neighborhoods: [],
            distance: 0
        });
        setPropertyId('');

        // Reset all filter values
        filterValuesRef.current = {
            searchTerm: '',
            city: '',
            neighborhoods: [],
            distance: 0,
            propertyId: '',
            houseTypes: [],
            houseAreaFrom: undefined,
            houseAreaTo: undefined,
            yardAreaFrom: undefined,
            yardAreaTo: undefined,
            selectedFeatures: [],
            priceFrom: undefined,
            priceTo: undefined,
            // Reset rent-specific fields
            selectedFurnishing: [],
            monthlyRentFrom: undefined,
            monthlyRentTo: undefined,
            rentPerSqmFrom: undefined,
            rentPerSqmTo: undefined
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
                <div className={styles.idFilter}>
                    <Input
                        label="ID на имот"
                        placeholder="Въведете ID"
                        value={propertyId}
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
                        unit="евро"
                        sliderMin={RENT_SLIDER_MIN}
                        sliderMax={RENT_SLIDER_MAX}
                        from={filterValuesRef.current.monthlyRentFrom || RENT_SLIDER_MIN}
                        to={filterValuesRef.current.monthlyRentTo || RENT_SLIDER_MAX}
                        onFilterChange={handleMonthlyRentChange}
                    />

                    {/* Rent Per Sqm Filter */}
                    <RentPriceFilter
                        title="Цена за кв.м"
                        unit="евро"
                        sliderMin={RENT_PER_SQM_SLIDER_MIN}
                        sliderMax={RENT_PER_SQM_SLIDER_MAX}
                        from={filterValuesRef.current.rentPerSqmFrom || RENT_PER_SQM_SLIDER_MIN}
                        to={filterValuesRef.current.rentPerSqmTo || RENT_PER_SQM_SLIDER_MAX}
                        onFilterChange={handleRentPerSqmChange}
                    />
                </>
            ) : (
                <PriceFilter
                    key={`price-${filterKey}`}
                    onFilterChange={handlePriceChange}
                    initialPriceFrom={filterValuesRef.current.priceFrom}
                    initialPriceTo={filterValuesRef.current.priceTo}
                />
            )}
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
                initialAreaFrom={filterValuesRef.current.yardAreaFrom}
                initialAreaTo={filterValuesRef.current.yardAreaTo}
            />

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={(newSelection) => {
                    filterValuesRef.current.selectedFeatures = newSelection;
                    notifyFiltersChange();
                }}
                features={isRentMode ? RENT_HOUSE_FEATURES : HOUSE_FEATURES}
            />
        </div>
    );
}

