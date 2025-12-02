'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from '@phosphor-icons/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { propertyTypes } from '@/data/propertyTypes';
import burgasCities from '@/data/burgasCities.json';
import styles from './MapFiltersPage.module.scss';
import React from 'react';
import { ApartmentsFiltersPage, ApartmentFiltersState } from './filter-subpages/ApartmentsFiltersPage';
import { HousesVillasFiltersPage, HouseFiltersState } from './filter-subpages/HousesVillasFiltersPage';
import { StoresOfficesFiltersPage, CommercialFiltersState } from './filter-subpages/StoresOfficesFiltersPage';
import { BuildingPlotsFiltersPage, BuildingPlotsFiltersState } from './filter-subpages/BuildingPlotsFiltersPage';
import { AgriculturalLandFiltersPage, AgriculturalLandFiltersState } from './filter-subpages/AgriculturalLandFiltersPage';
import { WarehousesIndustrialFiltersPage, WarehousesIndustrialFiltersState } from './filter-subpages/WarehousesIndustrialFiltersPage';
import { GaragesParkingFiltersPage, GaragesParkingFiltersState } from './filter-subpages/GaragesParkingFiltersPage';
import { HotelsMotelsFiltersPage, HotelsMotelsFiltersState } from './filter-subpages/HotelsMotelsFiltersPage';
import { EstablishmentsFiltersPage, EstablishmentsFiltersState } from './filter-subpages/EstablishmentsFiltersPage';
import { ReplaceRealEstatesFiltersPage, ReplaceRealEstatesFiltersState } from './filter-subpages/ReplaceRealEstatesFiltersPage';
import { BuyRealEstatesFiltersPage, BuyRealEstatesFiltersState } from './filter-subpages/BuyRealEstatesFiltersPage';
import { OtherRealEstatesFiltersPage, OtherRealEstatesFiltersState } from './filter-subpages/OtherRealEstatesFiltersPage';
import { MapComponent } from './MapComponent';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { mockProperties } from '@/features/properties/PropertiesListPage';
import { MapPin } from '@phosphor-icons/react';
import type { Property } from '@/types';

interface MapFiltersPageProps {
    initialPropertyType?: string | null;
}

export function MapFiltersPage({ initialPropertyType = null }: MapFiltersPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    let baseRoute = '/map-filters';
    if (pathname?.startsWith('/sale/search')) {
        baseRoute = '/sale/search';
    } else if (pathname?.startsWith('/rent/search')) {
        baseRoute = '/rent/search';
    }
    
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(() => {
        if (!initialPropertyType) {
            return null;
        }
        return propertyTypes.some((type) => type.id === initialPropertyType) ? initialPropertyType : null;
    });

    // Store restored filters from URL
    const [restoredFilters, setRestoredFilters] = useState<ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null>(null);

    // Shared map location state - lifted to parent so map persists across property type changes
    const [locationState, setLocationState] = useState({
        searchTerm: '',
        city: '',
        cityCoordinates: undefined as [number, number] | undefined,
        neighborhoods: [] as string[],
        distance: 0
    });

    // Store map instance reference to keep it persistent
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    
    // Store current filter state to serialize to URL
    const currentFiltersRef = useRef<ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null>(null);

    useEffect(() => {
        if (!initialPropertyType) {
            setSelectedPropertyType((prev) => (prev !== null ? null : prev));
            return;
        }

        const isValidType = propertyTypes.some((type) => type.id === initialPropertyType);
        if (!isValidType) {
            setSelectedPropertyType((prev) => (prev !== null ? null : prev));
            return;
        }

        setSelectedPropertyType((prev) => (prev === initialPropertyType ? prev : initialPropertyType));
    }, [initialPropertyType]);

    // Restore filters from URL on mount and sync showListings with URL params
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const params = new URLSearchParams(window.location.search);
        const hasSearchParams = params.has('search') || params.has('filters');
        setShowListings(hasSearchParams || false);
        
        // Restore filters from URL if present
        if (params.has('filters')) {
            try {
                const filtersJson = decodeURIComponent(params.get('filters') || '');
                const restoredFilters = JSON.parse(filtersJson) as ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState;
                setRestoredFilters(restoredFilters);
                currentFiltersRef.current = restoredFilters;
                
                // Restore location state from filters
                if (restoredFilters && 'searchTerm' in restoredFilters && 'city' in restoredFilters) {
                    let cityCoordinates: [number, number] | undefined = undefined;
                    if (restoredFilters.city) {
                        const foundCity = burgasCities.cities.find(
                            (c) =>
                                c.name.toLowerCase() === restoredFilters.city.toLowerCase() ||
                                c.nameEn.toLowerCase() === restoredFilters.city.toLowerCase()
                        );
                        if (foundCity && foundCity.coordinates && foundCity.coordinates.length === 2) {
                            cityCoordinates = [foundCity.coordinates[0], foundCity.coordinates[1]];
                        }
                    }
                    
                    setLocationState({
                        searchTerm: restoredFilters.searchTerm || '',
                        city: restoredFilters.city || '',
                        cityCoordinates,
                        neighborhoods: restoredFilters.neighborhoods || [],
                        distance: restoredFilters.distance || 0
                    });
                }
            } catch (error) {
                console.error('Error restoring filters from URL:', error);
            }
        }
    }, []);

    const isApartmentsSelected = selectedPropertyType === 'apartments';
    const isHousesVillasSelected = selectedPropertyType === 'houses-villas';
    const isStoresOfficesSelected = selectedPropertyType === 'stores-offices';
    const isBuildingPlotsSelected = selectedPropertyType === 'building-plots';
    const isAgriculturalLandSelected = selectedPropertyType === 'agricultural-land';
    const isWarehousesIndustrialSelected = selectedPropertyType === 'warehouses-industrial';
    const isGaragesParkingSelected = selectedPropertyType === 'garages-parking';
    const isHotelsMotelsSelected = selectedPropertyType === 'hotels-motels';
    const isEstablishmentsSelected = selectedPropertyType === 'restaurants';
    const isReplaceRealEstatesSelected = selectedPropertyType === 'replace-real-estates';
    const isBuyRealEstatesSelected = selectedPropertyType === 'buy-real-estates';
    const isOtherRealEstatesSelected = selectedPropertyType === 'other-real-estates';

    const handlePropertyTypeClick = (typeId: string) => {
        const isSelecting = selectedPropertyType !== typeId;
        const newSelectedType = isSelecting ? typeId : null;

        setSelectedPropertyType(newSelectedType);

        const targetRoute = newSelectedType ? `${baseRoute}/${newSelectedType}` : baseRoute;
        router.push(targetRoute);
    };
    
    // Map location handlers - shared across all property types
    const handleLocationChange = useCallback((searchTerm: string, city: string, neighborhoods: string[], distance: number) => {
        // Get city coordinates if city is selected
        let cityCoordinates: [number, number] | undefined = undefined;
        if (city) {
            const foundCity = burgasCities.cities.find(
                (c) =>
                    c.name.toLowerCase() === city.toLowerCase() ||
                    c.nameEn.toLowerCase() === city.toLowerCase()
            );
            if (foundCity && foundCity.coordinates && foundCity.coordinates.length === 2) {
                cityCoordinates = [foundCity.coordinates[0], foundCity.coordinates[1]];
            }
        }

        setLocationState({
            searchTerm,
            city,
            cityCoordinates,
            neighborhoods,
            distance
        });
    }, []);

    const handleCityClick = useCallback((cityName: string, coordinates: [number, number]) => {
        handleLocationChange(locationState.searchTerm, cityName, [], 0);
    }, [locationState.searchTerm, handleLocationChange]);

    const handleNeighborhoodClick = useCallback((neighborhoodName: string, coordinates: [number, number]) => {
        const currentNeighborhoods = locationState.neighborhoods;
        const updatedNeighborhoods = currentNeighborhoods.includes(neighborhoodName)
            ? currentNeighborhoods.filter(n => n !== neighborhoodName)
            : [...currentNeighborhoods, neighborhoodName];
        
        handleLocationChange(
            locationState.searchTerm,
            locationState.city,
            updatedNeighborhoods,
            locationState.distance
        );
    }, [locationState, handleLocationChange]);

    const handleBackToCities = useCallback(() => {
        handleLocationChange(locationState.searchTerm, '', [], 0);
    }, [locationState.searchTerm, handleLocationChange]);

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapInstanceRef.current = map;
    }, []);

    const handleFiltersChange = useCallback((filters: ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState) => {
        // Store filters in ref for URL serialization
        currentFiltersRef.current = filters;
        console.log('Filters changed:', filters);
    }, []);

    // Get initial filters for the current property type
    const getInitialFilters = useCallback(() => {
        if (!restoredFilters) return undefined;
        
        // Type guard to check if restored filters match current property type
        if (isApartmentsSelected && 'apartmentSubtypes' in restoredFilters) {
            return restoredFilters as Partial<ApartmentFiltersState>;
        } else if (isHousesVillasSelected && 'houseTypes' in restoredFilters) {
            return restoredFilters as Partial<HouseFiltersState>;
        } else if (isStoresOfficesSelected && 'selectedFloorOptions' in restoredFilters && 'selectedBuildingTypes' in restoredFilters) {
            return restoredFilters as Partial<CommercialFiltersState>;
        } else if (isBuildingPlotsSelected && 'selectedElectricityOptions' in restoredFilters) {
            return restoredFilters as Partial<BuildingPlotsFiltersState>;
        } else if (isAgriculturalLandSelected && 'selectedCategories' in restoredFilters) {
            return restoredFilters as Partial<AgriculturalLandFiltersState>;
        } else if (isWarehousesIndustrialSelected && 'propertyTypes' in restoredFilters && !('selectedCategories' in restoredFilters)) {
            return restoredFilters as Partial<WarehousesIndustrialFiltersState>;
        } else if (isGaragesParkingSelected && 'selectedConstructionTypes' in restoredFilters && !('selectedCategories' in restoredFilters) && !('selectedFloorOptions' in restoredFilters)) {
            return restoredFilters as Partial<GaragesParkingFiltersState>;
        } else if (isHotelsMotelsSelected && 'selectedCategories' in restoredFilters && 'bedBaseFrom' in restoredFilters) {
            return restoredFilters as Partial<HotelsMotelsFiltersState>;
        } else if (isEstablishmentsSelected && 'locationTypes' in restoredFilters) {
            return restoredFilters as Partial<EstablishmentsFiltersState>;
        }
        
        return undefined;
    }, [restoredFilters, isApartmentsSelected, isHousesVillasSelected, isStoresOfficesSelected, isBuildingPlotsSelected, isAgriculturalLandSelected, isWarehousesIndustrialSelected, isGaragesParkingSelected, isHotelsMotelsSelected, isEstablishmentsSelected]);

    // State to hold action buttons from filter pages
    const [actionButtons, setActionButtons] = useState<React.ReactNode>(null);

    const handleActionButtonsReady = useCallback((buttons: React.ReactNode) => {
        setActionButtons(buttons);
    }, []);

    // State for direct ID search result
    const [selectedPropertyById, setSelectedPropertyById] = useState<Property | null>(null);
    const [propertyByIdError, setPropertyByIdError] = useState<string | null>(null);
    const [isLoadingPropertyById, setIsLoadingPropertyById] = useState(false);

    // State to track whether to show map or listings
    const [showListings, setShowListings] = useState(() => {
        // Check if URL has search params on initial load
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.has('search') || params.has('filters');
        }
        return false;
    });

    // Serialize filters to URL query params
    const serializeFiltersToURL = useCallback((filters: ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null) => {
        if (!filters) return '';
        
        const params = new URLSearchParams();
        params.set('search', '1');
        
        // Serialize filter state to JSON and encode it
        try {
            const filtersJson = JSON.stringify(filters);
            params.set('filters', encodeURIComponent(filtersJson));
        } catch (error) {
            console.error('Error serializing filters:', error);
        }
        
        return params.toString();
    }, []);

    const handleSearch = useCallback(async () => {
        const filters = currentFiltersRef.current;
        setSelectedPropertyById(null);
        setPropertyByIdError(null);
        setIsLoadingPropertyById(false);

        if (filters && 'propertyId' in filters && filters.propertyId && filters.propertyId.trim()) {
            const shortId = filters.propertyId.trim();
            setIsLoadingPropertyById(true);
            try {
                const response = await fetch(`/api/properties/short/${shortId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setPropertyByIdError('Имот с това ID не е намерен.');
                    } else {
                        const data = await response.json().catch(() => null);
                        setPropertyByIdError(data?.error || 'Грешка при зареждането на имота по ID.');
                    }
                } else {
                    const data: Property = await response.json();
                    setSelectedPropertyById(data);
                }
            } catch (error) {
                console.error('Error fetching property by short_id:', error);
                setPropertyByIdError('Грешка при зареждането на имота по ID.');
            } finally {
                setIsLoadingPropertyById(false);
            }
        } else if (filters) {
            const queryString = serializeFiltersToURL(filters);
            const currentPath = selectedPropertyType 
                ? `${baseRoute}/${selectedPropertyType}` 
                : baseRoute;
            router.push(`${currentPath}?${queryString}`);
        }
        setShowListings(true);
    }, [selectedPropertyType, router, serializeFiltersToURL, baseRoute]);

    const handleBackToMap = useCallback(() => {
        // Remove search params from URL
        const currentPath = selectedPropertyType 
            ? `${baseRoute}/${selectedPropertyType}` 
            : baseRoute;
        router.push(currentPath);
        setShowListings(false);
    }, [selectedPropertyType, router, baseRoute]);

    // Filter property types for rent/search route
    const availablePropertyTypes = useMemo(() => {
        if (baseRoute === '/rent/search') {
            // Only show specific property types for rent with custom labels
            const rentPropertyTypeIds = [
                'apartments',
                'houses-villas',
                'restaurants',
                'stores-offices',
                'garages-parking',
                'warehouses-industrial',
                'building-plots',
                'hotels-motels'
            ];
            const rentLabels: Record<string, string> = {
                'apartments': 'Апартаменти',
                'houses-villas': 'Къщи',
                'restaurants': 'Заведения',
                'stores-offices': 'Магазини/Офиси/Кабинети/Салони',
                'garages-parking': 'Гаражи/Паркинги/Паркоместа под наем',
                'warehouses-industrial': 'Складове/Промишлени и стопански имоти под наем',
                'building-plots': 'Парцели/Терени',
                'hotels-motels': 'Хотели/Почивни станции'
            };
            return propertyTypes
                .filter(type => rentPropertyTypeIds.includes(type.id))
                .map(type => ({
                    ...type,
                    label: rentLabels[type.id] || type.label
                }));
        }
        return propertyTypes;
    }, [baseRoute]);

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
                        <div className={styles.headerContent}>
                            <div className={styles.headerText}>
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
                            </div>
                            {selectedPropertyType && (() => {
                                const selectedType = propertyTypes.find(type => type.id === selectedPropertyType);
                                if (selectedType) {
                                    const Icon = selectedType.icon;
                                    return (
                                        <div className={styles.headerIcon}>
                                            <Icon size={120} />
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </motion.div>

                    {!selectedPropertyType && (
                    <div className={styles.propertyTypeFiltersSection}>
                        <div className={styles.propertyTypeFilters}>
                            {availablePropertyTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                            className={styles.propertyTypeFilterButton}
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
                    )}

                    {selectedPropertyType && (
                        <div className={`${styles.filtersMapLayout} ${showListings ? styles.showingListings : ''}`}>
                            {/* Map or Listings shown in the left column */}
                            <div className={styles.leftFiltersColumn}>
                                {showListings ? (
                                    <div className={styles.propertyListings}>
                                        <div className={styles.listingsHeader}>
                                            <h2 className={styles.listingsTitle}>
                                                Намерени имоти:{' '}
                                                {selectedPropertyById ? 1 : mockProperties.length}
                                            </h2>
                                            <Button
                                                variant="outline"
                                                onClick={handleBackToMap}
                                                className={styles.backToMapButton}
                                            >
                                                <MapPin size={18} />
                                                Обратно към картата
                                            </Button>
                                        </div>
                                        <div className={styles.listingsGrid}>
                                            {isLoadingPropertyById ? (
                                                <p className={styles.noResults}>Зареждане на имот по ID...</p>
                                            ) : selectedPropertyById ? (
                                                <PropertyCard property={selectedPropertyById} />
                                            ) : propertyByIdError ? (
                                                <p className={styles.noResults}>{propertyByIdError}</p>
                                            ) : (
                                                mockProperties.map((property) => (
                                                    <PropertyCard
                                                        key={property.id}
                                                        property={property}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <MapComponent
                                        city={locationState.city}
                                        cityCoordinates={locationState.cityCoordinates}
                                        distance={locationState.distance}
                                        neighborhoods={locationState.neighborhoods}
                                        onCityClick={handleCityClick}
                                        onNeighborhoodClick={handleNeighborhoodClick}
                                        onBackToCities={handleBackToCities}
                                        onMapLoad={handleMapLoad}
                                    />
                                )}
                            </div>

                            {/* Filters on the right */}
                            <div className={styles.rightFiltersColumn}>
                                {isApartmentsSelected ? (
                                    <ApartmentsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isHousesVillasSelected ? (
                                    <HousesVillasFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isStoresOfficesSelected ? (
                                    <StoresOfficesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isBuildingPlotsSelected ? (
                                    <BuildingPlotsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        initialFilters={getInitialFilters() as Partial<BuildingPlotsFiltersState> | undefined}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isAgriculturalLandSelected ? (
                                    <AgriculturalLandFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        initialFilters={getInitialFilters() as Partial<AgriculturalLandFiltersState> | undefined}
                                    />
                                ) : isWarehousesIndustrialSelected ? (
                                    <WarehousesIndustrialFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isGaragesParkingSelected ? (
                                    <GaragesParkingFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        initialFilters={getInitialFilters() as Partial<GaragesParkingFiltersState> | undefined}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isHotelsMotelsSelected ? (
                                    <HotelsMotelsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isEstablishmentsSelected ? (
                                    <EstablishmentsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                        isRentMode={baseRoute === '/rent/search'}
                                    />
                                ) : isReplaceRealEstatesSelected ? (
                                    <ReplaceRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                    />
                                ) : isBuyRealEstatesSelected ? (
                                    <BuyRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                    />
                                ) : isOtherRealEstatesSelected ? (
                                    <OtherRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                        onSearch={handleSearch}
                                    />
                                ) : null}
                            </div>
                        </div>
                    )}
                    
                    {/* Floating action buttons - sticky in bottom right corner */}
                    {(isApartmentsSelected || isHousesVillasSelected || isStoresOfficesSelected || isBuildingPlotsSelected || isAgriculturalLandSelected || isWarehousesIndustrialSelected || isGaragesParkingSelected || isHotelsMotelsSelected || isEstablishmentsSelected || isReplaceRealEstatesSelected || isBuyRealEstatesSelected || isOtherRealEstatesSelected) && actionButtons && (
                        <div className={styles.actionButtonsWrapper}>
                            {actionButtons}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
