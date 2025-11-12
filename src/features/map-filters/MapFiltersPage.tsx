'use client';

import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
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
import styles from './MapFiltersPage.module.scss';
import 'leaflet/dist/leaflet.css';

const AREA_SLIDER_MAX = 500;
const SQUARE_AREA_CAP = 225;

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Circle = dynamic(
    () => import('react-leaflet').then((mod) => mod.Circle),
    { ssr: false }
);
const GeoJSON = dynamic(
    () => import('react-leaflet').then((mod) => mod.GeoJSON),
    { ssr: false }
);
// Component to update map center
const MapUpdater = dynamic(
    () => import('react-leaflet').then((mod) => {
        const Component = ({ center }: { center: [number, number] }) => {
            const map = mod.useMap();

            useEffect(() => {
                map.setView(center, map.getZoom());
            }, [center, map]);

            return null;
        };
        return Component;
    }),
    { ssr: false }
);

// Component to handle map clicks and fetch neighborhoods
const MapClickHandler = dynamic(
    () => import('react-leaflet').then((mod) => {
        const Component = ({
            onCityClick
        }: {
            onCityClick: (lat: number, lng: number) => void
        }) => {
            const map = mod.useMap();

            useEffect(() => {
                const handleClick = (e: any) => {
                    onCityClick(e.latlng.lat, e.latlng.lng);
                };

                map.on('click', handleClick);

                return () => {
                    map.off('click', handleClick);
                };
            }, [map, onCityClick]);

            return null;
        };
        return Component;
    }),
    { ssr: false }
);

export function MapFiltersPage() {
    const router = useRouter();
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
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
            } else {
                setCityCoordinates(null);
            }
        } else {
            setCityCoordinates(null);
            setMapCenter([42.5048, 27.4626]);
        }
    }, [trimmedCity, osmNeighborhoods, selectedCityName]);

    // Fetch neighborhoods from OpenStreetMap
    const fetchNeighborhoodsFromOSM = async (lat: number, lng: number) => {
        setLoadingNeighborhoods(true);
        try {
            // First, reverse geocode to get city name
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
            const nominatimResponse = await fetch(nominatimUrl);
            const nominatimData = await nominatimResponse.json();

            const cityName = nominatimData.address?.city ||
                nominatimData.address?.town ||
                nominatimData.address?.municipality ||
                nominatimData.address?.county ||
                '';

            if (!cityName) {
                setLoadingNeighborhoods(false);
                return;
            }

            setSelectedCityName(cityName);
            setCity(cityName);
            setCityCoordinates([lat, lng]);
            setMapCenter([lat, lng]);

            // Fetch neighborhoods using Overpass API
            // Bbox format: (south,west,north,east)
            const south = lat - 0.1;
            const west = lng - 0.1;
            const north = lat + 0.1;
            const east = lng + 0.1;
            const overpassQuery = `
                [out:json][timeout:25];
                (
                    relation["place"="suburb"](bbox:${south},${west},${north},${east});
                    relation["place"="neighbourhood"](bbox:${south},${west},${north},${east});
                    relation["place"="quarter"](bbox:${south},${west},${north},${east});
                    way["place"="suburb"](bbox:${south},${west},${north},${east});
                    way["place"="neighbourhood"](bbox:${south},${west},${north},${east});
                    way["place"="quarter"](bbox:${south},${west},${north},${east});
                );
                out geom;
            `;

            const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
            const overpassResponse = await fetch(overpassUrl);
            const overpassData = await overpassResponse.json();

            if (overpassData.elements && overpassData.elements.length > 0) {
                // Convert Overpass data to GeoJSON format
                const features = overpassData.elements.map((element: any) => {
                    if (element.type === 'relation' || element.type === 'way') {
                        const coordinates = element.geometry?.map((point: any) => [point.lon, point.lat]) || [];
                        return {
                            type: 'Feature',
                            properties: {
                                name: element.tags?.name || '',
                                id: element.id
                            },
                            geometry: {
                                type: element.type === 'relation' ? 'Polygon' : 'LineString',
                                coordinates: element.type === 'relation' ? [coordinates] : coordinates
                            }
                        };
                    }
                    return null;
                }).filter((f: any) => f !== null);

                const geoJsonData = {
                    type: 'FeatureCollection',
                    features: features
                };

                setOsmNeighborhoods(geoJsonData);
            } else {
                setOsmNeighborhoods(null);
            }
        } catch (error) {
            console.error('Error fetching neighborhoods:', error);
            setOsmNeighborhoods(null);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    const handleMapCityClick = (lat: number, lng: number) => {
        fetchNeighborhoodsFromOSM(lat, lng);
    };

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
        if (neighborhood.trim()) {
            params.set('neighborhood', neighborhood.trim());
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
        setNeighborhood('');
        setDistance(0);
        setAreaFrom(20);
        setAreaTo(100);
        setSelectedApartmentSubtypes([]);
    };

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
                                        <Input
                                            id="filters-neighborhood"
                                            label="Квартал"
                                            placeholder="Пр. Център"
                                            value={neighborhood}
                                            onChange={(event) => setNeighborhood(event.target.value)}
                                            className={styles.filterInput}
                                        />
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
                                            <Image
                                                src="/bed-top-view.svg"
                                                alt="Bed top view illustration"
                                                width={200}
                                                height={60}
                                                className={styles.bedTopViewImage}
                                                priority
                                            />
                                            <motion.div
                                                className={`${styles.bedTopViewSquare} ${isFromSmaller
                                                    ? styles.bedTopViewSquareGreen
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
                                                    ? styles.bedTopViewSquareGreen
                                                    : styles.bedTopViewSquareRed
                                                    }`}
                                                initial={{ width: 0, height: 0 }}
                                                animate={{
                                                    width: squareSideTo,
                                                    height: squareSideTo
                                                }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.mapWrapper}>
                                <div className={styles.mapContainer}>
                                    <MapContainer
                                        center={mapCenter}
                                        zoom={11}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom
                                    >
                                        <MapUpdater center={mapCenter} />
                                        <MapClickHandler onCityClick={handleMapCityClick} />
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {!osmNeighborhoods && (
                                            <GeoJSON
                                                data={burgasNeighborhoods as any}
                                                style={(feature) => ({
                                                    color: '#8c1c1c',
                                                    weight: 2,
                                                    opacity: 0.6,
                                                    fillColor: '#8c1c1c',
                                                    fillOpacity: 0.1
                                                })}
                                                onEachFeature={(feature, layer) => {
                                                    if (feature.properties) {
                                                        layer.on({
                                                            click: () => {
                                                                if (feature.properties?.name) {
                                                                    setNeighborhood(feature.properties.name);
                                                                }
                                                            },
                                                            mouseover: (e) => {
                                                                const layer = e.target;
                                                                layer.setStyle({
                                                                    weight: 3,
                                                                    fillOpacity: 0.2
                                                                });
                                                            },
                                                            mouseout: (e) => {
                                                                const layer = e.target;
                                                                layer.setStyle({
                                                                    weight: 2,
                                                                    fillOpacity: 0.1
                                                                });
                                                            }
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                        {osmNeighborhoods && (
                                            <GeoJSON
                                                data={osmNeighborhoods}
                                                style={(feature) => ({
                                                    color: '#8c1c1c',
                                                    weight: 2,
                                                    opacity: 0.6,
                                                    fillColor: '#8c1c1c',
                                                    fillOpacity: 0.1
                                                })}
                                                onEachFeature={(feature, layer) => {
                                                    if (feature.properties) {
                                                        layer.on({
                                                            click: () => {
                                                                if (feature.properties?.name) {
                                                                    setNeighborhood(feature.properties.name);
                                                                }
                                                            },
                                                            mouseover: (e) => {
                                                                const layer = e.target;
                                                                layer.setStyle({
                                                                    weight: 3,
                                                                    fillOpacity: 0.2
                                                                });
                                                            },
                                                            mouseout: (e) => {
                                                                const layer = e.target;
                                                                layer.setStyle({
                                                                    weight: 2,
                                                                    fillOpacity: 0.1
                                                                });
                                                            }
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                        {cityCoordinates && distance > 0 && (
                                            <Circle
                                                center={cityCoordinates}
                                                radius={distance * 1000}
                                                pathOptions={{
                                                    color: '#8c1c1c',
                                                    fillColor: '#8c1c1c',
                                                    fillOpacity: 0.2,
                                                    weight: 2,
                                                    interactive: false
                                                }}
                                            />
                                        )}
                                    </MapContainer>
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
                                    !neighborhood.trim()
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
                                    !neighborhood.trim()
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

