'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { PiggyBank } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import priceFilterStyles from '../filters/PriceFilter.module.scss';

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
    isRentMode?: boolean;
}

export interface HotelsMotelsFiltersState {
    searchTerm: string;
    propertyId?: string;
    city: string;
    neighborhoods: string[];
    distance: number;
    propertyTypes: string[];
    areaFrom?: number;
    areaTo?: number;
    isAreaNotProvided: boolean;
    selectedCategories: string[];
    bedBaseFrom?: number;
    bedBaseTo?: number;
    isBedBaseNotProvided: boolean;
    selectedPresetId: string | null;
    selectedCompletionStatuses?: string[];
    selectedConstructionTypes: string[];
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
    selectedWorkingOptions?: string[];
}

export function HotelsMotelsFiltersPage({
    locationState: externalLocationState,
    onLocationChange: externalOnLocationChange,
    onFiltersChange,
    onActionButtonsReady,
    onSearch,
    isRentMode = false
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
    const [propertyId, setPropertyId] = useState('');

    const locationState = externalLocationState || internalLocationState;
    const setLocationState = externalOnLocationChange
        ? (state: typeof internalLocationState) => {
            externalOnLocationChange(state.searchTerm, state.city, state.neighborhoods, state.distance);
        }
        : setInternalLocationState;

    // Working options for rent mode
    const WORKING_OPTIONS = [
        { id: 'all', label: 'Всички' },
        { id: 'seasonal', label: 'Работи сезонно' },
        { id: 'year-round', label: 'Работи целогодишно' }
    ];

    // Rent price constants
    const RENT_SLIDER_MAX = 42000;
    const RENT_SLIDER_MIN = 600;
    const RENT_PER_SQM_SLIDER_MAX = 20;
    const RENT_PER_SQM_SLIDER_MIN = 0;

    // Store current filter values - all hotels/motels filter state managed here
    // Use undefined for numeric filters so they're not sent unless user explicitly sets them
    const filterValuesRef = useRef<Partial<HotelsMotelsFiltersState>>({
        searchTerm: '',
        propertyId: '',
        city: '',
        neighborhoods: [],
        distance: 0,
        propertyTypes: [],
        areaFrom: undefined,
        areaTo: undefined,
        isAreaNotProvided: false,
        selectedCategories: [],
        bedBaseFrom: undefined,
        bedBaseTo: undefined,
        isBedBaseNotProvided: false,
        selectedPresetId: null,
        selectedCompletionStatuses: [],
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
        rentPerSqmTo: undefined,
        selectedWorkingOptions: []
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

    // Rent-specific handlers
    const handleWorkingOptionsChange = useCallback((selectedOptions: string[]) => {
        filterValuesRef.current.selectedWorkingOptions = selectedOptions;
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
            propertyTypes: [],
            areaFrom: undefined,
            areaTo: undefined,
            isAreaNotProvided: false,
            selectedCategories: [],
            bedBaseFrom: undefined,
            bedBaseTo: undefined,
            isBedBaseNotProvided: false,
            selectedPresetId: null,
            selectedCompletionStatuses: [],
            selectedConstructionTypes: [],
            selectedFeatures: [],
            priceFrom: undefined,
            priceTo: undefined,
            pricePerSqmFrom: undefined,
            pricePerSqmTo: HOTELS_PRICE_PER_SQM_SLIDER_MAX,
            // Reset rent-specific fields
            monthlyRentFrom: RENT_SLIDER_MIN,
            monthlyRentTo: RENT_SLIDER_MAX,
            rentPerSqmFrom: RENT_PER_SQM_SLIDER_MIN,
            rentPerSqmTo: RENT_PER_SQM_SLIDER_MAX,
            selectedWorkingOptions: []
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



            {/* Property Type Filter (Вид) */}
            <SubtypeFilter
                key={`property-type-${filterKey}`}
                title="Вид"
                options={HOTELS_PROPERTY_TYPES}
                onFilterChange={handlePropertyTypeChange}
                initialSelected={filterValuesRef.current.propertyTypes || []}
            />
            {/* Price/Rent Filters - Conditional based on mode */}
            {isRentMode ? (
                <>
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
                    key={`price-${filterKey}`}
                    onFilterChange={handlePriceChange}
                    initialPriceFrom={filterValuesRef.current.priceFrom}
                    initialPriceTo={filterValuesRef.current.priceTo}
                    initialPricePerSqmFrom={filterValuesRef.current.pricePerSqmFrom}
                    initialPricePerSqmTo={filterValuesRef.current.pricePerSqmTo}
                    priceSliderMax={HOTELS_PRICE_SLIDER_MAX}
                    pricePerSqmSliderMax={HOTELS_PRICE_PER_SQM_SLIDER_MAX}
                />
            )}
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

            <div className={styles.leftFilters}>
                {/* Category Filter (Категория) */}
                <HotelCategoryFilter
                    key={`category-${filterKey}`}
                    onFilterChange={handleCategoryChange}
                    initialSelected={filterValuesRef.current.selectedCategories}
                />
            </div>

            {/* Bed Base Filter (Леглова база) */}
            <BedBaseFilter
                key={`bed-base-${filterKey}`}
                onFilterChange={handleBedBaseChange}
                initialBedBaseFrom={filterValuesRef.current.bedBaseFrom}
                initialBedBaseTo={filterValuesRef.current.bedBaseTo}
                initialIsNotProvided={filterValuesRef.current.isBedBaseNotProvided}
            />

            {/* Completion Status Filter (Степен на завършеност) - Only for sale mode */}
            {!isRentMode && (
                <CompletionStatusFilter
                    key={`completion-${filterKey}`}
                    onFilterChange={handleCompletionStatusChange}
                    initialSelected={filterValuesRef.current.selectedCompletionStatuses}
                />
            )}

            {/* Working Options Filter (Работи) - Only for rent mode */}
            {isRentMode && (
                <SubtypeFilter
                    key={`working-${filterKey}`}
                    title="Работи"
                    options={WORKING_OPTIONS}
                    onFilterChange={handleWorkingOptionsChange}
                    initialSelected={filterValuesRef.current.selectedWorkingOptions || []}
                    leftOrder={['seasonal']}
                    rightOrder={['year-round']}
                />
            )}

            <div className={styles.leftFilters}>
                {/* Construction Type Filter (Тип строителство) */}
                <HotelConstructionTypeFilter
                    key={`construction-${filterKey}`}
                    onFilterChange={handleConstructionTypeChange}
                    initialSelected={filterValuesRef.current.selectedConstructionTypes}
                />
            </div>

            {/* Features Filter (Особености) */}
            <FeaturesFilter
                key={`features-${filterKey}`}
                initialSelected={filterValuesRef.current.selectedFeatures || []}
                onFilterChange={handleFeaturesChange}
                features={HOTELS_FEATURES}
            />
        </div>
    );
}

