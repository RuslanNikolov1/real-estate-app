'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import styles from './MapFiltersPage.module.scss';
import burgasCitiesData from '@/data/burgasCities.json';
import citiesNeighborhoodsData from '@/data/citiesNeighborhoods.json';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Next.js
if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const GeoJSON = dynamic(
    () => import('react-leaflet').then((mod) => mod.GeoJSON),
    { ssr: false }
);

// Map controller component to handle zoom/pan - must be used inside MapContainer
function MapController({
    center,
    zoom,
    onZoomOut
}: {
    center: [number, number];
    zoom: number;
    onZoomOut?: () => void;
}) {
    if (typeof window === 'undefined') return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { useMap } = require('react-leaflet');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const map = useMap();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (map) {
            map.flyTo(center, zoom, {
                duration: 1.2,
                easeLinearity: 0.25,
            });
        }
    }, [map, center, zoom]);

    // Listen for zoom changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!map || !onZoomOut) return;

        const handleZoomEnd = () => {
            const currentZoom = map.getZoom();
            // If zoomed out below threshold (11), go back to cities view
            if (currentZoom < 11) {
                onZoomOut();
            }
        };

        map.on('zoomend', handleZoomEnd);

        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map, onZoomOut]);

    return null;
}

interface City {
    id: string;
    name: string;
    nameEn: string;
    coordinates: [number, number];
    population: number;
    description: string;
    type: 'major' | 'medium' | 'small';
}

interface NeighborhoodProperties {
    id: string;
    name: string;
    nameEn: string;
    description?: string;
    population: number;
}

interface NeighborhoodFeature {
    type: 'Feature';
    properties: NeighborhoodProperties;
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

interface SimpleNeighborhood {
    id: string;
    name: string;
    nameEn: string;
    coordinates: [number, number];
    population: number;
}

// Calculate neighborhood size based on population (returns km)
function calculateNeighborhoodSize(population: number): number {
    // Base size calculation: area proportional to population
    // Average population density in urban areas: ~8,000-10,000 people/km²
    const baseDensity = 9000; // people per km²
    const areaKm2 = population / baseDensity;

    // Convert area to approximate width (assuming square-ish neighborhoods)
    let sizeKm = Math.sqrt(areaKm2);

    // Apply bounds and scaling
    // Make it 75% of calculated size to reduce overlap
    sizeKm = sizeKm * 0.75;

    // Clamp between reasonable bounds
    const minSize = 0.25; // 250 meters minimum
    const maxSize = 0.8;  // 800 meters maximum

    return Math.max(minSize, Math.min(maxSize, sizeKm));
}

// Helper function to create a rectangle polygon around a center point
function createNeighborhoodPolygon(center: [number, number], widthKm: number): number[][] {
    const [lat, lng] = center;
    // Approximate degrees per km (rough estimate)
    const latDelta = widthKm / 111; // 1 degree latitude ≈ 111 km
    const lngDelta = widthKm / (111 * Math.cos(lat * Math.PI / 180)); // adjust for latitude

    return [
        [lng - lngDelta / 2, lat + latDelta / 2], // top-left
        [lng + lngDelta / 2, lat + latDelta / 2], // top-right
        [lng + lngDelta / 2, lat - latDelta / 2], // bottom-right
        [lng - lngDelta / 2, lat - latDelta / 2], // bottom-left
        [lng - lngDelta / 2, lat + latDelta / 2], // close the polygon
    ];
}

// Convert simple neighborhood to GeoJSON feature
function neighborhoodToFeature(neighborhood: SimpleNeighborhood): NeighborhoodFeature {
    const size = calculateNeighborhoodSize(neighborhood.population);

    return {
        type: 'Feature',
        properties: {
            id: neighborhood.id,
            name: neighborhood.name,
            nameEn: neighborhood.nameEn,
            description: `${neighborhood.name}`,
            population: neighborhood.population,
        },
        geometry: {
            type: 'Polygon',
            coordinates: [createNeighborhoodPolygon(neighborhood.coordinates, size)],
        },
    };
}

export function MapFiltersPage() {
    const router = useRouter();
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [showNeighborhoods, setShowNeighborhoods] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([42.42, 27.35]);
    const [mapZoom, setMapZoom] = useState(9);
    const [mapMounted, setMapMounted] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    // Clear Leaflet map container and force remount on mount/unmount
    useEffect(() => {
        // Clear any existing Leaflet instance
        if (typeof window !== 'undefined') {
            const L = require('leaflet');
            const container = L.DomUtil.get('map-container');
            if (container != null) {
                (container as any)._leaflet_id = null;
            }
        }

        setMapMounted(true);
        setMapKey((prev) => prev + 1);

        return () => {
            setMapMounted(false);
            // Cleanup on unmount
            if (typeof window !== 'undefined') {
                const L = require('leaflet');
                const container = L.DomUtil.get('map-container');
                if (container != null) {
                    (container as any)._leaflet_id = null;
                }
            }
        };
    }, []);

    // Get all cities
    const cities = useMemo(() => {
        return burgasCitiesData.cities as City[];
    }, []);

    // Get neighborhoods for selected city
    const neighborhoods = useMemo(() => {
        if (!selectedCity) return [];

        // Find city data by matching the Bulgarian name
        const cityKey = Object.keys(citiesNeighborhoodsData).find(
            key => (citiesNeighborhoodsData as any)[key].cityName === selectedCity
        );

        if (!cityKey) return [];

        const cityData = (citiesNeighborhoodsData as any)[cityKey];
        const simpleNeighborhoods = cityData.neighborhoods as SimpleNeighborhood[];

        // Convert to GeoJSON features
        return simpleNeighborhoods.map(neighborhoodToFeature);
    }, [selectedCity]);

    // Get selected city data
    const selectedCityData = useMemo(() => {
        if (!selectedCity) return null;
        return cities.find(c => c.name === selectedCity);
    }, [selectedCity, cities]);

    // Get selected neighborhoods data
    const selectedNeighborhoodsData = useMemo(() => {
        if (selectedNeighborhoods.length === 0) return [];
        return neighborhoods.filter(n => selectedNeighborhoods.includes(n.properties.name));
    }, [selectedNeighborhoods, neighborhoods]);

    // Early return if not mounted (after all hooks)
    if (!mapMounted) return null;

    const handleCityClick = (city: City) => {
        setSelectedCity(city.name);
        setSelectedNeighborhoods([]);

        // Check if city has neighborhoods
        const cityKey = Object.keys(citiesNeighborhoodsData).find(
            key => (citiesNeighborhoodsData as any)[key].cityName === city.name
        );

        if (cityKey) {
            // City has neighborhoods - calculate center based on neighborhoods
            const cityData = (citiesNeighborhoodsData as any)[cityKey];
            const simpleNeighborhoods = cityData.neighborhoods as SimpleNeighborhood[];

            // Calculate center point from all neighborhoods
            if (simpleNeighborhoods.length > 0) {
                const avgLat = simpleNeighborhoods.reduce((sum, n) => sum + n.coordinates[0], 0) / simpleNeighborhoods.length;
                const avgLng = simpleNeighborhoods.reduce((sum, n) => sum + n.coordinates[1], 0) / simpleNeighborhoods.length;

                setShowNeighborhoods(true);
                setMapCenter([avgLat, avgLng]);
                setMapZoom(13.5);
            } else {
                setShowNeighborhoods(true);
                setMapCenter(city.coordinates);
                setMapZoom(14);
            }
        } else {
            // City has no neighborhoods - just select it
            setShowNeighborhoods(false);
        }
    };

    const handleNeighborhoodClick = (feature: NeighborhoodFeature) => {
        const neighborhoodName = feature.properties.name;

        // Toggle neighborhood selection
        setSelectedNeighborhoods(prev => {
            if (prev.includes(neighborhoodName)) {
                // Remove if already selected
                return prev.filter(n => n !== neighborhoodName);
            } else {
                // Add if not selected
                return [...prev, neighborhoodName];
            }
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedNeighborhoods.length > 0 && selectedCity) {
            params.set('city', selectedCity);
            // Pass multiple neighborhoods as comma-separated string
            params.set('neighborhoods', selectedNeighborhoods.join(','));
        } else if (selectedCity) {
            params.set('city', selectedCity);
        }
        router.push(`/properties?${params.toString()}`);
    };

    const handleClear = () => {
        setSelectedCity(null);
        setSelectedNeighborhoods([]);
        setShowNeighborhoods(false);
        setMapCenter([42.42, 27.35]);
        setMapZoom(9);
    };

    const handleBackToCities = () => {
        setShowNeighborhoods(false);
        setSelectedNeighborhoods([]);
        setMapCenter([42.42, 27.35]);
        setMapZoom(9);
    };

    const handleZoomOut = () => {
        // Only trigger if we're currently showing neighborhoods
        if (showNeighborhoods) {
            handleBackToCities();
        }
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
                            {showNeighborhoods ? `Квартали в ${selectedCity}` : 'Градове в област Бургас'}
                        </h1>
                        <p className={styles.subtitle}>
                            {showNeighborhoods
                                ? 'Изберете квартал от картата или изберете от списъка'
                                : 'Изберете град от картата за да филтрирате имотите'}
                        </p>
                    </motion.div>

                    <div className={styles.content}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={styles.mapSection}
                        >
                            <div className={styles.mapContainer} id="map-container">
                                <MapContainer
                                    key={`map-${mapKey}`}
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                                    scrollWheelZoom={true}
                                >
                                    <MapController center={mapCenter} zoom={mapZoom} onZoomOut={handleZoomOut} />
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {!showNeighborhoods && cities.map((city) => (
                                        <Marker
                                            key={city.id}
                                            position={city.coordinates as [number, number]}
                                            eventHandlers={{
                                                click: () => handleCityClick(city),
                                            }}
                                        />
                                    ))}
                                    {showNeighborhoods && neighborhoods.length > 0 && (
                                        <>
                                            <GeoJSON
                                                key={`${selectedCity}-${selectedNeighborhoods.join(',')}`} // Force re-render when city or selection changes
                                                data={{
                                                    type: 'FeatureCollection',
                                                    features: neighborhoods,
                                                } as any}
                                                style={(feature) => {
                                                    const isSelected = feature?.properties.name && selectedNeighborhoods.includes(feature.properties.name);

                                                    return {
                                                        fillColor: isSelected ? '#de1510' : '#ffffff',
                                                        weight: isSelected ? 3 : 2,
                                                        opacity: 0.8,
                                                        color: isSelected ? '#de1510' : '#802e2e',
                                                        fillOpacity: isSelected ? 0.6 : 0.15,
                                                    };
                                                }}
                                                onEachFeature={(feature: any, layer: any) => {
                                                    // Update style when selection changes
                                                    const updateStyle = () => {
                                                        const isSelected = feature.properties.name && selectedNeighborhoods.includes(feature.properties.name);
                                                        layer.setStyle({
                                                            fillColor: isSelected ? '#de1510' : '#ffffff',
                                                            weight: isSelected ? 3 : 2,
                                                            opacity: 0.8,
                                                            color: isSelected ? '#de1510' : '#802e2e',
                                                            fillOpacity: isSelected ? 0.6 : 0.15,
                                                        });
                                                    };

                                                    // Initial style
                                                    updateStyle();

                                                    layer.on({
                                                        click: () => {
                                                            handleNeighborhoodClick(feature as NeighborhoodFeature);
                                                        },
                                                        mouseover: (e: any) => {
                                                            const layer = e.target;
                                                            const isSelected = feature.properties.name && selectedNeighborhoods.includes(feature.properties.name);
                                                            layer.setStyle({
                                                                weight: 3,
                                                                fillOpacity: isSelected ? 0.7 : 0.4,
                                                                fillColor: '#de1510',
                                                                color: '#de1510',
                                                            });
                                                        },
                                                        mouseout: (e: any) => {
                                                            const layer = e.target;
                                                            const isSelected = feature.properties.name && selectedNeighborhoods.includes(feature.properties.name);
                                                            layer.setStyle({
                                                                weight: isSelected ? 3 : 2,
                                                                fillOpacity: isSelected ? 0.6 : 0.15,
                                                                fillColor: isSelected ? '#de1510' : '#ffffff',
                                                                color: isSelected ? '#de1510' : '#802e2e',
                                                            });
                                                        },
                                                    });
                                                }}
                                            />
                                            {neighborhoods.map((neighborhood) => {
                                                // Calculate center of polygon
                                                const coords = neighborhood.geometry.coordinates[0];
                                                const lats = coords.map((c: number[]) => c[1]);
                                                const lngs = coords.map((c: number[]) => c[0]);
                                                const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                                                const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

                                                // Scale label size based on population
                                                const population = neighborhood.properties.population;
                                                const fontSize = population > 15000 ? 12 : population > 8000 ? 11 : 10;
                                                const maxWidth = population > 15000 ? 140 : population > 8000 ? 120 : 100;
                                                const iconWidth = population > 15000 ? 140 : population > 8000 ? 120 : 100;
                                                const iconHeight = 60; // Increased height to accommodate 2 lines

                                                return (
                                                    <Marker
                                                        key={neighborhood.properties.id}
                                                        position={[centerLat, centerLng]}
                                                        icon={typeof window !== 'undefined' ? new (require('leaflet').DivIcon)({
                                                            className: 'custom-neighborhood-label',
                                                            html: `<div style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background-color: rgba(255, 255, 255, 0.6);
                                color: #000;
                                border-radius: 8px;
                                width: 100%;
                                height: 100%;
                                cursor: pointer;
                              "><span style="
                                font-size: ${fontSize}px;
                                font-weight: 700;
                                text-align: center;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                              ">${neighborhood.properties.name}</span></div>`,
                                                            iconSize: [iconWidth, iconHeight],
                                                            iconAnchor: [iconWidth / 2, iconHeight / 2],
                                                        }) : undefined}
                                                        eventHandlers={{
                                                            click: () => handleNeighborhoodClick(neighborhood),
                                                        }}
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </MapContainer>
                                {showNeighborhoods && (
                                    <button
                                        className={styles.mapBackButton}
                                        onClick={handleBackToCities}
                                        aria-label="Back to cities"
                                    >
                                        <ArrowLeft size={20} />
                                        <span>Към градове</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={styles.infoSection}
                        >
                            <div className={styles.selectionInfo}>
                                <h3>{showNeighborhoods ? `Избрани квартали ${selectedNeighborhoods.length > 0 ? `(${selectedNeighborhoods.length})` : ''}` : 'Избран град'}</h3>

                                {showNeighborhoods && selectedNeighborhoodsData.length > 0 ? (
                                    <div className={styles.selectedCity}>
                                        <div className={styles.selectedNeighborhoodsList}>
                                            {selectedNeighborhoodsData.map((neighborhood) => (
                                                <div key={neighborhood.properties.id} className={styles.selectedNeighborhoodItem}>
                                                    <span>{neighborhood.properties.name}</span>
                                                    <span className={styles.population}>
                                                        {neighborhood.properties.population.toLocaleString('bg-BG')} жители
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.totalPopulation}>
                                            <strong>Общо население:</strong>{' '}
                                            {selectedNeighborhoodsData
                                                .reduce((sum, n) => sum + n.properties.population, 0)
                                                .toLocaleString('bg-BG')}
                                        </div>
                                    </div>
                                ) : showNeighborhoods ? (
                                    <p className={styles.hint}>
                                        Кликнете на квартал(и) от картата или изберете от списъка. Можете да изберете повече от един квартал.
                                    </p>
                                ) : selectedCityData ? (
                                    <div className={styles.selectedCity}>
                                        <h4>{selectedCityData.name}</h4>
                                        <div className={styles.municipalityDetails}>
                                            <p><strong>Население:</strong> {selectedCityData.population.toLocaleString('bg-BG')}</p>
                                            <p className={styles.description}>{selectedCityData.description}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.hint}>
                                        Кликнете на град от картата или изберете от списъка
                                    </p>
                                )}
                            </div>

                            <AnimatePresence>
                                {showNeighborhoods ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={styles.neighborhoodsSection}
                                    >
                                        <h4>Квартали ({neighborhoods.length}):</h4>
                                        <div className={styles.neighborhoodsList}>
                                            {neighborhoods.map((neighborhood) => (
                                                <button
                                                    key={neighborhood.properties.id}
                                                    className={`${styles.neighborhoodButton} ${selectedNeighborhoods.includes(neighborhood.properties.name)
                                                        ? styles.active
                                                        : ''
                                                        }`}
                                                    onClick={() => handleNeighborhoodClick(neighborhood)}
                                                >
                                                    {neighborhood.properties.name}
                                                    {selectedNeighborhoods.includes(neighborhood.properties.name) && (
                                                        <span className={styles.checkmark}>✓</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : !selectedCity && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={styles.neighborhoodsSection}
                                    >
                                        <h4>Градове в област Бургас ({cities.length}):</h4>
                                        <div className={styles.neighborhoodsList}>
                                            {cities.map((city) => (
                                                <button
                                                    key={city.id}
                                                    className={styles.neighborhoodButton}
                                                    onClick={() => handleCityClick(city)}
                                                >
                                                    {city.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={styles.actions}>
                                {showNeighborhoods && (
                                    <Button
                                        variant="outline"
                                        onClick={handleBackToCities}
                                        className={styles.backButton}
                                    >
                                        <ArrowLeft size={18} />
                                        Към градове
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleClear}
                                    disabled={!selectedCity && selectedNeighborhoods.length === 0}
                                >
                                    Изчисти
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSearch}
                                    disabled={!selectedCity && selectedNeighborhoods.length === 0}
                                >
                                    Търси имоти
                                    {selectedNeighborhoods.length > 0 && ` (${selectedNeighborhoods.length} ${selectedNeighborhoods.length === 1 ? 'квартал' : 'квартала'})`}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

