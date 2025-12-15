'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { CrosshairSimple } from '@phosphor-icons/react';
import burgasCities from '@/data/burgasCities.json';
import { CITY_OPTIONS, getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import styles from './LocationFiltersGroup.module.scss';

interface LocationFiltersGroupProps {
    onFilterChange: (searchTerm: string, city: string, neighborhoods: string[], distance: number) => void;
    initialSearchTerm?: string;
    initialCity?: string;
    initialNeighborhoods?: string[];
    initialDistance?: number;
    cityInputRef?: React.RefObject<HTMLDivElement | null>;
}

export function LocationFiltersGroup({
    onFilterChange,
    initialSearchTerm = '',
    initialCity = '',
    initialNeighborhoods = [],
    initialDistance = 0,
    cityInputRef: externalCityInputRef
}: LocationFiltersGroupProps) {
    // Check if the city is a valid selected city from the list
    const isValidCity = useCallback((cityName: string) => {
        if (!cityName) return false;
        return CITY_OPTIONS.some(
            (c) => c.toLowerCase() === cityName.toLowerCase()
        );
    }, []);

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [city, setCity] = useState(initialCity);
    const [neighborhoods, setNeighborhoods] = useState<string[]>(initialNeighborhoods);
    const [distance, setDistance] = useState(initialDistance);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    
    // Separate state for manual neighborhood input to prevent disappearing while typing
    const [manualNeighborhoodInput, setManualNeighborhoodInput] = useState(() => {
        const isInitialCityValid = initialCity && CITY_OPTIONS.some(
            (c) => c.toLowerCase() === initialCity.toLowerCase()
        );
        return initialNeighborhoods.length > 0 && !isInitialCityValid ? initialNeighborhoods[0] : '';
    });
    // Track when user is actively editing the manual neighborhood field
    const [isEditingManualNeighborhood, setIsEditingManualNeighborhood] = useState(false);
    
    const internalCityInputRef = useRef<HTMLDivElement | null>(null);
    const cityInputRefForDropdown = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    
    // Use external ref if provided, otherwise use internal ref
    const cityInputRef = externalCityInputRef || internalCityInputRef;

    const trimmedCity = city.trim();

    // Sync internal state with initial props when they change (e.g., from URL restore or map clicks)
    // but avoid overriding the manual neighborhood while the user is actively typing in it
    useEffect(() => {
        setSearchTerm(initialSearchTerm);
        setCity(initialCity);
        setNeighborhoods(initialNeighborhoods);
        setDistance(initialDistance);

        if (!isEditingManualNeighborhood) {
            // Update manual neighborhood input only if city is not in the list
            if (initialNeighborhoods.length > 0 && !isValidCity(initialCity)) {
                setManualNeighborhoodInput(initialNeighborhoods[0]);
            } else if (!initialCity || !isValidCity(initialCity)) {
                setManualNeighborhoodInput('');
            }
        }
    }, [initialSearchTerm, initialCity, initialNeighborhoods, initialDistance, isValidCity, isEditingManualNeighborhood]);

    const isCitySelected = isValidCity(trimmedCity);
    // Show additional filters if there's any city value (manual input allowed)
    const showAdditionalFilters = trimmedCity.length > 0;

    const handleCitySelect = useCallback((cityName: string, coordinates: [number, number]) => {
        setCity(cityName);
        setNeighborhoods([]);
        setDistance(0);
        setShowCityDropdown(false);
        onFilterChange(searchTerm, cityName, [], 0);
    }, [searchTerm, onFilterChange]);

    const handleNeighborhoodSelectChange = useCallback(
        (value: string | string[]) => {
            const next = Array.isArray(value) ? value : value ? [value] : [];
            setNeighborhoods(next);
            onFilterChange(searchTerm, city, next, distance);
        },
        [searchTerm, city, distance, onFilterChange],
    );

    const handleRemoveNeighborhood = useCallback(
        (neighborhoodName: string) => {
            const updated = neighborhoods.filter((n) => n !== neighborhoodName);
            setNeighborhoods(updated);
            onFilterChange(searchTerm, city, updated, distance);
        },
        [neighborhoods, searchTerm, city, distance, onFilterChange],
    );

    // Handle neighborhood changes when city changes
    // Allow manual neighborhoods for manually entered cities
    useEffect(() => {
        if (!trimmedCity) {
            // If city is cleared, clear neighborhoods and distance
            if (neighborhoods.length > 0) {
                setNeighborhoods([]);
                setManualNeighborhoodInput('');
                onFilterChange(searchTerm, city, [], 0);
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
                onFilterChange(searchTerm, city, validNeighborhoods, distance);
            }
            // Clear manual input when switching to a city from the list
            if (manualNeighborhoodInput) {
                setManualNeighborhoodInput('');
            }
        }
        // If city is not in the list, allow manual neighborhoods (no validation needed)
    }, [isCitySelected, neighborhoods, city, distance, onFilterChange, searchTerm, trimmedCity, manualNeighborhoodInput]);

    // Reset distance when showAdditionalFilters becomes false
    useEffect(() => {
        if (!showAdditionalFilters && distance !== 0) {
            setDistance(0);
            onFilterChange(searchTerm, city, neighborhoods, 0);
        }
    }, [showAdditionalFilters, distance, searchTerm, city, neighborhoods, onFilterChange]);

    const handleSearchTermChange = useCallback((value: string) => {
        setSearchTerm(value);
        onFilterChange(value, city, neighborhoods, distance);
    }, [city, neighborhoods, distance, onFilterChange]);

    const handleDistanceChange = useCallback((value: number) => {
        setDistance(value);
        onFilterChange(searchTerm, city, neighborhoods, value);
    }, [searchTerm, city, neighborhoods, onFilterChange]);

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
                    console.error('Error getting location:', error);
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
            <Input
                id="filters-search"
                label="Търсене"
                placeholder="Ключова дума или референтен номер"
                value={searchTerm}
                onChange={(event) => handleSearchTermChange(event.target.value)}
                className={styles.filterInput}
            />
            <div className={styles.cityInputWrapper} ref={cityInputRef}>
                <div className={styles.cityInputRow}>
                    <div className={styles.autocompleteWrapper}>
                        <Input
                            id="filters-city"
                            label="Град"
                            placeholder="Въведете или изберете град (пр. Бургас)"
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
                                onFilterChange(searchTerm, value, neighborhoods, distance);
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
                                    .slice(0, 10) // Limit to 10 results for better UX
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
                                    label="Квартали"
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
                                            {neighborhoods.length} квартал{neighborhoods.length > 1 ? 'а' : ''} избран{neighborhoods.length > 1 ? 'и' : ''}.
                                        </p>
                                    </>
                                )}
                            </>
                        ) : (
                            // City is manually entered - show text input for manual neighborhood entry
                            <>
                                <Input
                                    id="filters-neighborhood-manual"
                                    label="Квартал"
                                    placeholder="Въведете квартал"
                                    value={manualNeighborhoodInput}
                                    onFocus={() => {
                                        // Prevent external prop sync from resetting the field while typing
                                        setIsEditingManualNeighborhood(true);
                                    }}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setManualNeighborhoodInput(value);
                                        // Update neighborhoods with the raw value (don't trim while typing)
                                        if (value.trim()) {
                                            handleNeighborhoodSelectChange([value.trim()]);
                                        } else {
                                            handleNeighborhoodSelectChange([]);
                                        }
                                    }}
                                    onBlur={(event) => {
                                        // Trim and format on blur
                                        const trimmedValue = event.target.value.trim();
                                        setManualNeighborhoodInput(trimmedValue);
                                        if (trimmedValue) {
                                            handleNeighborhoodSelectChange([trimmedValue]);
                                        } else {
                                            handleNeighborhoodSelectChange([]);
                                        }
                                        // Allow external prop sync again
                                        setIsEditingManualNeighborhood(false);
                                    }}
                                    className={styles.filterInput}
                                />
                                {neighborhoods.length > 0 && (
                                    <div className={styles.selectedNeighborhoods}>
                                        {neighborhoods.map((neighborhoodName) => (
                                            <span
                                                key={neighborhoodName}
                                                className={styles.neighborhoodChip}
                                            >
                                                {neighborhoodName}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleRemoveNeighborhood(neighborhoodName);
                                                        setManualNeighborhoodInput('');
                                                    }}
                                                    className={styles.neighborhoodChipRemove}
                                                    aria-label={`Remove ${neighborhoodName}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {showAdditionalFilters && (
                    <div className={styles.distanceFilter}>
                        <span className={styles.distanceHint}>
                            Провери картата на увеличаване
                        </span>
                        <label htmlFor="distance-slider" className={styles.distanceLabel}>
                            Радиус: {distance} km
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

