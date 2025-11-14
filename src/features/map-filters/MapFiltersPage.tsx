'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
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

        const targetRoute = newSelectedType ? `/map-filters/${newSelectedType}` : '/map-filters';
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
        // Dummy callback for now - will query database later
        console.log('Filters changed:', filters);
    }, []);

    // State to hold action buttons from filter pages
    const [actionButtons, setActionButtons] = useState<React.ReactNode>(null);

    const handleActionButtonsReady = useCallback((buttons: React.ReactNode) => {
        setActionButtons(buttons);
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
                            {propertyTypes.map((type) => {
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
                        <div className={styles.filtersMapLayout}>
                            {/* Map shown first on the left */}
                            <div className={styles.rightFiltersColumn}>
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
                            </div>

                            {/* Filters on the right */}
                            {isApartmentsSelected ? (
                            <div className={styles.leftFiltersColumn}>
                                    <ApartmentsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                                </div>
                            ) : isHousesVillasSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <HousesVillasFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isStoresOfficesSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <StoresOfficesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isBuildingPlotsSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <BuildingPlotsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isAgriculturalLandSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <AgriculturalLandFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isWarehousesIndustrialSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <WarehousesIndustrialFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isGaragesParkingSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <GaragesParkingFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isHotelsMotelsSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <HotelsMotelsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isEstablishmentsSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <EstablishmentsFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isReplaceRealEstatesSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <ReplaceRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isBuyRealEstatesSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <BuyRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : isOtherRealEstatesSelected ? (
                                <div className={styles.leftFiltersColumn}>
                                    <OtherRealEstatesFiltersPage
                                        locationState={locationState}
                                        onLocationChange={handleLocationChange}
                                        onFiltersChange={handleFiltersChange}
                                        onActionButtonsReady={handleActionButtonsReady}
                                    />
                                </div>
                            ) : (
                                <div className={styles.leftFiltersColumn} />
                            )}
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
