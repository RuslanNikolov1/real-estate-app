'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translateFilterOptions } from '@/lib/filter-translations';
import { PiggyBank } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    GarageConstructionTypeFilter,
    GARAGES_PROPERTY_TYPES,
    GARAGES_FEATURES
} from '../filters';
import { RENT_GARAGE_FEATURES } from '../filters/constants';
import {
    GARAGES_AREA_SLIDER_MAX,
    GARAGES_PRICE_SLIDER_MAX,
    GARAGES_PRICE_PER_SQM_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';
import { useFilterState } from '../hooks/useFilterState';
import priceFilterStyles from '../filters/PriceFilter.module.scss';

interface GaragesParkingFiltersPageProps {
    locationState?: {
        searchTerm: string;
        city: string;
        cityCoordinates?: [number, number];
        neighborhoods: string[];
        distance: number;
    };
    onLocationChange?: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    onFiltersChange?: (filters: GaragesParkingFiltersState) => void;
    onRightColumnFiltersReady?: (filters: React.ReactNode) => void;
    onActionButtonsReady?: (buttons: React.ReactNode) => void;
    onSearch?: () => void;
    initialFilters?: Partial<GaragesParkingFiltersState>;
    isRentMode?: boolean;
}

export interface GaragesParkingFiltersState {
    searchTerm: string;
    propertyId?: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom?: number;
    areaTo?: number;
    selectedConstructionTypes?: string[];
    selectedFeatures: string[];
    priceFrom?: number;
    priceTo?: number;
    pricePerSqmFrom?: number;
    pricePerSqmTo?: number;
    // Rent-specific fields
    monthlyRentFrom?: number;
    monthlyRentTo?: number;
    rentPerSqmFrom?: number;
    rentPerSqmTo?: number;
}

const createInitialGaragesFilters = (): GaragesParkingFiltersState => ({
    searchTerm: '',
    propertyId: '',
    city: '',
    neighborhoods: [],
    distance: 0,
    propertyTypes: [],
    areaFrom: undefined,
    areaTo: undefined,
    selectedConstructionTypes: [],
    selectedFeatures: [],
    priceFrom: undefined,
    priceTo: undefined,
    pricePerSqmFrom: undefined,
    pricePerSqmTo: undefined,
    // Rent-specific fields
    monthlyRentFrom: undefined,
    monthlyRentTo: undefined,
    rentPerSqmFrom: undefined,
    rentPerSqmTo: undefined
});

export function GaragesParkingFiltersPage({ 
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    initialFilters,
    isRentMode = false
}: GaragesParkingFiltersPageProps) {
    const { t } = useTranslation();
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

    // Rent price constants
    const RENT_SLIDER_MAX = 20000;
    const RENT_SLIDER_MIN = 0;
    const RENT_PER_SQM_SLIDER_MAX = 32;
    const RENT_PER_SQM_SLIDER_MIN = 0;
    
const { filters, updateFilters, resetFilters } = useFilterState<GaragesParkingFiltersState>(
    createInitialGaragesFilters,
    onFiltersChange,
    initialFilters
);

    // Use keys to reset components on clear
    const [filterKey, setFilterKey] = useState(0);

    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange(filters);
        }
    }, [filters, onFiltersChange]);

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

        updateFilters({
            searchTerm,
            city: formatCityName(city),
            neighborhoods: neighborhoods.map(formatNeighborhoodName),
            distance
        });
    }, [externalOnLocationChange, updateFilters]);

    const handlePropertyIdChange = useCallback((value: string) => {
        updateFilters({ propertyId: value });
    }, [updateFilters]);

    const handlePropertyTypeChange = useCallback((selectedTypes: string[]) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GaragesParkingFiltersPage.tsx:207',message:'Property type filter changed',data:{selectedTypes,selectedTypesLength:selectedTypes.length,isRentMode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        updateFilters({ propertyTypes: selectedTypes });
    }, [updateFilters, isRentMode]);

    const handleAreaChange = useCallback((areaFrom: number, areaTo: number, isNotProvided?: boolean) => {
        updateFilters({ areaFrom, areaTo });
    }, [updateFilters]);

    const handleConstructionTypeChange = useCallback((selectedTypes: string[]) => {
        updateFilters({ selectedConstructionTypes: selectedTypes });
    }, [updateFilters]);

    const handlePriceChange = useCallback((priceFrom: number, priceTo: number, pricePerSqmFrom: number, pricePerSqmTo: number) => {
        updateFilters({ priceFrom, priceTo, pricePerSqmFrom, pricePerSqmTo });
    }, [updateFilters]);

    const handleFeaturesChange = useCallback((selectedFeatures: string[]) => {
        updateFilters({ selectedFeatures });
    }, [updateFilters]);

    // Rent-specific handlers
    const handleMonthlyRentChange = useCallback((rentFrom: number, rentTo: number) => {
        updateFilters({ monthlyRentFrom: rentFrom, monthlyRentTo: rentTo });
    }, [updateFilters]);

    const handleRentPerSqmChange = useCallback((rentPerSqmFrom: number, rentPerSqmTo: number) => {
        updateFilters({ rentPerSqmFrom, rentPerSqmTo });
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
                        {t('filters.common.clearFilters')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (onSearch) {
                                onSearch();
                            }
                        }}
                        className={styles.searchButton}
                    >
                        {t('filters.common.search')}
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
        const { t } = useTranslation();
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
                                    {t('filters.common.from')}
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
                                    {t('filters.common.to')}
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
                        label={t('filters.common.propertyId')}
                        placeholder={t('filters.common.propertyIdPlaceholder')}
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
                title={t('filters.titles.propertyType')}
                options={translateFilterOptions(GARAGES_PROPERTY_TYPES, t, 'filters.garageTypes')}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filters.propertyTypes || []}
            />

            {/* Price/Rent Filters - Conditional based on mode */}
            {isRentMode ? (
                <>
                    {/* Monthly Rent Filter */}
                    <RentPriceFilter
                        title={t('filters.titles.monthlyRent')}
                        unit="евро"
                        sliderMin={RENT_SLIDER_MIN}
                        sliderMax={RENT_SLIDER_MAX}
                        from={filters.monthlyRentFrom || RENT_SLIDER_MIN}
                        to={filters.monthlyRentTo || RENT_SLIDER_MAX}
                        onFilterChange={handleMonthlyRentChange}
                    />

                    {/* Rent Per Sqm Filter */}
                    <RentPriceFilter
                        title={t('filters.titles.rentPerSqm')}
                        unit="евро"
                        sliderMin={RENT_PER_SQM_SLIDER_MIN}
                        sliderMax={RENT_PER_SQM_SLIDER_MAX}
                        from={filters.rentPerSqmFrom || RENT_PER_SQM_SLIDER_MIN}
                        to={filters.rentPerSqmTo || RENT_PER_SQM_SLIDER_MAX}
                        onFilterChange={handleRentPerSqmChange}
                    />
                </>
            ) : (
                <PriceFilter
                    key={`price-${filterKey}`}
                    onFilterChange={handlePriceChange}
                    initialPriceFrom={filters.priceFrom}
                    initialPriceTo={filters.priceTo}
                    initialPricePerSqmFrom={filters.pricePerSqmFrom}
                    initialPricePerSqmTo={filters.pricePerSqmTo}
                    priceSliderMax={GARAGES_PRICE_SLIDER_MAX}
                    pricePerSqmSliderMax={GARAGES_PRICE_PER_SQM_SLIDER_MAX}
                />
            )}
            {/* Area Filter (Квадратура) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filters.areaFrom}
                initialAreaTo={filters.areaTo}
                sliderMax={GARAGES_AREA_SLIDER_MAX}
                areaCap={GARAGES_AREA_SLIDER_MAX}
                title={t('filters.titles.area')}
            />

            {/* Construction Type Filter (Вид конструкция) - Only for sale mode */}
            {!isRentMode && (
                <div className={styles.leftFilters}>
                    <GarageConstructionTypeFilter
                        key={`construction-${filterKey}`}
                        onFilterChange={handleConstructionTypeChange}
                        initialSelected={filters.selectedConstructionTypes}
                    />
                </div>
            )}

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filters.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={translateFilterOptions(isRentMode ? RENT_GARAGE_FEATURES : GARAGES_FEATURES, t, 'filters.garageFeatures')}
            />
        </div>
    );
}


