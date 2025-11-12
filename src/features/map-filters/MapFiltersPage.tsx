'use client';

import { useState, useRef, useEffect, type ReactNode, type CSSProperties, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { ArrowLeft, Bed, Infinity, HouseLine, Palette, SolarPanel } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { propertyTypes } from '@/data/propertyTypes';
import burgasCities from '@/data/burgasCities.json';
import burgasNeighborhoods from '@/data/burgasNeighborhoods.json';
import citiesNeighborhoods from '@/data/citiesNeighborhoods.json';
import styles from './MapFiltersPage.module.scss';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const AREA_SLIDER_MAX = 500;
const SQUARE_AREA_CAP = 225;

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



export function MapFiltersPage() {
    const router = useRouter();
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [city, setCity] = useState('');
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [distance, setDistance] = useState(0);
    const [areaFrom, setAreaFrom] = useState(20);
    const [areaTo, setAreaTo] = useState(100);
    const [selectedApartmentSubtypes, setSelectedApartmentSubtypes] = useState<string[]>([]);
    const [cityCoordinates, setCityCoordinates] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([42.5048, 27.4626]);
    const [osmNeighborhoods, setOsmNeighborhoods] = useState<any>(null);
    const [selectedCityName, setSelectedCityName] = useState<string>('');
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
    const cityInputRef = useRef<HTMLDivElement>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const isApartmentsSelected = selectedPropertyType === 'apartments';
    const trimmedCity = city.trim();
    const showDistanceFilter = isApartmentsSelected && trimmedCity.length >= 3;
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

    // Initialize from URL parameters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeFromUrl = params.get('type');
            if (typeFromUrl) {
                setSelectedPropertyType(typeFromUrl);
            }
        }
    }, []);

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

    // Update map center when mapCenter state changes
    useEffect(() => {
        if (map && mapCenter) {
            map.panTo({
                lat: mapCenter[0],
                lng: mapCenter[1]
            });
        }
    }, [map, mapCenter]);


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
                return;
            }

            // For other cities, don't populate city input
            setSelectedCityName('');
            setOsmNeighborhoods(null);
            setCityCoordinates([foundCity.coordinates[0], foundCity.coordinates[1]]);
            setMapCenter([foundCity.coordinates[0], foundCity.coordinates[1]]);
            return;
        }
    }, []);

    const handleCityClick = useCallback(async (cityName: string, coordinates: [number, number]) => {
        // City input is not populated on click - removed functionality
        setCityCoordinates(coordinates);
        setMapCenter(coordinates);
        setNeighborhoods([]);


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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);





    type ApartmentSubtype = {
        id: string;
        label: string;
        icon?: ReactNode;
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

    const handlePropertyTypeClick = (typeId: string) => {
        const isSelecting = selectedPropertyType !== typeId;
        const wasApartments = selectedPropertyType === 'apartments';
        const newSelectedType = selectedPropertyType === typeId ? null : typeId;

        setSelectedPropertyType(newSelectedType);

        // Reset apartment subtypes when deselecting apartments or selecting a different property type
        if (wasApartments || typeId !== 'apartments') {
            setSelectedApartmentSubtypes([]);
        }

        // Update URL with property type
        const params = new URLSearchParams(window.location.search);
        if (newSelectedType) {
            params.set('type', newSelectedType);
        } else {
            params.delete('type');
        }

        // Remove apartment subtypes from URL if deselecting apartments
        if (!newSelectedType || newSelectedType !== 'apartments') {
            params.delete('apartmentSubtypes');
        }

        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        router.replace(newUrl, { scroll: false });

        // Scroll to city input when selecting a property type
        if (isSelecting) {
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
        if (areaFrom !== 20) {
            params.set('areaFrom', areaFrom.toString());
        }
        if (areaTo !== 100) {
            params.set('areaTo', areaTo.toString());
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
        setSelectedApartmentSubtypes([]);
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
                                            <Input
                                                id="filters-city"
                                                label="Град"
                                                placeholder="Пр. Бургас"
                                                value={city}
                                                onChange={(event) => setCity(event.target.value)}
                                                className={styles.filterInput}
                                            />
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
                                        <div className={styles.neighborhoodFilter}>
                                            <Input
                                                id="filters-neighborhood"
                                                label="Квартал"
                                                placeholder={neighborhoods.length > 0 ? "Кликнете на картата за да добавите още квартали" : "Кликнете на картата за да изберете квартали"}
                                                value={neighborhoods.join(', ')}
                                                readOnly
                                                className={styles.filterInput}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    // Scroll to map or focus on map
                                                    if (mapContainer.current) {
                                                        mapContainer.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }
                                                }}
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
                                                        {neighborhoods.length} квартал{neighborhoods.length > 1 ? 'а' : ''} избран{neighborhoods.length > 1 ? 'и' : ''}. Кликнете отново на квартал за да го премахнете.
                                                    </p>
                                                </>
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
                                                {APARTMENT_SUBTYPES.map((subtype) => {
                                                    const isChecked = selectedApartmentSubtypes.includes(subtype.id);
                                                    const isAllOption = subtype.id === 'all';
                                                    return (
                                                        <label
                                                            key={subtype.id}
                                                            className={`${styles.apartmentSubtypeOption} ${isAllOption ? styles.allOption : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleApartmentSubtypeToggle(subtype.id)}
                                                                className={styles.apartmentSubtypeCheckbox}
                                                            />
                                                            <span className={styles.apartmentSubtypeLabel}>
                                                                {subtype.label}
                                                                {subtype.icon && (
                                                                    <span className={styles.apartmentSubtypeIconGroup}>
                                                                        {subtype.icon}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
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
                                        <h4 className={styles.areaTitle}>Площ в кв.м</h4>
                                        <div className={styles.areaControls}>
                                            <div className={styles.dualRangeSlider}>
                                                <input
                                                    type="range"
                                                    id="area-slider-from"
                                                    min="0"
                                                    max={AREA_SLIDER_MAX}
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
                                                        '--slider-value': `${(Math.min(areaFrom, AREA_SLIDER_MAX) / AREA_SLIDER_MAX) * 100}%`,
                                                        '--slider-to-value': `${(Math.min(areaTo, AREA_SLIDER_MAX) / AREA_SLIDER_MAX) * 100}%`
                                                    } as React.CSSProperties}
                                                />
                                                <input
                                                    type="range"
                                                    id="area-slider-to"
                                                    min="0"
                                                    max={AREA_SLIDER_MAX}
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
                                                        '--slider-value': `${(Math.min(areaTo, AREA_SLIDER_MAX) / AREA_SLIDER_MAX) * 100}%`
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
                                                        placeholder={SQUARE_AREA_CAP.toString()}
                                                    />
                                                </div>
                                            </div>
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
                            </div>

                            <div className={styles.mapWrapper}>
                                <div
                                    className={styles.mapContainer}
                                    ref={mapContainer}
                                    style={{ width: '100%', height: '70vh', minHeight: '600px' }}
                                >
                                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                                        <LoadScript
                                            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                                            loadingElement={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>}
                                        >
                                            <GoogleMap
                                                mapContainerStyle={mapContainerStyle}
                                                center={mapCenter ? { lat: mapCenter[0], lng: mapCenter[1] } : defaultCenter}
                                                zoom={11}
                                                onLoad={(mapInstance) => setMap(mapInstance)}
                                                options={{
                                                    disableDefaultUI: false,
                                                    zoomControl: true,
                                                    streetViewControl: false,
                                                    mapTypeControl: false,
                                                    fullscreenControl: true,
                                                }}
                                            >
                                                {/* City markers - only show Burgas municipality cities */}
                                                {map && burgasCities.cities.map((city) => {
                                                    const cityNameLower = city.name.toLowerCase();
                                                    const isBurgasCity = cityNameLower.includes('burgas') || cityNameLower.includes('бургас');

                                                    if (!isBurgasCity) return null;

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
                                            </GoogleMap>
                                        </LoadScript>
                                    )}
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

