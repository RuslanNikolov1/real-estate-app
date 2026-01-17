'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { CrosshairSimple } from '@phosphor-icons/react';
import burgasCities from '@/data/burgasCities.json';
import { CITY_OPTIONS, getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import styles from './LocationFiltersGroup.module.scss';

interface LocationFiltersGroupProps {
    onFilterChange: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    initialCity?: string;
    initialNeighborhoods?: string[];
    initialDistance?: number;
    cityInputRef?: React.RefObject<HTMLDivElement | null>;
}

export function LocationFiltersGroup({
    onFilterChange,
    initialCity = '',
    initialNeighborhoods = [],
    initialDistance = 0,
    cityInputRef: externalCityInputRef
}: LocationFiltersGroupProps) {
    const { t } = useTranslation();
    // Check if the city is a valid selected city from the list
    const isValidCity = useCallback((cityName: string) => {
        if (!cityName) return false;
        return CITY_OPTIONS.some(
            (c) => c.toLowerCase() === cityName.toLowerCase()
        );
    }, []);

    const [city, setCity] = useState(initialCity);
    const [neighborhoods, setNeighborhoods] = useState<string[]>(initialNeighborhoods);
    const [distance, setDistance] = useState(initialDistance);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    
    // Separate state for manual neighborhood input
    const [manualNeighborhoodInput, setManualNeighborhoodInput] = useState('');
    
    // Debounce ref for manual neighborhood changes
    const neighborhoodDebounceRef = useRef<NodeJS.Timeout | null>(null);
    
    const internalCityInputRef = useRef<HTMLDivElement | null>(null);
    const cityInputRefForDropdown = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    
    // Use external ref if provided, otherwise use internal ref
    const cityInputRef = externalCityInputRef || internalCityInputRef;

    const trimmedCity = city.trim();

    // Sync internal state with initial props when they change (e.g., from URL restore or map clicks)
    // NOTE: neighborhoods is NOT in dependencies to prevent overwriting user input while typing
    useEffect(() => {
        // CRITICAL FIX: Don't clear city if user is actively typing in manual neighborhood input
        // If we have a manual input value and the city is being cleared, preserve the city
        const shouldPreserveCity = manualNeighborhoodInput.trim().length > 0 && !initialCity && city.trim().length > 0;
        
        if (shouldPreserveCity) {
            // Don't update city - preserve it
            setDistance(initialDistance);
            return; // Exit early to prevent clearing
        }
        
        setCity(initialCity);
        setDistance(initialDistance);

        // Only sync neighborhoods if city changed (not when neighborhoods change locally)
        // This prevents overwriting user input while typing
        if (initialCity !== city) {
            setNeighborhoods(initialNeighborhoods);
        }

        // Sync manual input with neighborhoods when city is manually entered
        // Only update if city changed, not when neighborhoods change
        if (initialCity !== city) {
            if (!isValidCity(initialCity) && initialNeighborhoods.length > 0) {
                setManualNeighborhoodInput(initialNeighborhoods[0]);
            } else if (isValidCity(initialCity)) {
                setManualNeighborhoodInput('');
            } else if (!initialCity && !manualNeighborhoodInput.trim()) {
                // Only clear if there's no manual input (user isn't typing)
                setManualNeighborhoodInput('');
            }
        }
    }, [initialCity, initialDistance, isValidCity, city, manualNeighborhoodInput]);

    // Sync neighborhoods when they come from external sources (map clicks, URL restore)
    // Only sync for valid cities (where NeighborhoodSelect is used, not manual input)
    useEffect(() => {
        // Only sync if:
        // 1. City is valid (we're using NeighborhoodSelect, not manual input)
        // 2. City matches initialCity (city didn't just change - that's handled above)
        // 3. Neighborhoods are actually different (avoid unnecessary updates)
        const cityMatches = initialCity === city && initialCity.trim() !== '';
        const isCityValid = isValidCity(initialCity);
        
        // Compare arrays without mutating (create sorted copies)
        const sortedCurrent = [...neighborhoods].sort();
        const sortedInitial = [...initialNeighborhoods].sort();
        const neighborhoodsDifferent = JSON.stringify(sortedCurrent) !== JSON.stringify(sortedInitial);
        
        if (cityMatches && isCityValid && neighborhoodsDifferent) {
            // Sync neighborhoods from external source (map click, URL restore, etc.)
            setNeighborhoods(initialNeighborhoods);
        }
    }, [initialNeighborhoods, initialCity, city, neighborhoods, isValidCity]);
    
    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (neighborhoodDebounceRef.current) {
                clearTimeout(neighborhoodDebounceRef.current);
            }
        };
    }, []);

    const isCitySelected = isValidCity(trimmedCity);
    // Show additional filters if there's any city value (manual input allowed)
    const showAdditionalFilters = trimmedCity.length > 0;

    // Format city name: first letter uppercase, rest lowercase for each word
    const formatCityName = useCallback((cityName: string): string => {
        if (!cityName || !cityName.trim()) return cityName;
        return cityName
            .trim()
            .split(/\s+/)
            .map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }, []);

    // Format neighborhood names: first letter uppercase, rest lowercase for each word
    // Keeps abbreviations like "ж.к", "ул.", "бул." lowercase
    const formatNeighborhoodName = useCallback((neighborhoodName: string): string => {
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
    }, []);

    const handleCitySelect = useCallback((cityName: string, coordinates: [number, number]) => {
        const formattedCity = formatCityName(cityName);
        setCity(formattedCity);
        setNeighborhoods([]);
        setDistance(0);
        setShowCityDropdown(false);
        onFilterChange('', formattedCity, [], 0);
    }, [onFilterChange, formatCityName]);

    const handleNeighborhoodSelectChange = useCallback(
        (value: string | string[]) => {
            const next = Array.isArray(value) ? value : value ? [value] : [];
            setNeighborhoods(next);
            onFilterChange('', city, next, distance);
        },
        [city, distance, onFilterChange],
    );

    const handleRemoveNeighborhood = useCallback(
        (neighborhoodName: string) => {
            const updated = neighborhoods.filter((n) => n !== neighborhoodName);
            setNeighborhoods(updated);
            onFilterChange('', city, updated, distance);
        },
        [neighborhoods, city, distance, onFilterChange],
    );

    // Handle neighborhood changes when city changes
    // Allow manual neighborhoods for manually entered cities
    useEffect(() => {
        if (!trimmedCity) {
            // If city is cleared, clear neighborhoods and distance
            if (neighborhoods.length > 0) {
                setNeighborhoods([]);
                setManualNeighborhoodInput('');
                onFilterChange('', city, [], 0);
            }
            if (distance !== 0) {
                setDistance(0);
            }
            return;
        }

        // If city is in the list, validate neighborhoods against available options
        if (isCitySelected) {
            const validNeighborhoods = neighborhoods.filter((n) =>
                getNeighborhoodsByCity(city).includes(n),
            );
            if (validNeighborhoods.length !== neighborhoods.length) {
                setNeighborhoods(validNeighborhoods);
                onFilterChange('', city, validNeighborhoods, distance);
            }
            // Clear manual input when switching to a city from the list
            if (manualNeighborhoodInput) {
                setManualNeighborhoodInput('');
            }
        }
        // If city is not in the list, allow manual neighborhoods (no validation needed)
    }, [isCitySelected, neighborhoods, city, distance, onFilterChange, trimmedCity, manualNeighborhoodInput]);

    // Reset distance when showAdditionalFilters becomes false
    useEffect(() => {
        if (!showAdditionalFilters && distance !== 0) {
            setDistance(0);
            onFilterChange('', city, neighborhoods, 0);
        }
    }, [showAdditionalFilters, distance, city, neighborhoods, onFilterChange]);

    const handleDistanceChange = useCallback((value: number) => {
        setDistance(value);
        onFilterChange('', city, neighborhoods, value);
    }, [city, neighborhoods, onFilterChange]);

    // Helper function to calculate distance between two coordinates (Haversine formula)
    const calculateDistanceKm = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }, []);

    // Find the closest city from the user's coordinates
    const findClosestCity = useCallback((lat: number, lng: number): { name: string; coordinates: [number, number] } | null => {
        let closestCity: { name: string; coordinates: [number, number] } | null = null;
        let shortestDistance = Infinity;

        // Only check cities that are in CITY_OPTIONS
        burgasCities.cities.forEach((c) => {
            // Only consider cities that are in our CITY_OPTIONS list
            if (!CITY_OPTIONS.includes(c.name)) return;
            
            const [cityLat, cityLng] = c.coordinates;
            if (typeof cityLat === 'number' && typeof cityLng === 'number') {
                const distance = calculateDistanceKm(lat, lng, cityLat, cityLng);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestCity = {
                        name: c.name,
                        coordinates: [cityLat, cityLng]
                    };
                }
            }
        });

        return closestCity;
    }, [calculateDistanceKm]);

    const handleDetectLocation = useCallback(() => {
        setIsDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const closestCity = findClosestCity(latitude, longitude);
                    if (closestCity) {
                        handleCitySelect(closestCity.name, closestCity.coordinates);
                    } else {
                        console.warn('Could not find closest city for coordinates:', latitude, longitude);
                    }
                    setIsDetectingLocation(false);
                },
                (error) => {
                    // Extract meaningful error information from GeolocationPositionError
                    const errorInfo = {
                        code: error.code,
                        message: error.message,
                        codeName: 
                            error.code === 1 ? 'PERMISSION_DENIED' :
                            error.code === 2 ? 'POSITION_UNAVAILABLE' :
                            error.code === 3 ? 'TIMEOUT' :
                            'UNKNOWN'
                    };
                    console.error('Error getting location:', errorInfo);
                    setIsDetectingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            console.warn('Geolocation is not supported by this browser.');
            setIsDetectingLocation(false);
        }
    }, [findClosestCity, handleCitySelect]);

    return (
        <div className={styles.inputsGrid}>
            <div className={styles.cityInputWrapper} ref={cityInputRef}>
                <div className={styles.cityInputRow}>
                    <div className={styles.autocompleteWrapper}>
                        <Input
                            id="filters-city"
                            label={t('filters.common.cityLabel')}
                            placeholder={t('filters.common.cityPlaceholder')}
                            value={city}
                            onChange={(event) => {
                                const value = event.target.value;
                                setCity(value);
                                // Show dropdown only when there is some input
                                if (value.trim().length > 0) {
                                    setShowCityDropdown(true);
                                } else {
                                    setShowCityDropdown(false);
                                }
                                onFilterChange('', value, neighborhoods, distance);
                            }}
                            onFocus={() => {
                                // Show dropdown if there are matching options
                                if (city.trim().length > 0 || CITY_OPTIONS.length > 0) {
                                    setShowCityDropdown(true);
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding dropdown to allow click on dropdown item
                                setTimeout(() => {
                                    if (!cityDropdownRef.current?.contains(document.activeElement)) {
                                        setShowCityDropdown(false);
                                        // Format city name on blur if manually entered
                                        if (city.trim() && !isCitySelected) {
                                            const formatted = formatCityName(city);
                                            setCity(formatted);
                                            onFilterChange('', formatted, neighborhoods, distance);
                                        }
                                    }
                                }, 200);
                            }}
                            ref={cityInputRefForDropdown}
                            className={styles.filterInput}
                        />
                        {showCityDropdown && CITY_OPTIONS.length > 0 && (
                            <div
                                ref={cityDropdownRef}
                                className={styles.cityDropdown}
                            >
                                {CITY_OPTIONS
                                    .filter((cityName) => {
                                        const searchTerm = city.toLowerCase().trim();
                                        if (!searchTerm) return true;
                                        return cityName.toLowerCase().includes(searchTerm);
                                    })
                                    .map((cityName) => {
                                        // Find coordinates from burgasCities for map/distance calculations
                                        const cityData = burgasCities.cities.find(
                                            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                                                c.nameEn.toLowerCase() === cityName.toLowerCase()
                                        );
                                        const coordinates: [number, number] = cityData && cityData.coordinates && cityData.coordinates.length === 2
                                            ? [cityData.coordinates[0], cityData.coordinates[1]]
                                            : [0, 0]; // Fallback if coordinates not found
                                        
                                        return (
                                            <button
                                                key={cityName}
                                                type="button"
                                                className={styles.cityDropdownItem}
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // Prevent input blur
                                                }}
                                                onClick={() => {
                                                    handleCitySelect(cityName, coordinates);
                                                }}
                                            >
                                                {cityName}
                                            </button>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className={styles.cityLocateButton}
                        onClick={handleDetectLocation}
                        disabled={isDetectingLocation}
                        aria-label="Detect current city"
                    >
                        <CrosshairSimple size={18} weight="bold" />
                    </button>
                </div>
                {/* Neighborhood field: shown only after a city is entered */}
                {trimmedCity && (
                    <div className={styles.neighborhoodFilter}>
                        {isCitySelected ? (
                            // City is in the list - show dropdown with available neighborhoods + chips
                            <>
                                <NeighborhoodSelect
                                    city={city}
                                    value={neighborhoods}
                                    onChange={handleNeighborhoodSelectChange}
                                    multiple
                                    disabled={!isCitySelected}
                                    label={t('filters.common.neighborhoodsLabel')}
                                />
                                {neighborhoods.length > 0 && (
                                    <>
                                        <div className={styles.selectedNeighborhoods}>
                                            {neighborhoods.map((neighborhoodName) => (
                                                <span
                                                    key={neighborhoodName}
                                                    className={styles.neighborhoodChip}
                                                >
                                                    {neighborhoodName}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNeighborhood(neighborhoodName)}
                                                        className={styles.neighborhoodChipRemove}
                                                        aria-label={`Remove ${neighborhoodName}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <p className={styles.neighborhoodHint}>
                                            {t('filters.common.neighborhoodsSelected', { count: neighborhoods.length })}
                                        </p>
                                    </>
                                )}
                            </>
                        ) : (
                            // City is manually entered - show lightweight text input that stores directly in state
                            <>
                                <div className={styles.manualNeighborhoodInputWrapper}>
                                    <label htmlFor="filters-neighborhood-manual" className={styles.manualNeighborhoodLabel}>
                                        {t('filters.common.neighborhoodLabel')}
                                    </label>
                                    <input
                                        id="filters-neighborhood-manual"
                                        type="text"
                                        placeholder={t('filters.common.neighborhoodPlaceholder')}
                                        value={manualNeighborhoodInput}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setManualNeighborhoodInput(value);
                                            
                                            // Update local neighborhoods state immediately for responsive UI
                                            const trimmedValue = value.trim();
                                            const newNeighborhoods = trimmedValue ? [trimmedValue] : [];
                                            setNeighborhoods(newNeighborhoods);
                                            
                                            // Debounce the parent callback to prevent excessive re-renders
                                            if (neighborhoodDebounceRef.current) {
                                                clearTimeout(neighborhoodDebounceRef.current);
                                            }
                                            
                                            // Capture current values at the time of typing to avoid stale closures
                                            const capturedCity = city;
                                            const capturedDistance = distance;
                                            
                                            neighborhoodDebounceRef.current = setTimeout(() => {
                                                // Use captured values to prevent stale closure issues
                                                // Only call parent if city is still valid (not cleared)
                                                if (capturedCity && capturedCity.trim()) {
                                                    onFilterChange('', capturedCity, newNeighborhoods, capturedDistance);
                                                }
                                            }, 300);
                                        }}
                                        onBlur={() => {
                                            // Format neighborhood name on blur
                                            if (manualNeighborhoodInput.trim()) {
                                                const formatted = formatNeighborhoodName(manualNeighborhoodInput);
                                                setManualNeighborhoodInput(formatted);
                                                const newNeighborhoods = formatted ? [formatted] : [];
                                                setNeighborhoods(newNeighborhoods);
                                                onFilterChange('', city, newNeighborhoods, distance);
                                            }
                                        }}
                                        className={styles.manualNeighborhoodInputField}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
                {showAdditionalFilters && (
                    <div className={styles.distanceFilter}>
                        <span className={styles.distanceHint}>
                            {t('filters.common.distanceHint')}
                        </span>
                        <label htmlFor="distance-slider" className={styles.distanceLabel}>
                            {t('filters.common.distanceLabel', { distance })}
                        </label>
                        <div className={styles.distanceControls}>
                            <input
                                type="range"
                                id="distance-slider"
                                min="0"
                                max="50"
                                step="1"
                                value={distance}
                                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                                className={styles.distanceSlider}
                                style={{
                                    '--slider-value': `${(distance / 50) * 100}%`
                                } as React.CSSProperties}
                            />
                            <input
                                type="number"
                                id="distance-input"
                                min="0"
                                max="50"
                                value={distance}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val >= 0 && val <= 50) {
                                        handleDistanceChange(val);
                                    }
                                }}
                                className={styles.distanceInput}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

