'use client';

import { useState, useRef, useEffect, type ReactNode, type CSSProperties, useCallback, useMemo, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import {
    Armchair,
    ArrowFatLinesUp,
    ArrowLeft,
    ArrowsLeftRight,
    Bed,
    Car,
    CheckCircle,
    CrosshairSimple,
    Cube,
    CurrencyCircleDollar,
    Factory,
    Fire,
    FireSimple,
    Hammer,
    Handshake,
    HouseLine,
    Infinity,
    Minus,
    Palette,
    PaintRoller,
    PiggyBank,
    Plus,
    ShieldCheck,
    SolarPanel,
    SunHorizon,
    Thermometer,
    TreeEvergreen,
    Question
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { propertyTypes } from '@/data/propertyTypes';
import burgasCities from '@/data/burgasCities.json';
import burgasNeighborhoods from '@/data/burgasNeighborhoods.json';
import citiesNeighborhoods from '@/data/citiesNeighborhoods.json';
import styles from './MapFiltersPage.module.scss';
import { GoogleMap, LoadScript, Marker, Polygon, OverlayView, Circle } from '@react-google-maps/api';

const AREA_SLIDER_MAX = 500;
const HOUSE_AREA_SLIDER_MAX = 2000;
const SQUARE_AREA_CAP = 225;
const PRICE_SLIDER_MAX = 300000;
const HOUSE_PRICE_SLIDER_MAX = 7500000;
const PRICE_PER_SQM_SLIDER_MAX = 3000;
const YEAR_SLIDER_MIN = 1900;
const YEAR_SLIDER_MAX = 2050;
const FLOOR_SLIDER_MIN = 0;
const FLOOR_SLIDER_MAX = 20;

// Google Maps container style
const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
};

// Default map center (Burgas)
const defaultCenter = {
    lat: 42.5048,
    lng: 27.4626
};

type LatLngLiteral = { lat: number; lng: number };

type CityData = {
    id: string;
    name: string;
    nameEn: string;
    coordinates: number[];
    type?: string;
    [key: string]: unknown;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const earthRadius = 6371; // km

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
};

const calculatePolygonCentroid = (points: LatLngLiteral[]): LatLngLiteral | null => {
    if (!points || points.length === 0) {
        return null;
    }

    const closedPoints =
        points[0].lat === points[points.length - 1].lat && points[0].lng === points[points.length - 1].lng
            ? points
            : [...points, points[0]];

    let area = 0;
    let centroidX = 0;
    let centroidY = 0;

    for (let i = 0; i < closedPoints.length - 1; i++) {
        const x0 = closedPoints[i].lng;
        const y0 = closedPoints[i].lat;
        const x1 = closedPoints[i + 1].lng;
        const y1 = closedPoints[i + 1].lat;

        const cross = x0 * y1 - x1 * y0;
        area += cross;
        centroidX += (x0 + x1) * cross;
        centroidY += (y0 + y1) * cross;
    }

    area *= 0.5;

    if (area === 0) {
        const total = closedPoints.slice(0, -1).reduce(
            (acc, point) => {
                acc.lat += point.lat;
                acc.lng += point.lng;
                return acc;
            },
            { lat: 0, lng: 0 }
        );
        const length = closedPoints.length - 1;
        return length > 0 ? { lat: total.lat / length, lng: total.lng / length } : null;
    }

    const finalLng = centroidX / (6 * area);
    const finalLat = centroidY / (6 * area);

    return { lat: finalLat, lng: finalLng };
};



interface MapFiltersPageProps {
    initialPropertyType?: string | null;
}

export function MapFiltersPage({ initialPropertyType = null }: MapFiltersPageProps) {
    const router = useRouter();
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(() => {
        if (!initialPropertyType) {
            return null;
        }
        return propertyTypes.some((type) => type.id === initialPropertyType) ? initialPropertyType : null;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [city, setCity] = useState('');
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [distance, setDistance] = useState(0);
    const [areaFrom, setAreaFrom] = useState(20);
    const [areaTo, setAreaTo] = useState(100);
    const [priceFrom, setPriceFrom] = useState(0);
    const [priceTo, setPriceTo] = useState(PRICE_SLIDER_MAX);
    const [pricePerSqmFrom, setPricePerSqmFrom] = useState(0);
    const [pricePerSqmTo, setPricePerSqmTo] = useState(PRICE_PER_SQM_SLIDER_MAX);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [selectedConstructionTypes, setSelectedConstructionTypes] = useState<string[]>([]);
    const [yearFrom, setYearFrom] = useState(YEAR_SLIDER_MIN);
    const [yearTo, setYearTo] = useState(YEAR_SLIDER_MAX);
    const [isYearNotProvided, setIsYearNotProvided] = useState(false);
    const [floorFrom, setFloorFrom] = useState(FLOOR_SLIDER_MIN);
    const [floorTo, setFloorTo] = useState(FLOOR_SLIDER_MAX);
    const [isFloorNotProvided, setIsFloorNotProvided] = useState(false);
    const [selectedFloorOptions, setSelectedFloorOptions] = useState<string[]>([]);
    const [selectedCompletionStatuses, setSelectedCompletionStatuses] = useState<string[]>([]);
    const [selectedApartmentSubtypes, setSelectedApartmentSubtypes] = useState<string[]>([]);
    const [selectedHouseTypes, setSelectedHouseTypes] = useState<string[]>(['houses', 'villas']);
    const [selectedHouseFloorOptions, setSelectedHouseFloorOptions] = useState<string[]>(['all']);
    const [selectedHouseAreaPreset, setSelectedHouseAreaPreset] = useState<string | null>(null);
    const [selectedHouseYardOption, setSelectedHouseYardOption] = useState<string | null>(null);
    const [selectedHousePricePreset, setSelectedHousePricePreset] = useState<string | null>(null);
    const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([42.5048, 27.4626]);
    const [osmNeighborhoods, setOsmNeighborhoods] = useState<any>(null);
    const [selectedCityName, setSelectedCityName] = useState<string>('');
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const cityInputRef = useRef<HTMLDivElement>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [hasFittedBounds, setHasFittedBounds] = useState(false);
    const [isCitySelectionMode, setIsCitySelectionMode] = useState(true);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const cityInputRefForDropdown = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
    const neighborhoodInputRef = useRef<HTMLInputElement>(null);
    const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);
    const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');

    useEffect(() => {
        if (!initialPropertyType) {
            setSelectedPropertyType((prev) => (prev !== null ? null : prev));
            setSelectedApartmentSubtypes([]);
            return;
        }

        const isValidType = propertyTypes.some((type) => type.id === initialPropertyType);
        if (!isValidType) {
            setSelectedPropertyType((prev) => (prev !== null ? null : prev));
            setSelectedApartmentSubtypes([]);
            return;
        }

        setSelectedPropertyType((prev) => (prev === initialPropertyType ? prev : initialPropertyType));

        if (initialPropertyType !== 'apartments') {
            setSelectedApartmentSubtypes([]);
        }
    }, [initialPropertyType]);

    const isApartmentsSelected = selectedPropertyType === 'apartments';
    const isHousesSelected = selectedPropertyType === 'houses-villas';
    const areaSliderMax = isHousesSelected ? HOUSE_AREA_SLIDER_MAX : AREA_SLIDER_MAX;
    const priceSliderMax = isHousesSelected ? HOUSE_PRICE_SLIDER_MAX : PRICE_SLIDER_MAX;
    const trimmedCity = city.trim();
    const showDistanceFilter = isApartmentsSelected && trimmedCity.length >= 3;
    const priceFromClamped = Math.max(0, Math.min(priceFrom, priceSliderMax));
    const priceToClamped = Math.max(0, Math.min(priceTo, priceSliderMax));
    const pricePerSqmFromClamped = Math.max(0, Math.min(pricePerSqmFrom, PRICE_PER_SQM_SLIDER_MAX));
    const pricePerSqmToClamped = Math.max(0, Math.min(pricePerSqmTo, PRICE_PER_SQM_SLIDER_MAX));
    const piggyBankMinSize = 32;
    const piggyBankMaxSize = 64;
    const piggyBankSize = useMemo(
        () => piggyBankMinSize + (priceToClamped / priceSliderMax) * (piggyBankMaxSize - piggyBankMinSize),
        [priceToClamped, priceSliderMax]
    );
    const piggyBankSqmSize = useMemo(
        () => piggyBankMinSize + (pricePerSqmToClamped / PRICE_PER_SQM_SLIDER_MAX) * (piggyBankMaxSize - piggyBankMinSize),
        [pricePerSqmToClamped]
    );

    useEffect(() => {
        if (isHousesSelected) {
            setPriceTo((prev) => {
                if (prev === PRICE_SLIDER_MAX) {
                    return HOUSE_PRICE_SLIDER_MAX;
                }
                return Math.min(prev, HOUSE_PRICE_SLIDER_MAX);
            });
            setAreaTo((prev) => Math.min(prev, HOUSE_AREA_SLIDER_MAX));
        } else {
            setPriceTo((prev) => Math.min(prev, PRICE_SLIDER_MAX));
            setAreaTo((prev) => Math.min(prev, AREA_SLIDER_MAX));
            setSelectedHouseAreaPreset(null);
            setSelectedHousePricePreset(null);
            setSelectedHouseYardOption(null);
            setSelectedHouseFloorOptions(['all']);
            setSelectedHouseTypes(['houses', 'villas']);
        }
    }, [isHousesSelected]);

    const findClosestCity = useCallback((lat: number, lng: number): CityData | null => {
        const cities = (burgasCities.cities ?? []) as CityData[];
        if (cities.length === 0) {
            return null;
        }

        let closestCity: CityData | null = null;
        let shortestDistance = Number.POSITIVE_INFINITY;

        cities.forEach((candidateCity) => {
            const [candidateLat, candidateLng] = candidateCity.coordinates;
            if (typeof candidateLat !== 'number' || typeof candidateLng !== 'number') {
                return;
            }

            const distance = calculateDistanceKm(lat, lng, candidateLat, candidateLng);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestCity = candidateCity;
            }
        });

        return closestCity;
    }, []);

    // Get neighborhoods for the selected city
    const getNeighborhoodsForCity = useCallback((cityName: string) => {
        if (!cityName) return [];

        // Find the city in burgasCities to get its id
        const foundCity = burgasCities.cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                c.nameEn.toLowerCase() === cityName.toLowerCase()
        );

        if (!foundCity) return [];

        // Map city id to citiesNeighborhoods key (lowercase)
        const cityKey = foundCity.id.toLowerCase();
        const cityData = citiesNeighborhoods[cityKey as keyof typeof citiesNeighborhoods];

        return cityData?.neighborhoods || [];
    }, []);

    // Calculate average neighborhood size from Burgas neighborhoods
    const calculateAverageNeighborhoodSize = useCallback(() => {
        if (!burgasNeighborhoods.features || burgasNeighborhoods.features.length === 0) {
            return { lngSize: 0.014, latSize: 0.006 }; // Default fallback
        }

        let totalLngSize = 0;
        let totalLatSize = 0;
        let count = 0;

        burgasNeighborhoods.features.forEach((feature: any) => {
            if (feature.geometry?.coordinates?.[0]) {
                const coords = feature.geometry.coordinates[0];
                const lngs = coords.map((c: number[]) => c[0]);
                const lats = coords.map((c: number[]) => c[1]);

                const lngRange = Math.max(...lngs) - Math.min(...lngs);
                const latRange = Math.max(...lats) - Math.min(...lats);

                totalLngSize += lngRange;
                totalLatSize += latRange;
                count++;
            }
        });

        return {
            lngSize: count > 0 ? totalLngSize / count : 0.014,
            latSize: count > 0 ? totalLatSize / count : 0.006
        };
    }, []);

    // Get neighborhood polygons for the selected city
    const getNeighborhoodPolygons = useCallback((cityName: string) => {
        if (!cityName) return [];

        const cityNameLower = cityName.toLowerCase();

        // For Burgas, use burgasNeighborhoods.json which has GeoJSON format
        if (cityNameLower.includes('burgas') || cityNameLower.includes('бургас')) {
            return burgasNeighborhoods.features || [];
        }

        // For other cities, check if they have neighborhoods with coordinates
        const foundCity = burgasCities.cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                c.nameEn.toLowerCase() === cityName.toLowerCase()
        );

        if (!foundCity) return [];

        const cityKey = foundCity.id.toLowerCase();
        const cityData = citiesNeighborhoods[cityKey as keyof typeof citiesNeighborhoods];

        if (!cityData?.neighborhoods) return [];

        // Convert neighborhoods with coordinates to GeoJSON-like features
        return cityData.neighborhoods
            .filter((n: any) => n.coordinates && n.coordinates.length === 2)
            .map((n: any) => {
                const lat = n.coordinates[0];
                const lng = n.coordinates[1];
                const population = n.population || 8000;

                // Population-based area estimation (assume average density)
                const DENSITY_PER_KM2 = 6000; // people per square km
                const MIN_AREA_KM2 = 0.08;
                const MAX_AREA_KM2 = 8;
                const estimatedAreaKm2 = Math.max(
                    MIN_AREA_KM2,
                    Math.min(MAX_AREA_KM2, population / DENSITY_PER_KM2)
                );

                const halfSideKm = Math.sqrt(estimatedAreaKm2) / 2;

                // Convert km distances to degrees
                const LAT_KM_PER_DEG = 110.574;
                const latRadians = (lat * Math.PI) / 180;
                const cosLat = Math.cos(latRadians);
                const LON_KM_PER_DEG = 111.320 * (cosLat === 0 ? 1 : cosLat);

                const latSize = halfSideKm / LAT_KM_PER_DEG;
                const lngSize = halfSideKm / (LON_KM_PER_DEG || LAT_KM_PER_DEG);

                // Provide fallback minimums based on Burgas averages to avoid tiny polygons
                const avgSize = calculateAverageNeighborhoodSize();
                const adjustedLatSize = Math.max(latSize, avgSize.latSize * 0.25);
                const adjustedLngSize = Math.max(lngSize, avgSize.lngSize * 0.25);

                return {
                    type: 'Feature',
                    properties: {
                        id: n.id,
                        name: n.name,
                        nameEn: n.nameEn,
                        population: population
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [lng - adjustedLngSize, lat - adjustedLatSize],
                            [lng + adjustedLngSize, lat - adjustedLatSize],
                            [lng + adjustedLngSize, lat + adjustedLatSize],
                            [lng - adjustedLngSize, lat + adjustedLatSize],
                            [lng - adjustedLngSize, lat - adjustedLatSize]
                        ]]
                    }
                };
            });
    }, [calculateAverageNeighborhoodSize]);

    // Handle neighborhood polygon click
    const handleNeighborhoodClick = useCallback((neighborhoodName: string) => {
        setNeighborhoods((prev) => {
            if (prev.includes(neighborhoodName)) {
                // Remove if already selected
                return prev.filter(name => name !== neighborhoodName);
            } else {
                // Add if not selected
                return [...prev, neighborhoodName];
            }
        });
    }, []);

    const handleBackToCities = useCallback(() => {
        setIsCitySelectionMode(true);
        setNeighborhoods([]);
        setCity('');
        setCityCoordinates(null);
        setSelectedCityName('');
        setOsmNeighborhoods(null);
        setShowCityDropdown(false);
        setNeighborhoodSearchTerm('');
        setShowNeighborhoodDropdown(false);
        setDistance(0);
        setMapCenter([defaultCenter.lat, defaultCenter.lng]);

        if (map && typeof window !== 'undefined' && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            burgasCities.cities.forEach((city) => {
                bounds.extend({
                    lat: city.coordinates[0],
                    lng: city.coordinates[1]
                });
            });
            map.fitBounds(bounds, 50);
        }
    }, [map]);

    const cappedAreaFrom = Math.min(areaFrom, SQUARE_AREA_CAP);
    const cappedAreaTo = Math.min(areaTo, SQUARE_AREA_CAP);
    const squareSideFrom = Math.sqrt(cappedAreaFrom) * 600 / Math.sqrt(SQUARE_AREA_CAP);
    const squareSideTo = Math.sqrt(cappedAreaTo) * 600 / Math.sqrt(SQUARE_AREA_CAP);
    const largestSquareSide = Math.max(squareSideFrom, squareSideTo);
    const isFromSmaller = squareSideFrom < squareSideTo;
    const isToSmaller = squareSideTo < squareSideFrom;
    const bedImageHeight = 80;
    const totalSquareHeight = largestSquareSide ? largestSquareSide + bedImageHeight : 0;
    const areaLeftFiltersStyle: CSSProperties = totalSquareHeight
        ? { minHeight: totalSquareHeight }
        : {};
    const bedWrapperStyle: CSSProperties = largestSquareSide
        ? { minHeight: largestSquareSide + bedImageHeight }
        : {};

    useEffect(() => {
        if (!showDistanceFilter && distance !== 0) {
            setDistance(0);
        }
    }, [showDistanceFilter, distance]);

    // Clear neighborhood search and close dropdown when city changes
    useEffect(() => {
        setNeighborhoodSearchTerm('');
        setShowNeighborhoodDropdown(false);
        // Optionally clear neighborhoods when city changes
        // setNeighborhoods([]);
    }, [trimmedCity]);

    // Find city coordinates when city name changes
    useEffect(() => {
        // Clear OSM neighborhoods when city is changed manually
        if (osmNeighborhoods && selectedCityName && trimmedCity !== selectedCityName) {
            setOsmNeighborhoods(null);
            setSelectedCityName('');
        }

        if (trimmedCity.length >= 2) {
            const foundCity = burgasCities.cities.find(
                (c) => c.name.toLowerCase() === trimmedCity.toLowerCase() ||
                    c.nameEn.toLowerCase() === trimmedCity.toLowerCase()
            );
            if (foundCity && foundCity.coordinates) {
                const coords: [number, number] = [foundCity.coordinates[0], foundCity.coordinates[1]];
                setCityCoordinates(coords);
                setMapCenter(coords);

                // Only load neighborhoods for Burgas
                const cityNameLower = foundCity.name.toLowerCase();
                if (cityNameLower.includes('burgas') || cityNameLower.includes('бургас')) {
                    setOsmNeighborhoods(null);
                    setSelectedCityName(foundCity.name);
                } else {
                    // For other cities, don't show neighborhoods
                    setOsmNeighborhoods(null);
                    setSelectedCityName('');
                }
            } else {
                setCityCoordinates(null);
            }
        } else {
            setCityCoordinates(null);
            setMapCenter([42.5048, 27.4626]);
        }
    }, [trimmedCity, osmNeighborhoods, selectedCityName]);

    // Fit bounds to show all Burgas municipality cities on initial load
    useEffect(() => {
        if (map && !hasFittedBounds && typeof window !== 'undefined' && window.google) {
            const bounds = new window.google.maps.LatLngBounds();

            // Add all Burgas municipality cities to bounds
            burgasCities.cities.forEach((city) => {
                bounds.extend({
                    lat: city.coordinates[0],
                    lng: city.coordinates[1]
                });
            });

            // Fit bounds with padding (50px on all sides)
            map.fitBounds(bounds, 50);
            setHasFittedBounds(true);
        }
    }, [map, hasFittedBounds]);

    // Update map center when mapCenter state changes (but not on initial load)
    useEffect(() => {
        if (map && mapCenter && hasFittedBounds) {
            map.panTo({
                lat: mapCenter[0],
                lng: mapCenter[1]
            });
        }
    }, [map, mapCenter, hasFittedBounds]);

    useEffect(() => {
        if (!map) return;

        const zoomChangeListener = map.addListener('zoom_changed', () => {
            const currentZoom = map.getZoom();
            if (typeof currentZoom === 'number' && currentZoom < 11 && !isCitySelectionMode) {
                handleBackToCities();
            }
        });

        return () => {
            zoomChangeListener.remove();
        };
    }, [map, isCitySelectionMode, handleBackToCities]);


    // Fetch neighborhoods from OpenStreetMap
    const fetchNeighborhoodsFromOSM = async (lat: number, lng: number, cityName?: string, updateCityName: boolean = true) => {
        setLoadingNeighborhoods(true);
        try {
            let finalCityName = cityName;

            // If city name not provided, reverse geocode to get city name
            if (!finalCityName) {
                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
                const nominatimResponse = await fetch(nominatimUrl, {
                    referrerPolicy: 'strict-origin-when-cross-origin',
                    headers: {
                        'User-Agent': 'RealEstateApp/1.0'
                    }
                });
                const nominatimData = await nominatimResponse.json();

                finalCityName = nominatimData.address?.city ||
                    nominatimData.address?.town ||
                    nominatimData.address?.municipality ||
                    nominatimData.address?.county ||
                    '';

                if (!finalCityName) {
                    setLoadingNeighborhoods(false);
                    return;
                }
            }

            if (updateCityName) {
                setSelectedCityName(finalCityName);
                setCity(finalCityName);
                setCityCoordinates([lat, lng]);
                setMapCenter([lat, lng]);

            }

            // Fetch neighborhoods using Overpass API
            // Use a larger bounding box for better neighborhood coverage
            // Bbox format: (south,west,north,east)
            const south = lat - 0.15;
            const west = lng - 0.15;
            const north = lat + 0.15;
            const east = lng + 0.15;
            const overpassQuery = `
                [out:json][timeout:25];
                (
                    relation["place"="suburb"](bbox:${south},${west},${north},${east});
                    relation["place"="neighbourhood"](bbox:${south},${west},${north},${east});
                    relation["place"="quarter"](bbox:${south},${west},${north},${east});
                    relation["place"="city_block"](bbox:${south},${west},${north},${east});
                    way["place"="suburb"](bbox:${south},${west},${north},${east});
                    way["place"="neighbourhood"](bbox:${south},${west},${north},${east});
                    way["place"="quarter"](bbox:${south},${west},${north},${east});
                    way["place"="city_block"](bbox:${south},${west},${north},${east});
                );
                out geom;
            `;

            const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
            const overpassResponse = await fetch(overpassUrl, {
                referrerPolicy: 'strict-origin-when-cross-origin',
                headers: {
                    'User-Agent': 'RealEstateApp/1.0'
                }
            });
            const overpassData = await overpassResponse.json();

            if (overpassData.elements && overpassData.elements.length > 0) {
                // Convert Overpass data to GeoJSON format
                const features = overpassData.elements.map((element: any) => {
                    if (element.type === 'relation' || element.type === 'way') {
                        const coordinates = element.geometry?.map((point: any) => [point.lon, point.lat]) || [];

                        // Only include features with coordinates
                        if (coordinates.length === 0) {
                            return null;
                        }

                        // Determine geometry type
                        let geometryType = 'LineString';
                        if (element.type === 'relation') {
                            geometryType = 'Polygon';
                        } else if (element.type === 'way' && coordinates.length > 2 &&
                            coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
                            coordinates[0][1] === coordinates[coordinates.length - 1][1]) {
                            geometryType = 'Polygon';
                        }

                        return {
                            type: 'Feature',
                            properties: {
                                name: element.tags?.name || '',
                                id: element.id,
                                type: element.tags?.place || ''
                            },
                            geometry: {
                                type: geometryType,
                                coordinates: geometryType === 'Polygon' ? [coordinates] : coordinates
                            }
                        };
                    }
                    return null;
                }).filter((f: any) => f !== null && f.geometry.coordinates.length > 0);

                const geoJsonData = {
                    type: 'FeatureCollection',
                    features: features
                };

                setOsmNeighborhoods(geoJsonData);
                setSelectedCityName(finalCityName);
            } else {
                // If no neighborhoods found, check if it's Burgas and use local data
                if (finalCityName && (finalCityName.toLowerCase().includes('burgas') || finalCityName.toLowerCase().includes('бургас'))) {
                    setOsmNeighborhoods(null); // Use burgasNeighborhoods instead
                } else {
                    setOsmNeighborhoods(null);
                }
            }
        } catch (error) {
            console.error('Error fetching neighborhoods:', error);
            setOsmNeighborhoods(null);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    const handleMapCityClick = useCallback(async (lat: number, lng: number) => {
        // First try to get city name from coordinates
        const foundCity = burgasCities.cities.find(
            (c) => Math.abs(c.coordinates[0] - lat) < 0.1 && Math.abs(c.coordinates[1] - lng) < 0.1
        );

        if (foundCity) {
            const foundCityNameLower = foundCity.name.toLowerCase();


            // Only load neighborhoods for Burgas
            if (foundCityNameLower.includes('burgas') || foundCityNameLower.includes('бургас')) {
                setOsmNeighborhoods(null); // Will use burgasNeighborhoods in neighborhoodsGeoJSON
                setSelectedCityName(foundCity.name);
                // City input is not populated on click - removed functionality
                setCityCoordinates([foundCity.coordinates[0], foundCity.coordinates[1]]);
                setMapCenter([foundCity.coordinates[0], foundCity.coordinates[1]]);
                setIsCitySelectionMode(false);
                return;
            }

            // For other cities, don't populate city input
            setSelectedCityName('');
            setOsmNeighborhoods(null);
            setCityCoordinates([foundCity.coordinates[0], foundCity.coordinates[1]]);
            setMapCenter([foundCity.coordinates[0], foundCity.coordinates[1]]);
            setIsCitySelectionMode(false);
            return;
        }
    }, []);

    const handleCityClick = useCallback(async (cityName: string, coordinates: [number, number]) => {
        setCity(cityName);
        setCityCoordinates(coordinates);
        setMapCenter(coordinates);
        setNeighborhoods([]);
        setNeighborhoodSearchTerm('');
        setIsCitySelectionMode(false);
        setShowCityDropdown(false);

        // Zoom to the city when clicked
        if (map) {
            map.panTo({
                lat: coordinates[0],
                lng: coordinates[1]
            });
            map.setZoom(13); // Zoom level for city view
        }

        // Only load neighborhoods for Burgas
        const cityNameLower = cityName.toLowerCase();
        if (cityNameLower.includes('burgas') || cityNameLower.includes('бургас')) {
            // Use local Burgas neighborhoods data
            setOsmNeighborhoods(null);
            setSelectedCityName(cityName);
        } else {
            // For other cities, don't show neighborhoods
            setOsmNeighborhoods(null);
            setSelectedCityName('');
        }
    }, [map]);

    const handleZoomIn = useCallback(() => {
        if (!map) return;
        const currentZoom = map.getZoom() ?? 12;
        map.setZoom(Math.min(currentZoom + 1, 20));
    }, [map]);

    const handleZoomOut = useCallback(() => {
        if (!map) return;
        const currentZoom = map.getZoom() ?? 12;
        map.setZoom(Math.max(currentZoom - 1, 3));
    }, [map]);

    const handleDetectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser.');
            return;
        }

        setIsDetectingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                const closestCity = findClosestCity(latitude, longitude);

                if (closestCity) {
                    const [closestLat, closestLng] = closestCity.coordinates;
                    if (typeof closestLat === 'number' && typeof closestLng === 'number') {
                        handleCityClick(closestCity.name, [closestLat, closestLng]);
                    } else {
                        setCity('');
                        setCityCoordinates([latitude, longitude]);
                        setMapCenter([latitude, longitude]);

                        if (map) {
                            map.panTo({ lat: latitude, lng: longitude });
                            map.setZoom(13);
                        }
                    }
                } else {
                    setCity('');
                    setCityCoordinates([latitude, longitude]);
                    setMapCenter([latitude, longitude]);

                    if (map) {
                        map.panTo({ lat: latitude, lng: longitude });
                        map.setZoom(13);
                    }
                }

                setIsDetectingLocation(false);
            },
            (error) => {
                console.error('Error detecting location:', error);
                setIsDetectingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }, [findClosestCity, handleCityClick, map]);





    type ApartmentSubtype = {
        id: string;
        label: string;
        icon?: ReactNode;
    };

    type FeatureFilter = {
        id: string;
        label: string;
        icon: ReactNode;
    };

    type ConstructionFilter = {
        id: string;
        label: string;
        icon: ReactNode;
    };

    type FloorSpecialOption = {
        id: string;
        label: string;
    };

    type CompletionStatus = {
        id: string;
        label: string;
        icon: ReactNode;
    };
    const bedIconSize = 20;

    const createBedIcons = (count: number) =>
        Array.from({ length: count }, (_, index) => (
            <Bed key={index} size={bedIconSize} weight="regular" />
        ));

    const APARTMENT_SUBTYPES: ApartmentSubtype[] = [
        {
            id: 'all',
            label: 'Всички'
        },
        { id: 'studio', label: 'Едностаен', icon: <Bed size={bedIconSize} weight="regular" /> },
        { id: 'one-bedroom', label: 'Двустаен', icon: createBedIcons(2) },
        { id: 'two-bedroom', label: 'Тристаен', icon: createBedIcons(3) },
        {
            id: 'multi-bedroom',
            label: 'Многостаен апартамент',
            icon: (
                <>
                    <Bed size={bedIconSize} weight="regular" />
                    <Infinity size={bedIconSize} weight="regular" />
                </>
            )
        },
        { id: 'maisonette', label: 'Мезонет', icon: <HouseLine size={bedIconSize} weight="regular" /> },
        { id: 'atelier', label: 'Ателие/Студио', icon: <Palette size={bedIconSize} weight="regular" /> },
        { id: 'attic', label: 'Таван', icon: <SolarPanel size={bedIconSize} weight="regular" /> },
    ];

    const APARTMENT_FEATURE_FILTERS: FeatureFilter[] = [
        { id: 'all', label: 'Всички', icon: null },
        { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
        { id: 'gasified', label: 'Газифициран', icon: <Fire size={18} weight="bold" /> },
        { id: 'parking', label: 'Гараж/Паркомясто', icon: <Car size={18} weight="bold" /> },
        { id: 'turnkey', label: 'До ключ', icon: <CheckCircle size={18} weight="bold" /> },
        { id: 'barter', label: 'Замяна/Бартер', icon: <ArrowsLeftRight size={18} weight="bold" /> },
        { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
        { id: 'fireplace', label: 'Камина', icon: <FireSimple size={18} weight="bold" /> },
        { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
        { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
        { id: 'unfurnished', label: 'Необзаведен', icon: <Cube size={18} weight="bold" /> },
        { id: 'furnished', label: 'Обзаведен', icon: <Armchair size={18} weight="bold" /> },
        { id: 'sea-view', label: 'Панорама море', icon: <SunHorizon size={18} weight="bold" /> },
        { id: 'mountain-view', label: 'Панорама планина', icon: <TreeEvergreen size={18} weight="bold" /> },
        { id: 'security', label: 'Портиер/Охрана', icon: <ShieldCheck size={18} weight="bold" /> },
        { id: 'renovated-insulated', label: 'Саниран', icon: <Hammer size={18} weight="bold" /> },
        { id: 'recently-renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
        { id: 'district-heating', label: 'ТЕЦ', icon: <Factory size={18} weight="bold" /> },
    ];

    const HOUSE_FEATURE_FILTERS: FeatureFilter[] = [
        { id: 'all', label: 'Всички', icon: null },
        { id: 'detached', label: 'Самостоятелна', icon: <HouseLine size={18} weight="bold" /> },
        { id: 'pool', label: 'Басейн', icon: <SunHorizon size={18} weight="bold" /> },
        { id: 'bbq', label: 'Барбекю/Беседка', icon: <FireSimple size={18} weight="bold" /> },
        { id: 'renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
        { id: 'customization', label: 'Допълнителни настройки', icon: <Plus size={18} weight="bold" /> },
        { id: 'sewage', label: 'Канализация', icon: <Factory size={18} weight="bold" /> },
        { id: 'electricity', label: 'Ток', icon: <Fire size={18} weight="bold" /> },
        { id: 'water', label: 'Вода', icon: <Thermometer size={18} weight="bold" /> },
        { id: 'well', label: 'Кладенец', icon: <ShieldCheck size={18} weight="bold" /> },
        { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
        { id: 'gasified', label: 'Газифицирана', icon: <Fire size={18} weight="bold" /> },
        { id: 'solar-panels', label: 'Слънчеви колектори', icon: <SolarPanel size={18} weight="bold" /> },
        { id: 'garage', label: 'Гараж', icon: <Car size={18} weight="bold" /> },
        { id: 'fireplace', label: 'Камина', icon: <FireSimple size={18} weight="bold" /> },
        { id: 'timber', label: 'Гредоред', icon: <Hammer size={18} weight="bold" /> },
        { id: 'prefab', label: 'Сглобяема къща', icon: <Cube size={18} weight="bold" /> },
        { id: 'gated-community', label: 'В затворен комплекс', icon: <ShieldCheck size={18} weight="bold" /> },
        { id: 'sea-view', label: 'Панорама море', icon: <SunHorizon size={18} weight="bold" /> },
        { id: 'mountain-view', label: 'Панорама планина', icon: <TreeEvergreen size={18} weight="bold" /> },
    ];

    type HousePrimaryType = {
        id: string;
        label: string;
    };

    type HouseFloorOption = {
        id: string;
        label: string;
    };

    type RangePreset = {
        id: string;
        label: string;
        from: number;
        to: number;
    };

    type YardOption = {
        id: string;
        label: string;
        from: number | null;
        to: number | null;
    };

    const HOUSE_PRIMARY_TYPES: HousePrimaryType[] = [
        { id: 'houses', label: 'Къщи' },
        { id: 'villas', label: 'Вили' },
    ];

    const HOUSE_FLOOR_OPTIONS: HouseFloorOption[] = [
        { id: 'all', label: 'Всички' },
        { id: 'single-floor', label: 'Едноетажна къща' },
        { id: 'two-floor', label: 'Двуетажна къща' },
        { id: 'three-floor', label: 'Триетажна къща' },
        { id: 'house-floor', label: 'Етаж от къща' },
        { id: 'four-plus', label: 'Четириетажна и по-голяма' },
        { id: 'unspecified', label: 'Не е посочено' },
    ];

    const HOUSE_AREA_PRESETS: RangePreset[] = [
        { id: '20-50', label: '20-50', from: 20, to: 50 },
        { id: '50-100', label: '50-100', from: 50, to: 100 },
        { id: '100-150', label: '100-150', from: 100, to: 150 },
        { id: '150-200', label: '150-200', from: 150, to: 200 },
        { id: '200-250', label: '200-250', from: 200, to: 250 },
        { id: '250-300', label: '250-300', from: 250, to: 300 },
        { id: '300-350', label: '300-350', from: 300, to: 350 },
        { id: '350-2000', label: '350-2000', from: 350, to: 2000 },
    ];

    const HOUSE_YARD_OPTIONS: YardOption[] = [
        { id: '0-200', label: '0 - 200', from: 0, to: 200 },
        { id: '200-400', label: '200 - 400', from: 200, to: 400 },
        { id: '400-600', label: '400 - 600', from: 400, to: 600 },
        { id: '600-800', label: '600 - 800', from: 600, to: 800 },
        { id: '800-1000', label: '800 - 1000', from: 800, to: 1000 },
        { id: '1000-21000', label: '1000 - 21000', from: 1000, to: 21000 },
        { id: 'not-provided', label: 'Не е въведено', from: null, to: null },
    ];

    const HOUSE_PRICE_PRESETS: RangePreset[] = [
        { id: '1-60000', label: '1 - 60 000', from: 1, to: 60000 },
        { id: '60000-120000', label: '60 000 - 120 000', from: 60000, to: 120000 },
        { id: '120000-180000', label: '120 000 - 180 000', from: 120000, to: 180000 },
        { id: '180000-240000', label: '180 000 - 240 000', from: 180000, to: 240000 },
        { id: '240000-300000', label: '240 000 - 300 000', from: 240000, to: 300000 },
        { id: '300000-360000', label: '300 000 - 360 000', from: 300000, to: 360000 },
        { id: '360000-420000', label: '360 000 - 420 000', from: 360000, to: 420000 },
        { id: '420000-7500000', label: '420 000 - 7 500 000', from: 420000, to: 7500000 },
    ];

    const CONSTRUCTION_FILTERS: ConstructionFilter[] = [
        { id: 'brick', label: 'Тухла', icon: <Cube size={18} weight="bold" /> },
        { id: 'epk', label: 'ЕПК/ПК', icon: <Factory size={18} weight="bold" /> },
        { id: 'panel', label: 'Панел', icon: <Cube size={18} weight="fill" /> },
        { id: 'wood', label: 'Гредоред', icon: <HouseLine size={18} weight="bold" /> },
        { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
    ];

    const FLOOR_SPECIAL_OPTIONS: FloorSpecialOption[] = [
        { id: 'basement', label: 'Сутерен' },
        { id: 'ground', label: 'Партер' },
        { id: 'first-residential', label: 'Първи жилищен' },
        { id: 'not-last', label: 'Непоследен' },
        { id: 'last', label: 'Последен' },
        { id: 'attic', label: 'Мансарда/Таванско помещение' },
        { id: 'unspecified', label: 'Не е посочено' },
    ];

    const COMPLETION_STATUSES: CompletionStatus[] = [
        { id: 'completed', label: 'Завършен', icon: <CheckCircle size={18} weight="bold" /> },
        { id: 'under-construction', label: 'В строеж', icon: <Hammer size={18} weight="bold" /> },
        { id: 'project', label: 'В проект', icon: <PaintRoller size={18} weight="bold" /> },
        { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
    ];

    const handlePropertyTypeClick = (typeId: string) => {
        const isSelecting = selectedPropertyType !== typeId;
        const wasApartments = selectedPropertyType === 'apartments';
        const newSelectedType = isSelecting ? typeId : null;

        setSelectedPropertyType(newSelectedType);

        // Reset apartment subtypes when deselecting apartments or selecting a different property type
        if (wasApartments || typeId !== 'apartments') {
            setSelectedApartmentSubtypes([]);
        }

        const targetRoute = newSelectedType ? `/map-filters/${newSelectedType}` : '/map-filters';
        router.push(targetRoute);

        // Scroll to city input when selecting a property type
        if (isSelecting && newSelectedType) {
            setTimeout(() => {
                if (cityInputRef.current) {
                    const element = cityInputRef.current;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset;
                    const centerOffset = window.innerHeight / 2;
                    const targetPosition = offsetPosition - centerOffset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        }
    };

    const handleApartmentSubtypeToggle = (subtypeId: string) => {
        if (subtypeId === 'all') {
            // Toggle "all" - if it's selected, deselect everything; if not, select everything
            if (selectedApartmentSubtypes.includes('all')) {
                setSelectedApartmentSubtypes([]);
            } else {
                setSelectedApartmentSubtypes(APARTMENT_SUBTYPES.map(s => s.id));
            }
        } else {
            // Toggle individual subtype
            setSelectedApartmentSubtypes((prev) => {
                const newSelection = prev.includes(subtypeId)
                    ? prev.filter(id => id !== subtypeId)
                    : [...prev.filter(id => id !== 'all'), subtypeId];

                // If all subtypes except "all" are selected, automatically select "all"
                const allSubtypesExceptAll = APARTMENT_SUBTYPES.filter(s => s.id !== 'all').map(s => s.id);
                const hasAllSubtypes = allSubtypesExceptAll.every(id => newSelection.includes(id));

                return hasAllSubtypes ? APARTMENT_SUBTYPES.map(s => s.id) : newSelection;
            });
        }
    };

    const handleHouseTypeToggle = useCallback((typeId: string) => {
        setSelectedHouseTypes((prev) => {
            if (prev.includes(typeId)) {
                const updated = prev.filter((id) => id !== typeId);
                return updated.length === 0 ? prev : updated;
            }
            return [...prev, typeId];
        });
    }, []);

    const handleHouseFloorOptionToggle = useCallback((optionId: string) => {
        if (optionId === 'all') {
            setSelectedHouseFloorOptions(['all']);
            return;
        }

        setSelectedHouseFloorOptions((prev) => {
            const withoutAll = prev.filter((id) => id !== 'all');
            const isSelected = withoutAll.includes(optionId);
            const updated = isSelected ? withoutAll.filter((id) => id !== optionId) : [...withoutAll, optionId];

            return updated.length > 0 ? updated : ['all'];
        });
    }, []);

    const handleHouseAreaPresetSelect = useCallback((presetId: string) => {
        setSelectedHouseAreaPreset((prev) => {
            if (prev === presetId) {
                setAreaFrom(20);
                setAreaTo(isHousesSelected ? HOUSE_AREA_SLIDER_MAX : AREA_SLIDER_MAX);
                return null;
            }

            const preset = HOUSE_AREA_PRESETS.find((item) => item.id === presetId);
            if (preset) {
                setAreaFrom(preset.from);
                setAreaTo(preset.to);
            }

            return presetId;
        });
    }, [isHousesSelected]);

    const handleHouseYardOptionSelect = useCallback((optionId: string) => {
        setSelectedHouseYardOption((prev) => (prev === optionId ? null : optionId));
    }, []);

    const handleHousePricePresetSelect = useCallback((presetId: string) => {
        setSelectedHousePricePreset((prev) => {
            if (prev === presetId) {
                setPriceFrom(0);
                setPriceTo(isHousesSelected ? HOUSE_PRICE_SLIDER_MAX : PRICE_SLIDER_MAX);
                return null;
            }

            const preset = HOUSE_PRICE_PRESETS.find((item) => item.id === presetId);
            if (preset) {
                setPriceFrom(preset.from);
                setPriceTo(Math.min(preset.to, isHousesSelected ? HOUSE_PRICE_SLIDER_MAX : PRICE_SLIDER_MAX));
            }

            return presetId;
        });
    }, [isHousesSelected]);

    const featureFilters = useMemo<FeatureFilter[]>(() => {
        if (isHousesSelected) {
            return HOUSE_FEATURE_FILTERS;
        }
        return APARTMENT_FEATURE_FILTERS;
    }, [isHousesSelected]);

    useEffect(() => {
        const validIds = new Set(featureFilters.map((feature) => feature.id));
        setSelectedFeatures((prev) => {
            const filtered = prev.filter((id) => validIds.has(id));
            return filtered.length === prev.length ? prev : filtered;
        });
    }, [featureFilters]);

    useEffect(() => {
        if (!isHousesSelected || !selectedHouseAreaPreset) {
            return;
        }
        const preset = HOUSE_AREA_PRESETS.find((item) => item.id === selectedHouseAreaPreset);
        if (!preset || preset.from !== areaFrom || preset.to !== areaTo) {
            setSelectedHouseAreaPreset(null);
        }
    }, [areaFrom, areaTo, isHousesSelected, selectedHouseAreaPreset]);

    useEffect(() => {
        if (!isHousesSelected || !selectedHousePricePreset) {
            return;
        }
        const preset = HOUSE_PRICE_PRESETS.find((item) => item.id === selectedHousePricePreset);
        if (!preset || preset.from !== priceFrom || preset.to !== priceTo) {
            setSelectedHousePricePreset(null);
        }
    }, [priceFrom, priceTo, isHousesSelected, selectedHousePricePreset]);

    const handleFeatureToggle = useCallback((featureId: string) => {
        const nonAllFeatures = featureFilters.filter((feature) => feature.id !== 'all').map((feature) => feature.id);

        if (featureId === 'all') {
            const hasAllSelected = nonAllFeatures.every((id) => selectedFeatures.includes(id));

            if (hasAllSelected) {
                setSelectedFeatures([]);
            } else {
                setSelectedFeatures(nonAllFeatures);
            }
            return;
        }

        setSelectedFeatures((prev) => {
            const isSelected = prev.includes(featureId);
            const updated = isSelected ? prev.filter((id) => id !== featureId) : [...prev.filter((id) => id !== 'all'), featureId];

            const hasAllSelected = nonAllFeatures.every((id) => updated.includes(id));

            if (hasAllSelected) {
                return nonAllFeatures;
            }

            return updated;
        });
    }, [featureFilters, selectedFeatures]);

    const handleConstructionToggle = useCallback((constructionId: string) => {
        setSelectedConstructionTypes((prev) =>
            prev.includes(constructionId) ? prev.filter((id) => id !== constructionId) : [...prev, constructionId]
        );
    }, []);

    const handleFloorOptionToggle = useCallback((optionId: string) => {
        setSelectedFloorOptions((prev) =>
            prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
        );
    }, []);

    const handleCompletionStatusToggle = useCallback((statusId: string) => {
        setSelectedCompletionStatuses((prev) =>
            prev.includes(statusId) ? prev.filter((id) => id !== statusId) : [...prev, statusId]
        );
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (selectedPropertyType) {
            params.set('type', selectedPropertyType);
        }
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        if (city.trim()) {
            params.set('city', city.trim());
        }
        if (neighborhoods.length > 0) {
            params.set('neighborhood', neighborhoods.join(','));
        }
        if (distance > 0) {
            params.set('distance', distance.toString());
        }
        if (isApartmentsSelected && selectedApartmentSubtypes.length > 0) {
            params.set('apartmentSubtypes', selectedApartmentSubtypes.join(','));
        }
        if (isHousesSelected) {
            if (selectedHouseTypes.length > 0 && selectedHouseTypes.length !== HOUSE_PRIMARY_TYPES.length) {
                params.set('houseTypes', selectedHouseTypes.join(','));
            }
            if (selectedHouseFloorOptions.length > 0 && !selectedHouseFloorOptions.includes('all')) {
                params.set('houseFloors', selectedHouseFloorOptions.join(','));
            }
            if (selectedHouseAreaPreset) {
                params.set('houseAreaPreset', selectedHouseAreaPreset);
            }
            if (selectedHouseYardOption) {
                params.set('yardRange', selectedHouseYardOption);
            }
            if (selectedHousePricePreset) {
                params.set('housePricePreset', selectedHousePricePreset);
            }
        }
        if (areaFrom !== 20) {
            params.set('areaFrom', areaFrom.toString());
        }
        if (areaTo !== 100) {
            params.set('areaTo', areaTo.toString());
        }
        if (priceFrom > 0) {
            params.set('priceFrom', priceFrom.toString());
        }
        if (priceTo !== priceSliderMax) {
            params.set('priceTo', priceTo.toString());
        }
        if (pricePerSqmFrom > 0) {
            params.set('pricePerSqmFrom', pricePerSqmFrom.toString());
        }
        if (pricePerSqmTo > 0) {
            params.set('pricePerSqmTo', pricePerSqmTo.toString());
        }
        if (selectedFeatures.length > 0) {
            params.set('features', selectedFeatures.join(','));
        }
        if (selectedConstructionTypes.length > 0) {
            params.set('construction', selectedConstructionTypes.join(','));
        }
        if (!isYearNotProvided) {
            if (yearFrom > YEAR_SLIDER_MIN) {
                params.set('yearFrom', yearFrom.toString());
            }
            if (yearTo < YEAR_SLIDER_MAX) {
                params.set('yearTo', yearTo.toString());
            }
        } else {
            params.set('yearNotProvided', 'true');
        }
        if (!isFloorNotProvided) {
            if (floorFrom > FLOOR_SLIDER_MIN) {
                params.set('floorFrom', floorFrom.toString());
            }
            if (floorTo < FLOOR_SLIDER_MAX) {
                params.set('floorTo', floorTo.toString());
            }
        } else {
            params.set('floorNotProvided', 'true');
        }
        if (selectedFloorOptions.length > 0) {
            params.set('floorOptions', selectedFloorOptions.join(','));
        }
        if (selectedCompletionStatuses.length > 0) {
            params.set('completionStatuses', selectedCompletionStatuses.join(','));
        }
        router.push(`/properties?${params.toString()}`);
    };

    const handleClear = () => {
        setSelectedPropertyType(null);
        setSearchTerm('');
        setCity('');
        setNeighborhoods([]);
        setDistance(0);
        setAreaFrom(20);
        setAreaTo(100);
        setPriceFrom(0);
        setPriceTo(PRICE_SLIDER_MAX);
        setPricePerSqmFrom(0);
        setPricePerSqmTo(PRICE_PER_SQM_SLIDER_MAX);
        setSelectedFeatures([]);
        setSelectedConstructionTypes([]);
        setYearFrom(YEAR_SLIDER_MIN);
        setYearTo(YEAR_SLIDER_MAX);
        setIsYearNotProvided(false);
        setFloorFrom(FLOOR_SLIDER_MIN);
        setFloorTo(FLOOR_SLIDER_MAX);
        setIsFloorNotProvided(false);
        setSelectedFloorOptions([]);
        setSelectedCompletionStatuses([]);
        setSelectedApartmentSubtypes([]);
        setSelectedHouseTypes(['houses', 'villas']);
        setSelectedHouseFloorOptions(['all']);
        setSelectedHouseAreaPreset(null);
        setSelectedHouseYardOption(null);
        setSelectedHousePricePreset(null);
        router.push('/map-filters');
    };

    const handleRemoveNeighborhood = useCallback((neighborhoodName: string) => {
        setNeighborhoods((prev) => prev.filter(n => n !== neighborhoodName));
    }, []);

    return (
        <div className={styles.mapFiltersPage}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.header}
                    >
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={20} />
                            Назад
                        </Button>
                        <h1 className={styles.title}>
                            Филтриране на имоти
                        </h1>
                        <p className={styles.subtitle}>
                            Изберете тип имот за да филтрирате резултатите
                        </p>
                    </motion.div>

                    <div className={styles.propertyTypeFiltersSection}>
                        <div className={styles.propertyTypeFilters}>
                            {propertyTypes.map((type) => {
                                const Icon = type.icon;
                                const isActive = selectedPropertyType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        className={`${styles.propertyTypeFilterButton} ${isActive ? styles.active : ''}`}
                                        onClick={() => handlePropertyTypeClick(type.id)}
                                    >
                                        <div className={styles.propertyTypeFilterContent}>
                                            <Icon size={32} weight="fill" />
                                            <span>{type.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedPropertyType && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={styles.filtersMapLayout}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <div className={styles.leftFiltersColumn}>
                                <div className={styles.leftFilters}>
                                    <div className={styles.inputsGrid}>
                                        <Input
                                            id="filters-search"
                                            label="Търсене"
                                            placeholder="Ключова дума или референтен номер"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
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
                                                                            setCity(c.name);
                                                                            setShowCityDropdown(false);
                                                                            handleCityClick(c.name, [c.coordinates[0], c.coordinates[1]]);
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
                                            {trimmedCity && (
                                                <div className={styles.neighborhoodFilter}>
                                                    <div className={styles.autocompleteWrapper}>
                                                        <Input
                                                            id="filters-neighborhood"
                                                            label="Квартал"
                                                            placeholder="Изберете квартал"
                                                            value={neighborhoodSearchTerm}
                                                            onChange={(event) => {
                                                                setNeighborhoodSearchTerm(event.target.value);
                                                                setShowNeighborhoodDropdown(true);
                                                            }}
                                                            onFocus={() => {
                                                                if (trimmedCity) {
                                                                    setShowNeighborhoodDropdown(true);
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                // Delay hiding dropdown to allow click on dropdown item
                                                                setTimeout(() => {
                                                                    if (!neighborhoodDropdownRef.current?.contains(document.activeElement)) {
                                                                        setShowNeighborhoodDropdown(false);
                                                                    }
                                                                }, 200);
                                                            }}
                                                            ref={neighborhoodInputRef}
                                                            className={styles.filterInput}
                                                        />
                                                        {showNeighborhoodDropdown && trimmedCity && (
                                                            <div
                                                                ref={neighborhoodDropdownRef}
                                                                className={styles.neighborhoodDropdown}
                                                            >
                                                                {getNeighborhoodsForCity(trimmedCity)
                                                                    .filter((n) => {
                                                                        const searchTerm = neighborhoodSearchTerm.toLowerCase().trim();
                                                                        if (!searchTerm) return true;
                                                                        return n.name.toLowerCase().includes(searchTerm) ||
                                                                            n.nameEn.toLowerCase().includes(searchTerm);
                                                                    })
                                                                    .map((n) => {
                                                                        const isSelected = neighborhoods.includes(n.name);
                                                                        return (
                                                                            <label
                                                                                key={n.id}
                                                                                className={styles.neighborhoodDropdownItem}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            setNeighborhoods((prev) => [...prev, n.name]);
                                                                                        } else {
                                                                                            setNeighborhoods((prev) => prev.filter(name => name !== n.name));
                                                                                        }
                                                                                    }}
                                                                                    onMouseDown={(e) => {
                                                                                        e.preventDefault(); // Prevent input blur
                                                                                    }}
                                                                                />
                                                                                <span>{n.name}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                {getNeighborhoodsForCity(trimmedCity).length === 0 && (
                                                                    <div className={styles.noNeighborhoodsMessage}>
                                                                        Няма налични квартали за този град
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
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
                                            {showDistanceFilter && (
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
                                                            onChange={(e) => setDistance(Number(e.target.value))}
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
                                                                    setDistance(val);
                                                                }
                                                            }}
                                                            className={styles.distanceInput}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>


                                {isApartmentsSelected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={styles.leftFilters}
                                    >
                                        <div className={styles.apartmentSubtypeFilter}>
                                            <h4 className={styles.apartmentSubtypeTitle}>Вид на имота</h4>
                                            <div className={styles.apartmentSubtypeOptions}>
                                                {(() => {
                                                    const [allSubtype, ...otherSubtypes] = APARTMENT_SUBTYPES;
                                                    const subtypeMap = new Map(otherSubtypes.map(subtype => [subtype.id, subtype]));
                                                    const leftOrder = ['studio', 'two-bedroom', 'maisonette', 'attic'];
                                                    const rightOrder = ['one-bedroom', 'multi-bedroom', 'atelier'];

                                                    const leftColumnSubtypes = leftOrder
                                                        .map(id => subtypeMap.get(id))
                                                        .filter((subtype): subtype is ApartmentSubtype => Boolean(subtype));

                                                    const rightColumnSubtypes = rightOrder
                                                        .map(id => subtypeMap.get(id))
                                                        .filter((subtype): subtype is ApartmentSubtype => Boolean(subtype));

                                                    const usedSubtypeIds = new Set(['all', ...leftColumnSubtypes.map(s => s.id), ...rightColumnSubtypes.map(s => s.id)]);

                                                    const remainingSubtypes = otherSubtypes.filter(subtype => !usedSubtypeIds.has(subtype.id));

                                                    remainingSubtypes.forEach((subtype, index) => {
                                                        if (index % 2 === 0) {
                                                            leftColumnSubtypes.push(subtype);
                                                        } else {
                                                            rightColumnSubtypes.push(subtype);
                                                        }
                                                    });

                                                    const maxRows = Math.max(leftColumnSubtypes.length, rightColumnSubtypes.length);

                                                    return (
                                                        <>
                                                            {allSubtype && (
                                                                <label
                                                                    key={allSubtype.id}
                                                                    className={`${styles.apartmentSubtypeOption} ${styles.allOption}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedApartmentSubtypes.includes(allSubtype.id)}
                                                                        onChange={() => handleApartmentSubtypeToggle(allSubtype.id)}
                                                                        className={styles.apartmentSubtypeCheckbox}
                                                                    />
                                                                    <span className={styles.apartmentSubtypeLabel}>
                                                                        {allSubtype.label}
                                                                    </span>
                                                                </label>
                                                            )}

                                                            <div className={styles.apartmentSubtypeRows}>
                                                                {Array.from({ length: maxRows }).map((_, rowIndex) => {
                                                                    const leftSubtype = leftColumnSubtypes[rowIndex];
                                                                    const rightSubtype = rightColumnSubtypes[rowIndex];
                                                                    const isLeftChecked = leftSubtype
                                                                        ? selectedApartmentSubtypes.includes(leftSubtype.id)
                                                                        : false;
                                                                    const isRightChecked = rightSubtype
                                                                        ? selectedApartmentSubtypes.includes(rightSubtype.id)
                                                                        : false;

                                                                    return (
                                                                        <div key={`apartment-subtype-row-${rowIndex}`} className={styles.apartmentSubtypeRow}>
                                                                            {leftSubtype ? (
                                                                                <label
                                                                                    className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionLeft}`}
                                                                                    key={`${leftSubtype.id}-left-${rowIndex}`}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isLeftChecked}
                                                                                        onChange={() => handleApartmentSubtypeToggle(leftSubtype.id)}
                                                                                        className={styles.apartmentSubtypeCheckbox}
                                                                                    />
                                                                                    <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelLeft}`}>
                                                                                        {leftSubtype.label}
                                                                                        {leftSubtype.icon && (
                                                                                            <span className={styles.apartmentSubtypeIconGroup}>
                                                                                                {leftSubtype.icon}
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                </label>
                                                                            ) : (
                                                                                <span className={styles.apartmentSubtypePlaceholder} />
                                                                            )}

                                                                            <span className={styles.apartmentSubtypeSeparator} aria-hidden="true" />

                                                                            {rightSubtype ? (
                                                                                <label
                                                                                    className={`${styles.apartmentSubtypeOption} ${styles.apartmentSubtypeOptionRight}`}
                                                                                    key={`${rightSubtype.id}-right-${rowIndex}`}
                                                                                >
                                                                                    <span className={`${styles.apartmentSubtypeLabel} ${styles.apartmentSubtypeLabelRight}`}>
                                                                                        {rightSubtype.icon && (
                                                                                            <span className={`${styles.apartmentSubtypeIconGroup} ${styles.apartmentSubtypeIconGroupRight}`}>
                                                                                                {rightSubtype.icon}
                                                                                            </span>
                                                                                        )}
                                                                                        {rightSubtype.label}
                                                                                    </span>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isRightChecked}
                                                                                        onChange={() => handleApartmentSubtypeToggle(rightSubtype.id)}
                                                                                        className={styles.apartmentSubtypeCheckbox}
                                                                                    />
                                                                                </label>
                                                                            ) : (
                                                                                <span className={styles.apartmentSubtypePlaceholder} />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {isHousesSelected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={styles.leftFilters}
                                    >
                                        <div className={styles.houseTypeFilter}>
                                            <h4 className={styles.houseSectionTitle}>Къщи / Вили</h4>
                                            <div className={styles.houseTypeOptions}>
                                                {HOUSE_PRIMARY_TYPES.map((type) => {
                                                    const isSelected = selectedHouseTypes.includes(type.id);
                                                    return (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            className={`${styles.rangePresetButton} ${isSelected ? styles.rangePresetButtonActive : ''}`}
                                                            onClick={() => handleHouseTypeToggle(type.id)}
                                                        >
                                                            {type.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className={styles.houseFloorFilter}>
                                            <h4 className={styles.houseSectionTitle}>Етажност</h4>
                                            <div className={styles.houseFloorOptions}>
                                                {HOUSE_FLOOR_OPTIONS.map((option) => {
                                                    const isSelected = selectedHouseFloorOptions.includes(option.id);
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            className={`${styles.rangePresetButton} ${isSelected ? styles.rangePresetButtonActive : ''}`}
                                                            onClick={() => handleHouseFloorOptionToggle(option.id)}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div
                                    className={`${styles.leftFilters} ${styles.areaLeftFilters}`}
                                    style={areaLeftFiltersStyle}
                                >
                                    <div className={styles.areaFilter}>
                                        <h4 className={styles.areaTitle}>{isHousesSelected ? 'РЗП кв.м' : 'Площ в кв.м'}</h4>
                                        <div className={styles.areaControls}>
                                            <div className={styles.dualRangeSlider}>
                                                <input
                                                    type="range"
                                                    id="area-slider-from"
                                                    min="0"
                                                    max={areaSliderMax}
                                                    step="1"
                                                    value={areaFrom}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val <= areaTo) {
                                                            setAreaFrom(val);
                                                        }
                                                    }}
                                                    className={`${styles.areaSlider} ${styles.areaSliderFrom}`}
                                                    style={{
                                                        '--slider-value': `${(Math.min(areaFrom, areaSliderMax) / areaSliderMax) * 100}%`,
                                                        '--slider-to-value': `${(Math.min(areaTo, areaSliderMax) / areaSliderMax) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                                <input
                                                    type="range"
                                                    id="area-slider-to"
                                                    min="0"
                                                    max={areaSliderMax}
                                                    step="1"
                                                    value={areaTo}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val >= areaFrom) {
                                                            setAreaTo(val);
                                                        }
                                                    }}
                                                    className={`${styles.areaSlider} ${styles.areaSliderTo}`}
                                                    style={{
                                                        '--slider-value': `${(Math.min(areaTo, areaSliderMax) / areaSliderMax) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <div className={styles.areaInputs}>
                                                <div className={styles.areaInputWrapper}>
                                                    <label htmlFor="area-from" className={styles.areaInputLabel}>
                                                        От
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="area-from"
                                                        min="0"
                                                        value={areaFrom}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val) && val >= 0 && val <= areaTo) {
                                                                setAreaFrom(val);
                                                            }
                                                        }}
                                                        className={styles.areaInput}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className={styles.areaInputWrapper}>
                                                    <label htmlFor="area-to" className={styles.areaInputLabel}>
                                                        До
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="area-to"
                                                        min={areaFrom}
                                                        value={areaTo}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val) && val >= areaFrom) {
                                                                setAreaTo(val);
                                                            }
                                                        }}
                                                        className={styles.areaInput}
                                                        placeholder={(isHousesSelected ? areaSliderMax : SQUARE_AREA_CAP).toString()}
                                                    />
                                                </div>
                                            </div>
                                            {isHousesSelected && (
                                                <div className={styles.rangePresetGrid}>
                                                    {HOUSE_AREA_PRESETS.map((preset) => {
                                                        const isSelected = selectedHouseAreaPreset === preset.id;
                                                        return (
                                                            <button
                                                                key={preset.id}
                                                                type="button"
                                                                className={`${styles.rangePresetButton} ${isSelected ? styles.rangePresetButtonActive : ''}`}
                                                                onClick={() => handleHouseAreaPresetSelect(preset.id)}
                                                            >
                                                                {preset.label} кв.м
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={styles.bedTopViewWrapper}
                                            style={bedWrapperStyle}
                                        >
                                            <motion.div
                                                className={`${styles.bedTopViewSquare} ${isFromSmaller
                                                    ? styles.bedTopViewSquareYellow
                                                    : styles.bedTopViewSquareRed
                                                    }`}
                                                initial={{ width: 0, height: 0 }}
                                                animate={{
                                                    width: squareSideFrom,
                                                    height: squareSideFrom
                                                }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            />
                                            <motion.div
                                                className={`${styles.bedTopViewSquare} ${isToSmaller
                                                    ? styles.bedTopViewSquareYellow
                                                    : styles.bedTopViewSquareRed
                                                    }`}
                                                initial={{ width: 0, height: 0 }}
                                                animate={{
                                                    width: squareSideTo,
                                                    height: squareSideTo
                                                }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            />
                                            <Image
                                                src="/bed-top-view.svg"
                                                alt="Bed top view illustration"
                                                width={200}
                                                height={60}
                                                className={styles.bedTopViewImage}
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isHousesSelected && (
                                    <div className={styles.leftFilters}>
                                        <div className={styles.houseYardFilter}>
                                            <h4 className={styles.houseSectionTitle}>Двор кв.м</h4>
                                            <div className={styles.houseYardOptions}>
                                                {HOUSE_YARD_OPTIONS.map((option) => {
                                                    const isSelected = selectedHouseYardOption === option.id;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            className={`${styles.rangePresetButton} ${isSelected ? styles.rangePresetButtonActive : ''}`}
                                                            onClick={() => handleHouseYardOptionSelect(option.id)}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.leftFilters}>
                                    <div className={styles.priceFilter}>
                                        <h4 className={styles.priceTitle}>Цена (€)</h4>
                                        <div className={styles.priceControls}>
                                            <div className={styles.dualRangeSlider}>
                                                <input
                                                    type="range"
                                                    id="price-slider-from"
                                                    min="0"
                                                    max={priceSliderMax}
                                                    step="1000"
                                                    value={priceFromClamped}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            const clamped = Math.max(0, Math.min(val, priceSliderMax));
                                                            setPriceFrom(clamped);
                                                            if (clamped > priceTo) {
                                                                setPriceTo(clamped);
                                                            }
                                                        }
                                                    }}
                                                    className={`${styles.priceSlider} ${styles.priceSliderFrom}`}
                                                    style={{
                                                        '--slider-value': `${(priceFromClamped / priceSliderMax) * 100}%`,
                                                        '--slider-to-value': `${(priceToClamped / priceSliderMax) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                                <input
                                                    type="range"
                                                    id="price-slider-to"
                                                    min="0"
                                                    max={priceSliderMax}
                                                    step="1000"
                                                    value={priceToClamped}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            const clamped = Math.max(0, Math.min(val, priceSliderMax));
                                                            if (clamped < priceFromClamped) {
                                                                setPriceFrom(clamped);
                                                                setPriceTo(clamped);
                                                            } else {
                                                                setPriceTo(clamped);
                                                            }
                                                        }
                                                    }}
                                                    className={`${styles.priceSlider} ${styles.priceSliderTo}`}
                                                    style={{
                                                        '--slider-value': `${(priceToClamped / priceSliderMax) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <div className={styles.priceInputs}>
                                                <div className={styles.priceInputWrapper}>
                                                    <label htmlFor="price-from" className={styles.priceInputLabel}>
                                                        От
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="price-from"
                                                        min={0}
                                                        value={priceFrom}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val) && val >= 0) {
                                                                setPriceFrom(val);
                                                                if (val > priceTo) {
                                                                    setPriceTo(val);
                                                                }
                                                            }
                                                        }}
                                                        className={styles.priceInput}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className={styles.pricePiggyBankWrapper} aria-hidden="true">
                                                    <PiggyBank
                                                        className={styles.pricePiggyBankIcon}
                                                        size={piggyBankSize}
                                                    />
                                                </div>
                                                <div className={styles.priceInputWrapper}>
                                                    <label htmlFor="price-to" className={styles.priceInputLabel}>
                                                        До
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="price-to"
                                                        min={0}
                                                        value={priceTo}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val) && val >= 0) {
                                                                if (val < priceFrom) {
                                                                    setPriceFrom(val);
                                                                    setPriceTo(val);
                                                                } else {
                                                                    setPriceTo(val);
                                                                }
                                                            }
                                                        }}
                                                        className={styles.priceInput}
                                                        placeholder={priceSliderMax.toString()}
                                                    />
                                                </div>
                                            </div>
                                            {isHousesSelected && (
                                                <div className={styles.rangePresetGrid}>
                                                    {HOUSE_PRICE_PRESETS.map((preset) => {
                                                        const isSelected = selectedHousePricePreset === preset.id;
                                                        return (
                                                            <button
                                                                key={preset.id}
                                                                type="button"
                                                                className={`${styles.rangePresetButton} ${isSelected ? styles.rangePresetButtonActive : ''}`}
                                                                onClick={() => handleHousePricePresetSelect(preset.id)}
                                                            >
                                                                {preset.label} €
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <div className={styles.pricePerSqmContainer}>
                                                <h4 className={styles.pricePerSqmTitle}>Цена на кв.м (€)</h4>
                                                <div className={styles.dualRangeSlider}>
                                                    <input
                                                        type="range"
                                                        id="price-per-sqm-slider-from"
                                                        min="0"
                                                        max={PRICE_PER_SQM_SLIDER_MAX}
                                                        step="10"
                                                        value={pricePerSqmFromClamped}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.max(0, Math.min(val, PRICE_PER_SQM_SLIDER_MAX));
                                                                setPricePerSqmFrom(clamped);
                                                                if (clamped > pricePerSqmTo) {
                                                                    setPricePerSqmTo(clamped);
                                                                }
                                                            }
                                                        }}
                                                        className={`${styles.pricePerSqmSlider} ${styles.pricePerSqmSliderFrom}`}
                                                        style={{
                                                            '--slider-value': `${(pricePerSqmFromClamped / PRICE_PER_SQM_SLIDER_MAX) * 100}%`,
                                                            '--slider-to-value': `${(pricePerSqmToClamped / PRICE_PER_SQM_SLIDER_MAX) * 100}%`
                                                        } as React.CSSProperties}
                                                    />
                                                    <input
                                                        type="range"
                                                        id="price-per-sqm-slider-to"
                                                        min="0"
                                                        max={PRICE_PER_SQM_SLIDER_MAX}
                                                        step="10"
                                                        value={pricePerSqmToClamped}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.max(0, Math.min(val, PRICE_PER_SQM_SLIDER_MAX));
                                                                if (clamped < pricePerSqmFromClamped) {
                                                                    setPricePerSqmFrom(clamped);
                                                                    setPricePerSqmTo(clamped);
                                                                } else {
                                                                    setPricePerSqmTo(clamped);
                                                                }
                                                            }
                                                        }}
                                                        className={`${styles.pricePerSqmSlider} ${styles.pricePerSqmSliderTo}`}
                                                        style={{
                                                            '--slider-value': `${(pricePerSqmToClamped / PRICE_PER_SQM_SLIDER_MAX) * 100}%`
                                                        } as React.CSSProperties}
                                                    />
                                                </div>
                                                <div className={styles.priceInputs}>
                                                    <div className={styles.priceInputWrapper}>
                                                        <label htmlFor="price-per-sqm-from" className={styles.priceInputLabel}>
                                                            От
                                                        </label>
                                                        <input
                                                            type="number"
                                                            id="price-per-sqm-from"
                                                            min={0}
                                                            value={pricePerSqmFrom}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                if (!isNaN(val) && val >= 0) {
                                                                    setPricePerSqmFrom(val);
                                                                    if (val > pricePerSqmTo) {
                                                                        setPricePerSqmTo(val);
                                                                    }
                                                                }
                                                            }}
                                                            className={styles.priceInput}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className={styles.pricePiggyBankWrapper} aria-hidden="true">
                                                        <PiggyBank
                                                            className={styles.pricePiggyBankIcon}
                                                            size={piggyBankSqmSize}
                                                        />
                                                    </div>
                                                    <div className={styles.priceInputWrapper}>
                                                        <label htmlFor="price-per-sqm-to" className={styles.priceInputLabel}>
                                                            До
                                                        </label>
                                                        <input
                                                            type="number"
                                                            id="price-per-sqm-to"
                                                            min={0}
                                                            value={pricePerSqmTo}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                if (!isNaN(val) && val >= 0) {
                                                                    if (val < pricePerSqmFrom) {
                                                                        setPricePerSqmFrom(val);
                                                                        setPricePerSqmTo(val);
                                                                    } else {
                                                                        setPricePerSqmTo(val);
                                                                    }
                                                                }
                                                            }}
                                                            className={styles.priceInput}
                                                            placeholder={PRICE_PER_SQM_SLIDER_MAX.toString()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.rightColumn}>
                                <div className={styles.mapWrapper}>
                                    <div
                                        className={styles.mapContainer}
                                        ref={mapContainer}
                                        style={{ width: '100%', height: '70vh', minHeight: '600px' }}
                                    >
                                        {!isCitySelectionMode && (
                                            <button
                                                type="button"
                                                className={styles.mapBackButton}
                                                onClick={handleBackToCities}
                                            >
                                                Обратно към градове
                                            </button>
                                        )}
                                        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                                            <LoadScript
                                                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                                                loadingElement={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>}
                                            >
                                                <GoogleMap
                                                    mapContainerStyle={mapContainerStyle}
                                                    center={defaultCenter}
                                                    zoom={10}
                                                    onLoad={(mapInstance) => setMap(mapInstance)}
                                                    options={{
                                                        disableDefaultUI: false,
                                                        zoomControl: true,
                                                        streetViewControl: false,
                                                        mapTypeControl: false,
                                                        fullscreenControl: true,
                                                        gestureHandling: 'greedy', // Allow scroll zoom without Ctrl
                                                        styles: [
                                                            {
                                                                featureType: 'administrative.neighborhood',
                                                                elementType: 'labels',
                                                                stylers: [{ visibility: 'off' }],
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    {/* City markers - Burgas municipality cities */}
                                                    {map && burgasCities.cities.map((city) => {
                                                        // Create custom icon using SVG
                                                        const iconSize = city.type === 'major' ? 14 : city.type === 'medium' ? 12 : 10;
                                                        const svgIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                                                        <svg width="${iconSize * 2}" height="${iconSize * 2}" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="${iconSize}" cy="${iconSize}" r="${iconSize - 3}" fill="#8c1c1c" stroke="#ffffff" stroke-width="3"/>
                                                        </svg>
                                                    `)}`;

                                                        // Use proper Google Maps types - google is available after map loads
                                                        const iconConfig: google.maps.Icon = {
                                                            url: svgIcon,
                                                            scaledSize: new google.maps.Size(iconSize * 2, iconSize * 2),
                                                            anchor: new google.maps.Point(iconSize, iconSize),
                                                        };

                                                        return (
                                                            <Marker
                                                                key={city.id}
                                                                position={{
                                                                    lat: city.coordinates[0],
                                                                    lng: city.coordinates[1]
                                                                }}
                                                                title={city.name}
                                                                onClick={() => {
                                                                    handleCityClick(city.name, [city.coordinates[0], city.coordinates[1]]);
                                                                }}
                                                                icon={iconConfig}
                                                            />
                                                        );
                                                    })}

                                                    {map && !isCitySelectionMode && cityCoordinates && distance > 0 && (
                                                        <Circle
                                                            center={{
                                                                lat: cityCoordinates[0],
                                                                lng: cityCoordinates[1]
                                                            }}
                                                            radius={distance * 1000}
                                                            options={{
                                                                strokeColor: '#8c1c1c',
                                                                strokeOpacity: 0.8,
                                                                strokeWeight: 2,
                                                                fillColor: '#8c1c1c',
                                                                fillOpacity: 0.15,
                                                                clickable: false,
                                                                zIndex: 900,
                                                            }}
                                                        />
                                                    )}

                                                    {/* Neighborhood polygons - show when city is selected */}
                                                    {map && trimmedCity && getNeighborhoodPolygons(trimmedCity).map((feature: any) => {
                                                        const neighborhoodName = feature.properties?.name || '';
                                                        const isSelected = neighborhoods.includes(neighborhoodName);

                                                        // Convert GeoJSON coordinates to Google Maps LatLng format
                                                        // GeoJSON is [lng, lat], Google Maps needs {lat, lng}
                                                        const paths = feature.geometry.coordinates[0].map((coord: number[]) => ({
                                                            lat: coord[1],
                                                            lng: coord[0]
                                                        }));

                                                        const centroid = calculatePolygonCentroid(paths);

                                                        return (
                                                            <Fragment key={feature.properties?.id || feature.id}>
                                                                <Polygon
                                                                    paths={paths}
                                                                    options={{
                                                                        fillColor: isSelected ? '#8c1c1c' : 'transparent',
                                                                        fillOpacity: isSelected ? 0.3 : 0,
                                                                        strokeColor: isSelected ? '#8c1c1c' : '#666',
                                                                        strokeOpacity: isSelected ? 0.8 : 0.5,
                                                                        strokeWeight: isSelected ? 3 : 2,
                                                                        clickable: true,
                                                                        zIndex: isSelected ? 1000 : 500,
                                                                    }}
                                                                    onClick={() => {
                                                                        if (neighborhoodName) {
                                                                            handleNeighborhoodClick(neighborhoodName);
                                                                        }
                                                                    }}
                                                                />
                                                                {centroid && (
                                                                    <OverlayView
                                                                        position={centroid}
                                                                        mapPaneName={OverlayView.OVERLAY_LAYER}
                                                                        getPixelPositionOffset={(width, height) => ({
                                                                            x: width ? -(width / 2) : 0,
                                                                            y: height ? -(height / 2) : 0,
                                                                        })}
                                                                    >
                                                                        <div className={styles.neighborhoodLabel}>
                                                                            {neighborhoodName}
                                                                        </div>
                                                                    </OverlayView>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    })}
                                                </GoogleMap>
                                            </LoadScript>
                                        )}
                                        <div className={styles.mapControls}>
                                            <button
                                                type="button"
                                                className={styles.mapControlButton}
                                                onClick={handleZoomIn}
                                                aria-label="Zoom in"
                                            >
                                                <Plus size={16} weight="bold" />
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.mapControlButton}
                                                onClick={handleZoomOut}
                                                aria-label="Zoom out"
                                            >
                                                <Minus size={16} weight="bold" />
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.mapControlButton} ${styles.mapControlButtonAccent}`}
                                                onClick={handleDetectLocation}
                                                disabled={isDetectingLocation}
                                                aria-label="Detect current location"
                                            >
                                                <CrosshairSimple size={16} weight="bold" />
                                            </button>
                                        </div>
                                        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                                            <div style={{
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#666',
                                                fontSize: '1.1rem'
                                            }}>
                                                Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.rightFilters}>
                                    <div className={styles.featuresFilter}>
                                        <h4 className={styles.featuresTitle}>Особености</h4>
                                        <div className={styles.featuresGrid}>
                                            {featureFilters.map((feature) => {
                                                const isSelected = selectedFeatures.includes(feature.id);
                                                return (
                                                    <button
                                                        key={feature.id}
                                                        type="button"
                                                        className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                                                        onClick={() => handleFeatureToggle(feature.id)}
                                                    >
                                                        {feature.icon && (
                                                            <span className={styles.featureIcon}>{feature.icon}</span>
                                                        )}
                                                        <span className={styles.featureLabel}>{feature.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.rightFilters}>
                                    <div className={styles.constructionFilter}>
                                        <h4 className={styles.featuresTitle}>Вид строителство</h4>
                                        <div className={styles.constructionGrid}>
                                            {CONSTRUCTION_FILTERS.map((type) => {
                                                const isSelected = selectedConstructionTypes.includes(type.id);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                                                        onClick={() => handleConstructionToggle(type.id)}
                                                    >
                                                        {type.icon && (
                                                            <span className={styles.featureIcon}>{type.icon}</span>
                                                        )}
                                                        <span className={styles.featureLabel}>{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className={styles.yearFilter}>
                                        <h4 className={styles.featuresTitle}>Година на строителство</h4>
                                        <div className={styles.yearControls}>
                                            <div className={styles.dualRangeSlider}>
                                                <input
                                                    type="range"
                                                    min={YEAR_SLIDER_MIN}
                                                    max={YEAR_SLIDER_MAX}
                                                    step={1}
                                                    value={Math.min(yearFrom, yearTo)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            setIsYearNotProvided(false);
                                                            setYearFrom(Math.min(val, yearTo));
                                                        }
                                                    }}
                                                    className={`${styles.yearSlider} ${styles.yearSliderFrom}`}
                                                    style={{
                                                        '--slider-value': `${((Math.min(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`,
                                                        '--slider-to-value': `${((Math.max(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                                <input
                                                    type="range"
                                                    min={YEAR_SLIDER_MIN}
                                                    max={YEAR_SLIDER_MAX}
                                                    step={1}
                                                    value={Math.max(yearFrom, yearTo)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            setIsYearNotProvided(false);
                                                            setYearTo(Math.max(val, yearFrom));
                                                        }
                                                    }}
                                                    className={`${styles.yearSlider} ${styles.yearSliderTo}`}
                                                    style={{
                                                        '--slider-value': `${((Math.max(yearFrom, yearTo) - YEAR_SLIDER_MIN) / (YEAR_SLIDER_MAX - YEAR_SLIDER_MIN)) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <div className={styles.yearInputsRow}>
                                                <div className={styles.yearInputWrapper}>
                                                    <label htmlFor="year-from" className={styles.yearInputLabel}>
                                                        От
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="year-from"
                                                        min={YEAR_SLIDER_MIN}
                                                        max={YEAR_SLIDER_MAX}
                                                        value={yearFrom}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.max(YEAR_SLIDER_MIN, Math.min(val, yearTo));
                                                                setIsYearNotProvided(false);
                                                                setYearFrom(clamped);
                                                            }
                                                        }}
                                                        className={styles.yearInput}
                                                    />
                                                </div>
                                                <div className={styles.yearInputWrapper}>
                                                    <label htmlFor="year-to" className={styles.yearInputLabel}>
                                                        До
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="year-to"
                                                        min={YEAR_SLIDER_MIN}
                                                        max={YEAR_SLIDER_MAX}
                                                        value={yearTo}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.min(YEAR_SLIDER_MAX, Math.max(val, yearFrom));
                                                                setIsYearNotProvided(false);
                                                                setYearTo(clamped);
                                                            }
                                                        }}
                                                        className={styles.yearInput}
                                                    />
                                                </div>
                                                <label className={styles.yearNotProvided}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isYearNotProvided}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setIsYearNotProvided(checked);
                                                            if (checked) {
                                                                setYearFrom(YEAR_SLIDER_MIN);
                                                                setYearTo(YEAR_SLIDER_MAX);
                                                            }
                                                        }}
                                                    />
                                                    Не е посочено
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.rightFilters}>
                                    <div className={styles.floorFilter}>
                                        <h4 className={styles.featuresTitle}>Етаж</h4>
                                        <div className={styles.floorControls}>
                                            <div className={styles.dualRangeSlider}>
                                                <input
                                                    type="range"
                                                    min={FLOOR_SLIDER_MIN}
                                                    max={FLOOR_SLIDER_MAX}
                                                    step={1}
                                                    value={Math.min(floorFrom, floorTo)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            setIsFloorNotProvided(false);
                                                            setFloorFrom(Math.min(val, floorTo));
                                                        }
                                                    }}
                                                    className={`${styles.yearSlider} ${styles.yearSliderFrom}`}
                                                    style={{
                                                        '--slider-value': `${((Math.min(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`,
                                                        '--slider-to-value': `${((Math.max(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                                <input
                                                    type="range"
                                                    min={FLOOR_SLIDER_MIN}
                                                    max={FLOOR_SLIDER_MAX}
                                                    step={1}
                                                    value={Math.max(floorFrom, floorTo)}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (!isNaN(val)) {
                                                            setIsFloorNotProvided(false);
                                                            setFloorTo(Math.max(val, floorFrom));
                                                        }
                                                    }}
                                                    className={`${styles.yearSlider} ${styles.yearSliderTo}`}
                                                    style={{
                                                        '--slider-value': `${((Math.max(floorFrom, floorTo) - FLOOR_SLIDER_MIN) / (FLOOR_SLIDER_MAX - FLOOR_SLIDER_MIN)) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <div className={styles.yearInputsRow}>
                                                <div className={styles.yearInputWrapper}>
                                                    <label htmlFor="floor-from" className={styles.yearInputLabel}>
                                                        От
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="floor-from"
                                                        min={FLOOR_SLIDER_MIN}
                                                        max={FLOOR_SLIDER_MAX}
                                                        value={floorFrom}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.max(FLOOR_SLIDER_MIN, Math.min(val, floorTo));
                                                                setIsFloorNotProvided(false);
                                                                setFloorFrom(clamped);
                                                            }
                                                        }}
                                                        className={styles.yearInput}
                                                    />
                                                </div>
                                                <div className={styles.yearInputWrapper}>
                                                    <label htmlFor="floor-to" className={styles.yearInputLabel}>
                                                        До
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="floor-to"
                                                        min={FLOOR_SLIDER_MIN}
                                                        max={FLOOR_SLIDER_MAX}
                                                        value={floorTo}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.min(FLOOR_SLIDER_MAX, Math.max(val, floorFrom));
                                                                setIsFloorNotProvided(false);
                                                                setFloorTo(clamped);
                                                            }
                                                        }}
                                                        className={styles.yearInput}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.floorOptions}>
                                                {FLOOR_SPECIAL_OPTIONS.map((option) => {
                                                    const isSelected = selectedFloorOptions.includes(option.id);
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            className={`${styles.floorOptionButton} ${isSelected ? styles.floorOptionButtonActive : ''}`}
                                                            onClick={() => {
                                                                setIsFloorNotProvided(false);
                                                                handleFloorOptionToggle(option.id);
                                                            }}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.rightFilters}>
                                    <div className={styles.completionFilter}>
                                        <h4 className={styles.featuresTitle}>Степен на завършеност</h4>
                                        <div className={styles.completionGrid}>
                                            {COMPLETION_STATUSES.map((status) => {
                                                const isSelected = selectedCompletionStatuses.includes(status.id);
                                                return (
                                                    <button
                                                        key={status.id}
                                                        type="button"
                                                        className={`${styles.featureButton} ${isSelected ? styles.featureButtonActive : ''}`}
                                                        onClick={() => handleCompletionStatusToggle(status.id)}
                                                    >
                                                        {status.icon && (
                                                            <span className={styles.featureIcon}>{status.icon}</span>
                                                        )}
                                                        <span className={styles.featureLabel}>{status.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedPropertyType && (
                        <div className={styles.actions}>
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                disabled={
                                    !selectedPropertyType &&
                                    !searchTerm.trim() &&
                                    !city.trim() &&
                                    neighborhoods.length === 0
                                }
                            >
                                Изчисти
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSearch}
                                disabled={
                                    !selectedPropertyType &&
                                    !searchTerm.trim() &&
                                    !city.trim() &&
                                    neighborhoods.length === 0
                                }
                            >
                                Търси имоти
                            </Button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

