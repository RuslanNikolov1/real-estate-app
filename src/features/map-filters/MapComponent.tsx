'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, Circle, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { ArrowLeft } from '@phosphor-icons/react';
import burgasCities from '@/data/burgasCities.json';
import citiesNeighborhoods from '@/data/citiesNeighborhoods.json';
import styles from './MapFiltersPage.module.scss';
import { AdvancedMarker } from './AdvancedMarker';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyByEvHlvBQonQ4WeztrqXqLTeKYfCjXQxM';
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'; // You'll need to create a Map ID in Google Cloud Console

const defaultCenter = {
    lat: 42.5048,
    lng: 27.4626
};

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

type CityData = {
    id: string;
    name: string;
    nameEn: string;
    coordinates: number[];
    type?: string;
    [key: string]: unknown;
};

type NeighborhoodData = {
    id: string;
    name: string;
    nameEn: string;
    coordinates: number[];
    population?: number;
};

interface MapComponentProps {
    city?: string;
    cityCoordinates?: [number, number];
    distance?: number;
    neighborhoods?: string[];
    onCityClick?: (cityName: string, coordinates: [number, number]) => void;
    onNeighborhoodClick?: (neighborhoodName: string, coordinates: [number, number]) => void;
    onBackToCities?: () => void;
    onMapLoad?: (map: google.maps.Map) => void;
}

type PolygonFeature = {
    type: 'Feature';
    properties: {
        id: string;
        name: string;
        nameEn: string;
        population?: number;
    };
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
};

const libraries: ('marker')[] = ['marker'];

export function MapComponent({
    city = '',
    cityCoordinates,
    distance = 0,
    neighborhoods = [],
    onCityClick,
    onNeighborhoodClick,
    onBackToCities,
    onMapLoad
}: MapComponentProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'broker-bulgaria-google-maps',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    const trimmedCity = city.trim();

    // Calculate initial center and zoom based on props
    const mapCenter = useMemo(() => {
        if (cityCoordinates && trimmedCity) {
            return {
                lat: cityCoordinates[0],
                lng: cityCoordinates[1]
            };
        }
        return defaultCenter;
    }, [cityCoordinates, trimmedCity]);

    const mapZoom = useMemo(() => {
        if (cityCoordinates && trimmedCity) {
            return neighborhoods.length > 0 ? 14 : 13;
        }
        return 10;
    }, [cityCoordinates, trimmedCity, neighborhoods.length]);

    const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
        mapRef.current = mapInstance;

        // Use requestAnimationFrame for smoother resize without flash
        requestAnimationFrame(() => {
            if (mapInstance && typeof window !== 'undefined' && window.google) {
                window.google.maps.event.trigger(mapInstance, 'resize');
            }
        });

        if (onMapLoad) {
            onMapLoad(mapInstance);
        }
    }, [onMapLoad]);

    // Update map center and zoom when city or neighborhoods change (only if map already exists)
    useEffect(() => {
        if (!map) return;

        if (cityCoordinates && trimmedCity) {
            // Center on selected city
            map.setCenter({
                lat: cityCoordinates[0],
                lng: cityCoordinates[1]
            });
            if (neighborhoods.length > 0) {
                map.setZoom(14);
            } else {
                map.setZoom(13);
            }
        } else {
            // Default view showing all cities
            map.setCenter(defaultCenter);
            map.setZoom(10);
        }
    }, [map, cityCoordinates, trimmedCity, neighborhoods.length]);

    // Resize map only on actual window resize events
    useEffect(() => {
        if (!map) return;

        const handleResize = () => {
            if (typeof window !== 'undefined' && window.google) {
                window.google.maps.event.trigger(map, 'resize');
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [map]);

    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        scrollwheel: true,
        gestureHandling: 'greedy' as const,
        mapId: 'Demo_Key', // Required for AdvancedMarkerElement
        styles: [
            {
                featureType: "administrative.neighborhood",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
        ]
    };

    // Detect zoom changes and return to city selection mode if zoomed out too far
    useEffect(() => {
        if (!map) return;

        const handleZoomChanged = () => {
            const currentZoom = map.getZoom();
            // Trigger back to cities mode earlier (at zoom level 11.5 or lower)
            if (currentZoom && currentZoom < 11.5 && trimmedCity && onBackToCities) {
                onBackToCities();
            }
        };

        map.addListener('zoom_changed', handleZoomChanged);

        return () => {
            if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.event) {
                window.google.maps.event.clearListeners(map, 'zoom_changed');
            }
        };
    }, [map, trimmedCity, onBackToCities]);

    // Get neighborhoods for the selected city
    const getNeighborhoodsForCity = useCallback((cityName: string): NeighborhoodData[] => {
        if (!cityName) return [];

        const foundCity = burgasCities.cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                c.nameEn.toLowerCase() === cityName.toLowerCase()
        );

        if (!foundCity) return [];

        const cityKey = foundCity.id.toLowerCase();
        const cityData = citiesNeighborhoods[cityKey as keyof typeof citiesNeighborhoods];
        return cityData?.neighborhoods || [];
    }, []);

    const cityNeighborhoods = useMemo(() => {
        if (!trimmedCity) return [];
        return getNeighborhoodsForCity(trimmedCity);
    }, [trimmedCity, getNeighborhoodsForCity]);

    // Calculate average neighborhood size for polygon generation
    const calculateAverageNeighborhoodSize = useCallback(() => {
        let totalLat = 0;
        let totalLng = 0;
        let count = 0;

        Object.values(citiesNeighborhoods).forEach((cityData) => {
            cityData.neighborhoods.forEach((n) => {
                if (n.coordinates && n.coordinates.length === 2) {
                    totalLat += n.coordinates[0];
                    totalLng += n.coordinates[1];
                    count++;
                }
            });
        });

        if (count === 0) {
            return { latSize: 0.02, lngSize: 0.02 };
        }

        const avgLat = totalLat / count;
        const latRadians = avgLat * Math.PI / 180;
        const cosLat = Math.cos(latRadians);
        const LAT_KM_PER_DEG = 110.574;
        const LON_KM_PER_DEG = 111.320 * (cosLat === 0 ? 1 : cosLat);

        // Average area estimation (assume ~1 km²)
        const avgAreaKm2 = 1;
        const halfSideKm = Math.sqrt(avgAreaKm2) / 2;
        const latSize = halfSideKm / LAT_KM_PER_DEG;
        const lngSize = halfSideKm / LON_KM_PER_DEG;

        return { latSize, lngSize };
    }, []);

    // Get neighborhood polygons for a city
    const getNeighborhoodPolygons = useCallback((cityName: string): PolygonFeature[] => {
        if (!cityName) return [];

        const foundCity = burgasCities.cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                c.nameEn.toLowerCase() === cityName.toLowerCase()
        );

        if (!foundCity) return [];

        const cityKey = foundCity.id.toLowerCase();
        const cityData = citiesNeighborhoods[cityKey as keyof typeof citiesNeighborhoods];
        if (!cityData) return [];

        const avgSize = calculateAverageNeighborhoodSize();

        return cityData.neighborhoods
            .filter((n) => n.coordinates && n.coordinates.length === 2)
            .map((n) => {
                const lat = n.coordinates[0];
                const lng = n.coordinates[1];
                const population = n.population || 8000;

                // Population-based area estimation (reduced sizes)
                const DENSITY_PER_KM2 = 6000; // people per square km
                const MIN_AREA_KM2 = 0.04; // Reduced from 0.08
                const MAX_AREA_KM2 = 4; // Reduced from 8
                const estimatedAreaKm2 = Math.max(
                    MIN_AREA_KM2,
                    Math.min(MAX_AREA_KM2, population / DENSITY_PER_KM2)
                ) * 0.4374; // Reduce by 56.26% overall (additional 10% reduction from 0.486)
                const halfSideKm = Math.sqrt(estimatedAreaKm2) / 2;

                // Convert km distances to degrees
                const LAT_KM_PER_DEG = 110.574;
                const latRadians = lat * Math.PI / 180;
                const cosLat = Math.cos(latRadians);
                const LON_KM_PER_DEG = 111.320 * (cosLat === 0 ? 1 : cosLat);

                const latSize = halfSideKm / LAT_KM_PER_DEG;
                const lngSize = halfSideKm / (LON_KM_PER_DEG || LAT_KM_PER_DEG);

                // Provide fallback minimums based on averages (reduced)
                const adjustedLatSize = Math.max(latSize, avgSize.latSize * 0.095);
                const adjustedLngSize = Math.max(lngSize, avgSize.lngSize * 0.095);

                // Create square polygon around coordinate
                const polygonCoords: number[][] = [
                    [lng - adjustedLngSize, lat - adjustedLatSize],
                    [lng + adjustedLngSize, lat - adjustedLatSize],
                    [lng + adjustedLngSize, lat + adjustedLatSize],
                    [lng - adjustedLngSize, lat + adjustedLatSize],
                    [lng - adjustedLngSize, lat - adjustedLatSize]
                ];

                return {
                    type: 'Feature',
                    properties: {
                        id: n.id,
                        name: n.name,
                        nameEn: n.nameEn,
                        population
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [polygonCoords]
                    }
                };
            });
    }, [calculateAverageNeighborhoodSize]);

    const neighborhoodPolygons = useMemo(() => {
        if (!trimmedCity) return [];
        return getNeighborhoodPolygons(trimmedCity);
    }, [trimmedCity, getNeighborhoodPolygons]);

    // Create custom red map pin for AdvancedMarkerElement
    const createCityIconElement = useCallback((city: CityData): HTMLElement => {
        const svgMarkup = `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 256 256">
                <path fill="#8c1c1c" d="M128 24a72 72 0 0 0-72 72c0 67.86 66.16 121.57 68.98 123.9a8 8 0 0 0 9.97 0C133.84 217.57 200 163.86 200 96a72 72 0 0 0-72-72Zm0 104a32 32 0 1 1 32-32a32 32 0 0 1-32 32Z"/>
                <circle cx="128" cy="96" r="24" fill="#ffffff"/>
            </svg>
        `;
        const wrapper = document.createElement('div');
        wrapper.style.width = '36px';
        wrapper.style.height = '36px';
        wrapper.style.cursor = 'pointer';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.innerHTML = svgMarkup;
        return wrapper;
    }, []);

    // Create icon elements for all cities (memoized to avoid recreation)
    const cityIconElements = useMemo(() => {
        const elements = new Map<string, HTMLElement>();
        burgasCities.cities.forEach((city) => {
            elements.set(city.id, createCityIconElement(city as CityData));
        });
        return elements;
    }, [createCityIconElement]);



    if (loadError) {
        return (
            <div className={styles.mapWrapper}>
                <div className={styles.mapError}>Картата не може да бъде заредена в момента.</div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={styles.mapWrapper}>
                <div className={styles.mapLoading}>Зареждане на картата...</div>
            </div>
        );
    }

    return (
        <div className={styles.mapWrapper}>
            {/* Back to cities button */}
            {trimmedCity && onBackToCities && (
                <button
                    className={styles.backToCitiesButton}
                    onClick={onBackToCities}
                    type="button"
                    aria-label="Back to city selection"
                >
                    <ArrowLeft size={16} weight="bold" />
                    <span>Назад към градовете</span>
                </button>
            )}
                <div className={styles.mapInner}>
                    <div ref={mapContainerRef} className={styles.mapContainer}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            onLoad={handleMapLoad}
                            options={mapOptions}
                        >
                            {/* Render city markers when no city is selected (city selection mode) */}
                            {map && !trimmedCity && burgasCities.cities.map((city) => {
                                const iconElement = cityIconElements.get(city.id);
                                return (
                                    <AdvancedMarker
                                        key={city.id}
                                        map={map}
                                        position={{
                                            lat: city.coordinates[0],
                                            lng: city.coordinates[1]
                                        }}
                                        title={city.name}
                                        content={iconElement || null}
                                        onClick={() => {
                                            if (onCityClick) {
                                                onCityClick(city.name, [city.coordinates[0], city.coordinates[1]]);
                                            }
                                        }}
                                    />
                                );
                            })}

                            {/* Render distance circle when city is selected and distance > 0 */}
                            {map && cityCoordinates && distance > 0 && (
                                <Circle
                                    center={{
                                        lat: cityCoordinates[0],
                                        lng: cityCoordinates[1]
                                    }}
                                    radius={distance * 1000} // Convert km to meters
                                    options={{
                                        strokeColor: '#8c1c1c',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: '#8c1c1c',
                                        fillOpacity: 0.15,
                                        clickable: false,
                                        zIndex: 900
                                    }}
                                />
                            )}

                            {/* Render neighborhood polygons when city is selected */}
                            {map && typeof window !== 'undefined' && window.google && trimmedCity && neighborhoodPolygons.map((feature) => {
                                const neighborhoodName = feature.properties.name;
                                const isSelected = neighborhoods.includes(neighborhoodName);
                                const paths = feature.geometry.coordinates[0].map((coord) => ({
                                    lat: coord[1],
                                    lng: coord[0]
                                }));

                                return (
                                    <div key={feature.properties.id}>
                                        <Polygon
                                            paths={paths}
                                            options={{
                                                fillColor: isSelected ? '#8c1c1c' : 'transparent',
                                                fillOpacity: isSelected ? 0.3 : 0,
                                                strokeColor: isSelected ? '#8c1c1c' : '#666666',
                                                strokeOpacity: isSelected ? 0.8 : 0.5,
                                                strokeWeight: isSelected ? 3 : 2,
                                                clickable: true,
                                                zIndex: isSelected ? 1000 : 500
                                            }}
                                            onClick={() => {
                                                if (onNeighborhoodClick) {
                                                    // Find the neighborhood data to get coordinates
                                                    const neighborhood = cityNeighborhoods.find(
                                                        (n) => n.name === neighborhoodName
                                                    );
                                                    if (neighborhood) {
                                                        onNeighborhoodClick(neighborhoodName, [
                                                            neighborhood.coordinates[0],
                                                            neighborhood.coordinates[1]
                                                        ]);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}

                        </GoogleMap>
                    </div>
                </div>
        </div>
    );
}

