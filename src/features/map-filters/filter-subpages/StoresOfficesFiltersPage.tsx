'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiggyBank } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationFiltersGroup } from '../LocationFiltersGroup';
import { translateFilterOptions } from '@/lib/filter-translations';
import {
    SubtypeFilter,
    AreaFilter,
    PriceFilter,
    FeaturesFilter,
    FloorFilter,
    ConstructionTypeFilter,
    CompletionStatusFilter,
    BuildingTypeFilter,
    YearFilter,
    COMMERCIAL_PROPERTY_TYPES,
    COMMERCIAL_FEATURES,
    COMMERCIAL_FLOOR_OPTIONS,
    RENT_COMMERCIAL_FEATURES,
    RENT_COMMERCIAL_FLOOR_OPTIONS
} from '../filters';
import {
    COMMERCIAL_AREA_SLIDER_MAX,
    COMMERCIAL_PRICE_SLIDER_MAX,
    COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX,
    FLOOR_SLIDER_MIN,
    FLOOR_SLIDER_MAX
} from '../filters/types';
import styles from '../MapFiltersPage.module.scss';
import priceFilterStyles from '../filters/PriceFilter.module.scss';

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
    isRentMode?: boolean;
}

export interface CommercialFiltersState {
    searchTerm: string;
    propertyId?: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom?: number;
    areaTo?: number;
    priceFrom?: number;
    priceTo?: number;
    pricePerSqmFrom?: number;
    pricePerSqmTo?: number;
    selectedFeatures: string[];
    selectedFloorOptions: string[];
    floorFrom?: number;
    floorTo?: number;
    isFloorNotProvided: boolean;
    selectedConstructionTypes?: string[];
    selectedCompletionStatuses?: string[];
    selectedBuildingTypes: string[];
    yearFrom?: number;
    yearTo?: number;
    isYearNotProvided?: boolean;
    // Rent-specific fields
    monthlyRentFrom?: number;
    monthlyRentTo?: number;
    rentPerSqmFrom?: number;
    rentPerSqmTo?: number;
}

export function StoresOfficesFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    isRentMode = false
}: StoresOfficesFiltersPageProps) {
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
    const [propertyId, setPropertyId] = useState('');

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

    // Store current filter values - all commercial filter state managed here
    // Use undefined for numeric filters so they're not sent unless user explicitly sets them
    const filterValuesRef = useRef<Partial<CommercialFiltersState>>({
        searchTerm: '',
        propertyId: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        propertyTypes: [],
        areaFrom: undefined,
        areaTo: undefined,
        priceFrom: undefined,
        priceTo: undefined,
        pricePerSqmFrom: undefined,
        pricePerSqmTo: undefined,
        selectedFeatures: [],
        selectedFloorOptions: [],
        floorFrom: undefined,
        floorTo: undefined,
        isFloorNotProvided: false,
        selectedConstructionTypes: [],
        selectedCompletionStatuses: [],
        selectedBuildingTypes: [],
        yearFrom: undefined,
        yearTo: undefined,
        isYearNotProvided: false,
        // Rent-specific fields
        monthlyRentFrom: undefined,
        monthlyRentTo: undefined,
        rentPerSqmFrom: undefined,
        rentPerSqmTo: undefined
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
                    // Keep abbreviations like "ж.к", "ж.к.", "ул.", "кв.", etc. lowercase
                    const lowerWord = word.toLowerCase();
                    if (lowerWord.startsWith('ж.к') || lowerWord.startsWith('ул.') || lowerWord.startsWith('бул.') || lowerWord.startsWith('кв.') || lowerWord.endsWith('кв.')) {
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

    const handleYearChange = useCallback((yearFrom: number, yearTo: number, isNotProvided: boolean) => {
        filterValuesRef.current.yearFrom = yearFrom;
        filterValuesRef.current.yearTo = yearTo;
        filterValuesRef.current.isYearNotProvided = isNotProvided;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    const handleBuildingTypeChange = useCallback((selectedTypes: string[]) => {
        filterValuesRef.current.selectedBuildingTypes = selectedTypes;
        notifyFiltersChange();
    }, [notifyFiltersChange]);

    // Rent-specific handlers
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
            propertyId: '',
            city: '',
            neighborhoods: [],
            distance: 0,
            propertyTypes: [],
            areaFrom: undefined,
            areaTo: undefined,
            priceFrom: undefined,
            priceTo: undefined,
            pricePerSqmFrom: undefined,
            pricePerSqmTo: undefined,
            selectedFeatures: [],
            selectedFloorOptions: [],
            floorFrom: undefined,
            floorTo: undefined,
            isFloorNotProvided: false,
            selectedConstructionTypes: [],
            selectedCompletionStatuses: [],
            selectedBuildingTypes: [],
            yearFrom: undefined,
            yearTo: undefined,
            isYearNotProvided: false,
            // Reset rent-specific fields
            monthlyRentFrom: RENT_SLIDER_MIN,
            monthlyRentTo: RENT_SLIDER_MAX,
            rentPerSqmFrom: RENT_PER_SQM_SLIDER_MIN,
            rentPerSqmTo: RENT_PER_SQM_SLIDER_MAX
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
                        {t('filters.common.clearFilters')}
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



            {/* Property Type Filter (Подходящ за) */}
            <SubtypeFilter
                key={`property-type-${filterKey}`}
                title={t('filters.titles.suitableFor')}
                options={translateFilterOptions(COMMERCIAL_PROPERTY_TYPES, t, 'filters.commercialTypes')}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filterValuesRef.current.propertyTypes || []}
                leftOrder={['store', 'cabinet', 'sport']}
                rightOrder={['office', 'beauty-salon', 'other']}
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
                        from={filterValuesRef.current.monthlyRentFrom || RENT_SLIDER_MIN}
                        to={filterValuesRef.current.monthlyRentTo || RENT_SLIDER_MAX}
                        onFilterChange={handleMonthlyRentChange}
                    />

                    {/* Rent Per Sqm Filter */}
                    <RentPriceFilter
                        title={t('filters.titles.rentPerSqm')}
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
                    initialPricePerSqmFrom={filterValuesRef.current.pricePerSqmFrom}
                    initialPricePerSqmTo={filterValuesRef.current.pricePerSqmTo}
                    priceSliderMax={COMMERCIAL_PRICE_SLIDER_MAX}
                    pricePerSqmSliderMax={COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX}
                />
            )}
            {/* Area Filter (Квадратура) */}
            <AreaFilter
                key={`area-${filterKey}`}
                onFilterChange={handleAreaChange}
                initialAreaFrom={filterValuesRef.current.areaFrom}
                initialAreaTo={filterValuesRef.current.areaTo}
                sliderMax={COMMERCIAL_AREA_SLIDER_MAX}
                areaCap={COMMERCIAL_AREA_SLIDER_MAX}
                title={t('filters.titles.area')}
            />

            {/* Floor Filter (Етаж) */}
            <FloorFilter
                key={`floor-${filterKey}`}
                onFilterChange={handleFloorChange}
                initialFloorFrom={filterValuesRef.current.floorFrom}
                initialFloorTo={filterValuesRef.current.floorTo}
                initialSpecialOptions={filterValuesRef.current.selectedFloorOptions}
                initialIsNotProvided={filterValuesRef.current.isFloorNotProvided}
                floorOptions={isRentMode ? RENT_COMMERCIAL_FLOOR_OPTIONS : COMMERCIAL_FLOOR_OPTIONS}
            />

            {/* Construction Type Filter (Тип строителство) - Only for sale mode */}
            {!isRentMode && (
                <div className={styles.leftFilters}>
                    <ConstructionTypeFilter
                        key={`construction-${filterKey}`}
                        onFilterChange={handleConstructionTypeChange}
                        initialSelected={filterValuesRef.current.selectedConstructionTypes}
                    />
                </div>
            )}
            {/* Year Filter (Година на строителство) - Only for sale mode */}
            {!isRentMode && (
                <YearFilter
                    key={`year-${filterKey}`}
                    onFilterChange={handleYearChange}
                    initialYearFrom={filterValuesRef.current.yearFrom}
                    initialYearTo={filterValuesRef.current.yearTo}
                    initialIsNotProvided={filterValuesRef.current.isYearNotProvided}
                />
            )}
            {/* Completion Status Filter (Степен на завършеност) - Only for sale mode */}
            {!isRentMode && (
                <CompletionStatusFilter
                    key={`completion-${filterKey}`}
                    onFilterChange={handleCompletionStatusChange}
                    initialSelected={filterValuesRef.current.selectedCompletionStatuses}
                />
            )}
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
                features={translateFilterOptions(isRentMode ? RENT_COMMERCIAL_FEATURES : COMMERCIAL_FEATURES, t, 'filters.commercialFeatures')}
            />
        </div>
    );
}


