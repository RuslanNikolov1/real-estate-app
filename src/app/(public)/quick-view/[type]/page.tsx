'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { Pagination } from '@/components/ui/Pagination';
import type { Property } from '@/types';
import { propertyTypes } from '@/data/propertyTypes';
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
import styles from './page.module.scss';

// Map filter type IDs to database type IDs
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

type FilterState = ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState;

export default function QuickViewPage() {
  const params = useParams();
  const typeParam = params?.type as string;
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const [filteredError, setFilteredError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Location state
  const [locationState, setLocationState] = useState({
    searchTerm: '',
    city: '',
    cityCoordinates: undefined as [number, number] | undefined,
    neighborhoods: [] as string[],
    distance: 0
  });

  // Store current filter state
  const currentFiltersRef = useRef<FilterState | null>(null);
  const [hasFilters, setHasFilters] = useState(false);

  // Get property type info
  const propertyType = propertyTypes.find(pt => pt.id === typeParam);
  const databaseTypes = typeParam ? typeMapping[typeParam] : [];

  // Determine which filter component to show
  const isApartmentsSelected = typeParam === 'apartments';
  const isHousesVillasSelected = typeParam === 'houses-villas';
  const isStoresOfficesSelected = typeParam === 'stores-offices';
  const isBuildingPlotsSelected = typeParam === 'building-plots';
  const isAgriculturalLandSelected = typeParam === 'agricultural-land';
  const isWarehousesIndustrialSelected = typeParam === 'warehouses-industrial';
  const isGaragesParkingSelected = typeParam === 'garages-parking';
  const isHotelsMotelsSelected = typeParam === 'hotels-motels';
  const isEstablishmentsSelected = typeParam === 'restaurants';
  const isReplaceRealEstatesSelected = typeParam === 'replace-real-estates';
  const isBuyRealEstatesSelected = typeParam === 'buy-real-estates';
  const isOtherRealEstatesSelected = typeParam === 'other-real-estates';

  // Clean filters function (simplified version)
  const cleanFilters = useCallback((filters: FilterState | null) => {
    if (!filters) return null;
    
    const cleaned: any = {};
    
    if (filters.city && filters.city.trim()) {
      cleaned.city = filters.city;
    }
    
    if (filters.neighborhoods && Array.isArray(filters.neighborhoods) && filters.neighborhoods.length > 0) {
      cleaned.neighborhoods = filters.neighborhoods;
    }
    
    // Add other filter cleaning logic as needed (simplified for now)
    if ('apartmentSubtypes' in filters && Array.isArray(filters.apartmentSubtypes) && filters.apartmentSubtypes.length > 0) {
      const validSubtypes = filters.apartmentSubtypes.filter(s => s && s !== 'all');
      if (validSubtypes.length > 0) {
        cleaned.apartmentSubtypes = validSubtypes;
      }
    }
    
    if ('areaFrom' in filters && filters.areaFrom !== undefined && filters.areaFrom !== null && filters.areaFrom > 0) {
      cleaned.areaFrom = filters.areaFrom;
    }
    if ('areaTo' in filters && filters.areaTo !== undefined && filters.areaTo !== null) {
      cleaned.areaTo = filters.areaTo;
    }
    
    if ('priceFrom' in filters && filters.priceFrom !== undefined && filters.priceFrom !== null && filters.priceFrom > 0) {
      cleaned.priceFrom = filters.priceFrom;
    }
    if ('priceTo' in filters && filters.priceTo !== undefined && filters.priceTo !== null) {
      cleaned.priceTo = filters.priceTo;
    }
    
    if ('selectedFeatures' in filters && Array.isArray(filters.selectedFeatures) && filters.selectedFeatures.length > 0) {
      cleaned.selectedFeatures = filters.selectedFeatures;
    }
    
    if ('selectedFloorOptions' in filters && Array.isArray(filters.selectedFloorOptions) && filters.selectedFloorOptions.length > 0) {
      cleaned.selectedFloorOptions = filters.selectedFloorOptions;
    }
    
    if ('selectedConstructionTypes' in filters && Array.isArray(filters.selectedConstructionTypes) && filters.selectedConstructionTypes.length > 0) {
      cleaned.selectedConstructionTypes = filters.selectedConstructionTypes;
    }
    
    if ('selectedCompletionStatuses' in filters && Array.isArray(filters.selectedCompletionStatuses) && filters.selectedCompletionStatuses.length > 0) {
      cleaned.selectedCompletionStatuses = filters.selectedCompletionStatuses;
    }
    
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }, []);

  // Handle location change
  const handleLocationChange = useCallback((searchTerm: string, city: string, neighborhoods: string[], distance: number) => {
    setLocationState({
      searchTerm,
      city,
      cityCoordinates: undefined, // Can be enhanced later
      neighborhoods,
      distance
    });
  }, []);

  // Handle filters change
  const handleFiltersChange = useCallback((filters: FilterState) => {
    currentFiltersRef.current = filters;
    setHasFilters(true);
  }, []);

  // Handle search
  const handleSearch = useCallback(async () => {
    const filters = currentFiltersRef.current;
    if (!filters) return;

    setIsLoadingFiltered(true);
    setFilteredError(null);
    setFilteredProperties([]);
    setCurrentPage(1); // Reset to first page when searching

    try {
      const params = new URLSearchParams();
      params.set('baseRoute', '/sale/search');
      if (typeParam) {
        params.set('propertyTypeId', typeParam);
      }
      
      const cleanedFilters = cleanFilters(filters);
      if (cleanedFilters) {
        params.set('filters', encodeURIComponent(JSON.stringify(cleanedFilters)));
      }
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data: Property[] = await response.json();
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error fetching filtered properties:', error);
      setFilteredError('Грешка при зареждането на имотите.');
    } finally {
      setIsLoadingFiltered(false);
    }
  }, [typeParam, cleanFilters]);

  // Initial fetch of properties (fetch all, pagination is client-side)
  useEffect(() => {
    if (!typeParam || !databaseTypes.length) {
      setError('Невалиден тип имот');
      setIsLoading(false);
      return;
    }

    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentPage(1); // Reset to first page when type changes

        const queryParams = new URLSearchParams();
        queryParams.append('baseRoute', '/sale/search');
        queryParams.append('propertyTypeId', typeParam);
        // Don't set limit - fetch all properties for this type

        const response = await fetch(`/api/properties?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Грешка при зареждане на имотите');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [typeParam, databaseTypes]);

  // Determine which properties to display
  const allProperties = hasFilters ? filteredProperties : properties;
  const isLoadingDisplay = hasFilters ? isLoadingFiltered : isLoading;
  const errorDisplay = hasFilters ? filteredError : error;

  // Calculate pagination
  const totalPages = Math.ceil(allProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayProperties = useMemo(() => {
    return allProperties.slice(startIndex, endIndex);
  }, [allProperties, startIndex, endIndex]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of properties list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Продажби - {propertyType?.label || 'Имоти'}
            </h1>
            <p className={styles.subtitle}>
              {hasFilters 
                ? `Филтрирани имоти: ${allProperties.length} ${allProperties.length === 1 ? 'имот' : 'имота'}`
                : `Всички имоти: ${allProperties.length} ${allProperties.length === 1 ? 'имот' : 'имота'}`
              }
            </p>
          </div>

          {isLoadingDisplay && (
            <div className={styles.loading}>
              <p>Зареждане...</p>
            </div>
          )}

          {errorDisplay && (
            <div className={styles.error}>
              <p>{errorDisplay}</p>
            </div>
          )}

          {!isLoadingDisplay && !errorDisplay && (
            <div className={styles.filtersPropertiesLayout}>
              <div className={styles.leftPropertiesColumn}>
                {allProperties.length === 0 ? (
                  <div className={styles.propertiesList}>
                    <div className={styles.empty}>
                      <p>Няма налични имоти от този тип.</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.propertiesList}>
                    <div className={styles.listingsGrid}>
                      {displayProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          onClick={() => window.location.href = `/properties/${property.id}`}
                        />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className={styles.rightFiltersColumn}>
                {isApartmentsSelected && (
                  <ApartmentsFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isHousesVillasSelected && (
                  <HousesVillasFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isStoresOfficesSelected && (
                  <StoresOfficesFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isBuildingPlotsSelected && (
                  <BuildingPlotsFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isAgriculturalLandSelected && (
                  <AgriculturalLandFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                  />
                )}
                {isWarehousesIndustrialSelected && (
                  <WarehousesIndustrialFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isGaragesParkingSelected && (
                  <GaragesParkingFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isHotelsMotelsSelected && (
                  <HotelsMotelsFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isEstablishmentsSelected && (
                  <EstablishmentsFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                    isRentMode={false}
                  />
                )}
                {isReplaceRealEstatesSelected && (
                  <ReplaceRealEstatesFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                  />
                )}
                {isBuyRealEstatesSelected && (
                  <BuyRealEstatesFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                  />
                )}
                {isOtherRealEstatesSelected && (
                  <OtherRealEstatesFiltersPage
                    locationState={locationState}
                    onLocationChange={handleLocationChange}
                    onFiltersChange={handleFiltersChange}
                    onActionButtonsReady={() => {}}
                    onSearch={handleSearch}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
