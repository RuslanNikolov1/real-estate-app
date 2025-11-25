'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { CrosshairSimple } from '@phosphor-icons/react';
import burgasCities from '@/data/burgasCities.json';
import { getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import styles from './LocationFiltersGroup.module.scss';

type CityData = {
    id: string;
    name: string;
    nameEn: string;
    coordinates: number[];
    type?: string;
    [key: string]: unknown;
};

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
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [city, setCity] = useState(initialCity);
    const [neighborhoods, setNeighborhoods] = useState<string[]>(initialNeighborhoods);
    const [distance, setDistance] = useState(initialDistance);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Sync internal state with initial props when they change (e.g., from map clicks)
    useEffect(() => {
        setSearchTerm(initialSearchTerm);
        setCity(initialCity);
        setNeighborhoods(initialNeighborhoods);
        setDistance(initialDistance);
    }, [initialSearchTerm, initialCity, initialNeighborhoods, initialDistance]);
    const internalCityInputRef = useRef<HTMLDivElement | null>(null);
    const cityInputRefForDropdown = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    
    // Use external ref if provided, otherwise use internal ref
    const cityInputRef = externalCityInputRef || internalCityInputRef;

    const trimmedCity = city.trim();
    
    // Check if the city is a valid selected city from the list
    const isValidCity = useCallback((cityName: string) => {
        if (!cityName) return false;
        return burgasCities.cities.some(
            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                c.nameEn.toLowerCase() === cityName.toLowerCase()
        );
    }, []);

    const isCitySelected = isValidCity(trimmedCity);
    const showAdditionalFilters = isCitySelected;

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

    // Clear neighborhood search and close dropdown when city changes or becomes invalid
    useEffect(() => {
        if (!isCitySelected) {
            if (neighborhoods.length > 0) {
                setNeighborhoods([]);
                onFilterChange(searchTerm, city, [], 0);
            }
            if (distance !== 0) {
                setDistance(0);
            }
            return;
        }

        const validNeighborhoods = neighborhoods.filter((n) =>
            getNeighborhoodsByCity(city).includes(n),
        );
        if (validNeighborhoods.length !== neighborhoods.length) {
            setNeighborhoods(validNeighborhoods);
            onFilterChange(searchTerm, city, validNeighborhoods, distance);
        }
    }, [isCitySelected, neighborhoods, city, distance, onFilterChange, searchTerm]);

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
    const findClosestCity = useCallback((lat: number, lng: number): CityData | null => {
        let closestCity: CityData | null = null;
        let shortestDistance = Infinity;

        burgasCities.cities.forEach((c) => {
            const [cityLat, cityLng] = c.coordinates;
            if (typeof cityLat === 'number' && typeof cityLng === 'number') {
                const distance = calculateDistanceKm(lat, lng, cityLat, cityLng);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestCity = c as CityData;
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
                        handleCitySelect(closestCity.name, [closestCity.coordinates[0], closestCity.coordinates[1]]);
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
                            placeholder="Пр. Бургас"
                            value={city}
                            onChange={(event) => {
                                setCity(event.target.value);
                                setShowCityDropdown(true);
                                onFilterChange(searchTerm, event.target.value, neighborhoods, distance);
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            onBlur={(e) => {
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
                        {showCityDropdown && (
                            <div
                                ref={cityDropdownRef}
                                className={styles.cityDropdown}
                            >
                                {burgasCities.cities
                                    .filter((c) => {
                                        const searchTerm = city.toLowerCase().trim();
                                        if (!searchTerm) return true;
                                        return c.name.toLowerCase().includes(searchTerm) ||
                                            c.nameEn.toLowerCase().includes(searchTerm);
                                    })
                                    .map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={styles.cityDropdownItem}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Prevent input blur
                                            }}
                                            onClick={() => {
                                                handleCitySelect(c.name, [c.coordinates[0], c.coordinates[1]]);
                                            }}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
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
                {showAdditionalFilters && (
                    <div className={styles.neighborhoodFilter}>
                        <NeighborhoodSelect
                            city={isCitySelected ? city : ''}
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

