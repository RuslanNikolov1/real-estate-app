'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { propertyTypes } from '@/data/propertyTypes';
import burgasCities from '@/data/burgasCities.json';
import styles from './PropertiesListView.module.scss';
import { ApartmentsFiltersPage, ApartmentFiltersState } from '@/features/map-filters/filter-subpages/ApartmentsFiltersPage';
import { HousesVillasFiltersPage, HouseFiltersState } from '@/features/map-filters/filter-subpages/HousesVillasFiltersPage';
import { StoresOfficesFiltersPage, CommercialFiltersState } from '@/features/map-filters/filter-subpages/StoresOfficesFiltersPage';
import { BuildingPlotsFiltersPage, BuildingPlotsFiltersState } from '@/features/map-filters/filter-subpages/BuildingPlotsFiltersPage';
import { AgriculturalLandFiltersPage, AgriculturalLandFiltersState } from '@/features/map-filters/filter-subpages/AgriculturalLandFiltersPage';
import { WarehousesIndustrialFiltersPage, WarehousesIndustrialFiltersState } from '@/features/map-filters/filter-subpages/WarehousesIndustrialFiltersPage';
import { GaragesParkingFiltersPage, GaragesParkingFiltersState } from '@/features/map-filters/filter-subpages/GaragesParkingFiltersPage';
import { HotelsMotelsFiltersPage, HotelsMotelsFiltersState } from '@/features/map-filters/filter-subpages/HotelsMotelsFiltersPage';
import { EstablishmentsFiltersPage, EstablishmentsFiltersState } from '@/features/map-filters/filter-subpages/EstablishmentsFiltersPage';
import { ReplaceRealEstatesFiltersPage, ReplaceRealEstatesFiltersState } from '@/features/map-filters/filter-subpages/ReplaceRealEstatesFiltersPage';
import { BuyRealEstatesFiltersPage, BuyRealEstatesFiltersState } from '@/features/map-filters/filter-subpages/BuyRealEstatesFiltersPage';
import { OtherRealEstatesFiltersPage, OtherRealEstatesFiltersState } from '@/features/map-filters/filter-subpages/OtherRealEstatesFiltersPage';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import type { Property } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface PropertiesListViewProps {
  mode: 'sales' | 'rent';
  propertyTypeId: string;
  onClose: () => void;
}

export function PropertiesListView({ mode, propertyTypeId, onClose }: PropertiesListViewProps) {
  const router = useRouter();
  const selectedPropertyType = propertyTypeId;

  // Store restored filters from URL
  const [restoredFilters, setRestoredFilters] = useState<ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null>(null);

  // Shared location state
  const [locationState, setLocationState] = useState({
    searchTerm: '',
    city: '',
    cityCoordinates: undefined as [number, number] | undefined,
    neighborhoods: [] as string[],
    distance: 0
  });

  // Store current filter state
  const currentFiltersRef = useRef<ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null>(null);

  // Fetch last 10 properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties', 'latest', 10],
    queryFn: async () => {
      const response = await fetch('/api/properties?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json() as Promise<Property[]>;
    },
  });

  // Filter properties by mode and type
  const filteredProperties = useMemo(() => {
    if (!properties.length) return [];
    
    return properties.filter(property => {
      // Filter by mode (sales/rent)
      if (mode === 'sales' && property.status !== 'for-sale') return false;
      if (mode === 'rent' && property.status !== 'for-rent') return false;
      
      // Filter by property type
      const typeMapping: Record<string, string[]> = {
        'apartments': ['apartment'],
        'houses-villas': ['house', 'villa'],
        'stores-offices': ['office', 'shop'],
        'building-plots': ['land'],
        'agricultural-land': ['agricultural'],
        'warehouses-industrial': ['warehouse'],
        'garages-parking': ['garage'],
        'hotels-motels': ['hotel'],
        'restaurants': ['restaurant'],
        'replace-real-estates': ['replace-real-estates'],
        'buy-real-estates': ['buy-real-estates'],
        'other-real-estates': ['other-real-estates'],
      };
      
      const allowedTypes = typeMapping[propertyTypeId] || [];
      if (allowedTypes.length > 0 && !allowedTypes.includes(property.type)) {
        return false;
      }
      
      return true;
    });
  }, [properties, mode, propertyTypeId]);

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

  // Map location handlers
  const handleLocationChange = useCallback((searchTerm: string, city: string, neighborhoods: string[], distance: number) => {
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

  const handleFiltersChange = useCallback((filters: ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState) => {
    currentFiltersRef.current = filters;
  }, []);

  // Get initial filters
  const getInitialFilters = useCallback(() => {
    if (!restoredFilters) return undefined;
    
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

  const handleSearch = useCallback(() => {
    // Navigate to the map filters page with the selected type
    const baseRoute = mode === 'sales' ? '/sale/search' : '/rent/search';
    router.push(`${baseRoute}/${propertyTypeId}`);
  }, [mode, propertyTypeId, router]);

  const selectedType = propertyTypes.find(type => type.id === selectedPropertyType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.propertiesListView}
    >
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <Button
              variant="outline"
              onClick={onClose}
              className={styles.closeButton}
            >
              <X size={20} />
              Затвори
            </Button>
            <h1 className={styles.title}>
              {mode === 'sales' ? 'Продажби' : 'Наеми'} - {selectedType?.label || 'Имоти'}
            </h1>
            <p className={styles.subtitle}>
              Последни 10 имоти
            </p>
          </div>
          {selectedType && (
            <div className={styles.headerIcon}>
              <selectedType.icon size={120} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.filtersPropertiesLayout}>
        {/* Properties List on the left */}
        <div className={styles.leftPropertiesColumn}>
          <div className={styles.propertiesList}>
            <div className={styles.listingsHeader}>
              <h2 className={styles.listingsTitle}>
                Намерени имоти: {filteredProperties.length}
              </h2>
              <Button
                variant="outline"
                onClick={handleSearch}
                className={styles.viewAllButton}
              >
                Виж всички
              </Button>
            </div>
            <div className={styles.listingsGrid}>
              {isLoadingProperties ? (
                <p className={styles.noResults}>Зареждане на имоти...</p>
              ) : filteredProperties.length === 0 ? (
                <p className={styles.noResults}>Няма намерени имоти</p>
              ) : (
                filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))
              )}
            </div>
          </div>
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
              isRentMode={mode === 'rent'}
            />
          ) : isHousesVillasSelected ? (
            <HousesVillasFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              isRentMode={mode === 'rent'}
            />
          ) : isStoresOfficesSelected ? (
            <StoresOfficesFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              isRentMode={mode === 'rent'}
            />
          ) : isBuildingPlotsSelected ? (
            <BuildingPlotsFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              initialFilters={getInitialFilters() as Partial<BuildingPlotsFiltersState> | undefined}
              isRentMode={mode === 'rent'}
            />
          ) : isAgriculturalLandSelected ? (
            <AgriculturalLandFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
            />
          ) : isWarehousesIndustrialSelected ? (
            <WarehousesIndustrialFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              isRentMode={mode === 'rent'}
            />
          ) : isGaragesParkingSelected ? (
            <GaragesParkingFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              initialFilters={getInitialFilters() as Partial<GaragesParkingFiltersState> | undefined}
              isRentMode={mode === 'rent'}
            />
          ) : isHotelsMotelsSelected ? (
            <HotelsMotelsFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              isRentMode={mode === 'rent'}
            />
          ) : isEstablishmentsSelected ? (
            <EstablishmentsFiltersPage
              locationState={locationState}
              onLocationChange={handleLocationChange}
              onFiltersChange={handleFiltersChange}
              onActionButtonsReady={handleActionButtonsReady}
              onSearch={handleSearch}
              isRentMode={mode === 'rent'}
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

      {/* Floating action buttons */}
      {(isApartmentsSelected || isHousesVillasSelected || isStoresOfficesSelected || isBuildingPlotsSelected || isAgriculturalLandSelected || isWarehousesIndustrialSelected || isGaragesParkingSelected || isHotelsMotelsSelected || isEstablishmentsSelected || isReplaceRealEstatesSelected || isBuyRealEstatesSelected || isOtherRealEstatesSelected) && actionButtons && (
        <div className={styles.actionButtonsWrapper}>
          {actionButtons}
        </div>
      )}
    </motion.div>
  );
}

