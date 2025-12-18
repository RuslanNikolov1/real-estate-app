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
import { Pagination } from '@/components/ui/Pagination';
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
                let restoredFilters = JSON.parse(filtersJson) as ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState;
                
                // Map commercialSubtypes back to propertyTypes for stores/offices filters
                if (restoredFilters && 'commercialSubtypes' in restoredFilters && !('propertyTypes' in restoredFilters)) {
                    (restoredFilters as any).propertyTypes = (restoredFilters as any).commercialSubtypes || [];
                    delete (restoredFilters as any).commercialSubtypes;
                }
                
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
                
                // Fetch properties based on restored filters
                if (restoredFilters && !('propertyId' in restoredFilters && restoredFilters.propertyId && restoredFilters.propertyId.trim())) {
                    setIsLoadingProperties(true);
                    const fetchParams = new URLSearchParams();
                    fetchParams.set('baseRoute', baseRoute);
                    if (selectedPropertyType) {
                        fetchParams.set('propertyTypeId', selectedPropertyType);
                    }
                    fetchParams.set('filters', encodeURIComponent(JSON.stringify(restoredFilters)));
                    
                    fetch(`/api/properties?${fetchParams.toString()}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to fetch properties');
                            }
                            return response.json();
                        })
                        .then((data: Property[]) => {
                            setFilteredProperties(data);
                            setCurrentPage(1); // Reset to first page when restoring filters
                        })
                        .catch(error => {
                            console.error('Error fetching properties:', error);
                            setPropertiesError('Грешка при зареждането на имотите.');
                        })
                        .finally(() => {
                            setIsLoadingProperties(false);
                        });
                }
            } catch (error) {
                console.error('Error restoring filters from URL:', error);
            }
        }
    }, [baseRoute, selectedPropertyType]);

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

    const handleFiltersChange = useCallback((
        filters:
          | ApartmentFiltersState
          | HouseFiltersState
          | CommercialFiltersState
          | BuildingPlotsFiltersState
          | AgriculturalLandFiltersState
          | WarehousesIndustrialFiltersState
          | GaragesParkingFiltersState
          | HotelsMotelsFiltersState
          | EstablishmentsFiltersState
          | ReplaceRealEstatesFiltersState
          | BuyRealEstatesFiltersState
          | OtherRealEstatesFiltersState,
      ) => {
        // Store filters in ref for URL serialization
        currentFiltersRef.current = filters;
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
    
    // State for filtered properties
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [propertiesError, setPropertiesError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State to track whether to show map or listings
    const [showListings, setShowListings] = useState(() => {
        // Check if URL has search params on initial load
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.has('search') || params.has('filters');
        }
        return false;
    });

    // Clean filters by removing default/unchanged values before sending to API
    // Helper function to format city name: first letter uppercase, rest lowercase for each word
    const formatCityName = useCallback((cityName: string): string => {
        if (!cityName || !cityName.trim()) return cityName;
        return cityName
            .trim()
            .split(/\s+/)
            .map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }, []);

    const cleanFilters = useCallback((filters: ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null) => {
        if (!filters) return null;
        
        const cleaned: any = {};
        
        // Copy non-numeric, non-array fields that have actual values
        if (filters.city && filters.city.trim()) {
            cleaned.city = formatCityName(filters.city);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:330',message:'City formatted in cleanFilters',data:{original:filters.city,formatted:cleaned.city},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
        }
        
        if (filters.neighborhoods && Array.isArray(filters.neighborhoods) && filters.neighborhoods.length > 0) {
            // Format each neighborhood: first letter uppercase, rest lowercase for each word
            // Exception: keep abbreviations like "ж.к" lowercase
            cleaned.neighborhoods = filters.neighborhoods.map(neighborhood => {
                if (!neighborhood || !neighborhood.trim()) return neighborhood;
                const formatted = neighborhood
                    .trim()
                    .split(/\s+/)
                    .map(word => {
                        if (word.length === 0) return word;
                        // Keep abbreviations like "ж.к", "ж.к.", "ул.", etc. lowercase
                        const lowerWord = word.toLowerCase();
                        if (lowerWord.startsWith('ж.к') || lowerWord.startsWith('ул.') || lowerWord.startsWith('бул.')) {
                            return lowerWord;
                        }
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                    })
                    .join(' ');
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:345',message:'Formatting neighborhood in cleanFilters',data:{original:neighborhood,formatted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
                // #endregion
                
                return formatted;
            });
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:356',message:'Cleaned neighborhoods array',data:{neighborhoods:cleaned.neighborhoods,city:cleaned.city},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
        }
        
        if ('propertyId' in filters && filters.propertyId && filters.propertyId.trim()) {
            cleaned.propertyId = filters.propertyId.trim();
        }
        
        // Subtype filters - only include if not empty
        if ('apartmentSubtypes' in filters && Array.isArray(filters.apartmentSubtypes) && filters.apartmentSubtypes.length > 0) {
            const validSubtypes = filters.apartmentSubtypes.filter(s => s && s !== 'all');
            if (validSubtypes.length > 0) {
                cleaned.apartmentSubtypes = validSubtypes;
            }
        }
        
        if ('houseTypes' in filters && Array.isArray(filters.houseTypes) && filters.houseTypes.length > 0) {
            const validTypes = filters.houseTypes.filter(t => t && t !== 'all');
            if (validTypes.length > 0) {
                cleaned.houseTypes = validTypes;
            }
        }
        
        if ('propertyTypes' in filters && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0) {
            const validTypes = filters.propertyTypes.filter(t => t && t !== 'all');
            if (validTypes.length > 0) {
                cleaned.propertyTypes = validTypes;
            }
        }
        
        // Area filters - only include if explicitly set (not undefined, null, 0, or default values)
        // Defaults: apartments=20/100, houses=50/200, commercial=0/420, etc.
        if ('areaFrom' in filters && filters.areaFrom !== undefined && filters.areaFrom !== null && filters.areaFrom > 0) {
            // Exclude common default values
            if (filters.areaFrom !== 20 && filters.areaFrom !== 50 && filters.areaFrom !== 0) {
                cleaned.areaFrom = filters.areaFrom;
            }
        }
        if ('areaTo' in filters && filters.areaTo !== undefined && filters.areaTo !== null) {
            // Exclude common default max values (100 for apartments, 200 for houses, 420 for commercial, etc.)
            if (filters.areaTo !== 100 && filters.areaTo !== 200 && filters.areaTo !== 420 && 
                filters.areaTo !== 256 && filters.areaTo < 256) {
                cleaned.areaTo = filters.areaTo;
            }
        }
        
        // House area filters (houseAreaFrom/houseAreaTo)
        if ('houseAreaFrom' in filters && filters.houseAreaFrom !== undefined && filters.houseAreaFrom !== null && filters.houseAreaFrom > 0 && filters.houseAreaFrom !== 50) {
            cleaned.houseAreaFrom = filters.houseAreaFrom;
        }
        if ('houseAreaTo' in filters && filters.houseAreaTo !== undefined && filters.houseAreaTo !== null && filters.houseAreaTo !== 200 && filters.houseAreaTo < 350) {
            cleaned.houseAreaTo = filters.houseAreaTo;
        }
        
        // Yard area filters (for houses/villas) - defaults: 100/500
        if ('yardAreaFrom' in filters && filters.yardAreaFrom !== undefined && filters.yardAreaFrom !== null && filters.yardAreaFrom > 0 && filters.yardAreaFrom !== 100) {
            cleaned.yardAreaFrom = filters.yardAreaFrom;
        }
        if ('yardAreaTo' in filters && filters.yardAreaTo !== undefined && filters.yardAreaTo !== null && filters.yardAreaTo !== 500 && filters.yardAreaTo < 1000) {
            cleaned.yardAreaTo = filters.yardAreaTo;
        }
        
        // Price filters - only include if not at default min (0) or max
        // Different property types have different max values
        if ('priceFrom' in filters && filters.priceFrom !== undefined && filters.priceFrom !== null && filters.priceFrom > 0) {
            cleaned.priceFrom = filters.priceFrom;
        }
        if ('priceTo' in filters && filters.priceTo !== undefined && filters.priceTo !== null) {
            // Exclude common default max values for different property types
            // apartments=300000, houses=420000, commercial=560000, hotels=3200000, etc.
            const isMaxValue = filters.priceTo >= 300000; // Most common max, but could be higher for other types
            if (!isMaxValue) {
                cleaned.priceTo = filters.priceTo;
            }
        }
        
        // Price per sqm filters
        if ('pricePerSqmFrom' in filters && filters.pricePerSqmFrom !== undefined && filters.pricePerSqmFrom !== null && filters.pricePerSqmFrom > 0) {
            cleaned.pricePerSqmFrom = filters.pricePerSqmFrom;
        }
        if ('pricePerSqmTo' in filters && filters.pricePerSqmTo !== undefined && filters.pricePerSqmTo !== null) {
            const isMaxValue = filters.pricePerSqmTo >= 3000; // PRICE_PER_SQM_SLIDER_MAX
            if (!isMaxValue) {
                cleaned.pricePerSqmTo = filters.pricePerSqmTo;
            }
        }
        
        // Rent-specific filters - exclude default min/max values
        // Different property types have different rent defaults
        if ('monthlyRentFrom' in filters && filters.monthlyRentFrom !== undefined && filters.monthlyRentFrom !== null && filters.monthlyRentFrom > 0) {
            // Exclude common default min values (20 for apartments, 25 for houses, 0 for garages, etc.)
            if (filters.monthlyRentFrom !== 20 && filters.monthlyRentFrom !== 25 && filters.monthlyRentFrom !== 0 && filters.monthlyRentFrom !== 1 && filters.monthlyRentFrom !== 600) {
                cleaned.monthlyRentFrom = filters.monthlyRentFrom;
            }
        }
        if ('monthlyRentTo' in filters && filters.monthlyRentTo !== undefined && filters.monthlyRentTo !== null) {
            // Exclude common default max values (1800 for apartments, 6300 for houses, 350 for garages, 42000 for hotels, etc.)
            if (filters.monthlyRentTo !== 1800 && filters.monthlyRentTo !== 6300 && filters.monthlyRentTo !== 350 && 
                filters.monthlyRentTo !== 42000 && filters.monthlyRentTo !== 5600) {
                cleaned.monthlyRentTo = filters.monthlyRentTo;
            }
        }
        if ('rentPerSqmFrom' in filters && filters.rentPerSqmFrom !== undefined && filters.rentPerSqmFrom !== null && filters.rentPerSqmFrom > 0) {
            cleaned.rentPerSqmFrom = filters.rentPerSqmFrom;
        }
        if ('rentPerSqmTo' in filters && filters.rentPerSqmTo !== undefined && filters.rentPerSqmTo !== null) {
            // Exclude common default max values (24 for apartments, 28 for houses, 32 for garages, 20 for hotels, etc.)
            if (filters.rentPerSqmTo !== 24 && filters.rentPerSqmTo !== 28 && filters.rentPerSqmTo !== 32 && 
                filters.rentPerSqmTo !== 20 && filters.rentPerSqmTo !== 6) {
                cleaned.rentPerSqmTo = filters.rentPerSqmTo;
            }
        }
        
        // Year filters - only include if not at default min/max
        if ('yearFrom' in filters && filters.yearFrom !== undefined && filters.yearFrom !== null && filters.yearFrom > 1900) {
            cleaned.yearFrom = filters.yearFrom;
        }
        if ('yearTo' in filters && filters.yearTo !== undefined && filters.yearTo !== null && filters.yearTo < 2050) {
            cleaned.yearTo = filters.yearTo;
        }
        if ('isYearNotProvided' in filters && filters.isYearNotProvided) {
            cleaned.isYearNotProvided = filters.isYearNotProvided;
        }
        
        // Floor filters
        if ('floorFrom' in filters && filters.floorFrom !== undefined && filters.floorFrom !== null && filters.floorFrom > 0) {
            cleaned.floorFrom = filters.floorFrom;
        }
        if ('floorTo' in filters && filters.floorTo !== undefined && filters.floorTo !== null && filters.floorTo < 20) {
            cleaned.floorTo = filters.floorTo;
        }
        if ('selectedFloorOptions' in filters && Array.isArray(filters.selectedFloorOptions) && filters.selectedFloorOptions.length > 0) {
            cleaned.selectedFloorOptions = filters.selectedFloorOptions;
        }
        if ('isFloorNotProvided' in filters && filters.isFloorNotProvided) {
            cleaned.isFloorNotProvided = filters.isFloorNotProvided;
        }
        
        // Array filters - only include if not empty
        if ('selectedFeatures' in filters && Array.isArray(filters.selectedFeatures) && filters.selectedFeatures.length > 0) {
            cleaned.selectedFeatures = filters.selectedFeatures;
        }
        if ('selectedConstructionTypes' in filters && Array.isArray(filters.selectedConstructionTypes) && filters.selectedConstructionTypes.length > 0) {
            cleaned.selectedConstructionTypes = filters.selectedConstructionTypes;
        }
        if ('selectedCompletionStatuses' in filters && Array.isArray(filters.selectedCompletionStatuses) && filters.selectedCompletionStatuses.length > 0) {
            cleaned.selectedCompletionStatuses = filters.selectedCompletionStatuses;
        }
        if ('selectedBuildingTypes' in filters && Array.isArray((filters as any).selectedBuildingTypes) && (filters as any).selectedBuildingTypes.length > 0) {
            // For commercial properties (stores/offices) - building types filter
            cleaned.buildingTypes = (filters as any).selectedBuildingTypes;
        }
        if ('propertyTypes' in filters && Array.isArray((filters as any).propertyTypes) && (filters as any).propertyTypes.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:522',message:'Processing propertyTypes in cleanFilters',data:{propertyTypes:(filters as any).propertyTypes,propertyTypeId:selectedPropertyType,isCommercial:selectedPropertyType === 'stores-offices',isAgricultural:selectedPropertyType === 'agricultural-land'},timestamp:Date.now(),sessionId:'debug-session',runId:'vineyard-search-debug',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            // For commercial properties (stores/offices) - subtype filter (store, office, cabinet, beauty-salon, etc.)
            const validPropertyTypes = (filters as any).propertyTypes.filter((type: string) => type && type !== 'all');
            if (validPropertyTypes.length > 0) {
                // Check if this is for agricultural land or commercial
                if (selectedPropertyType === 'agricultural-land') {
                    // For agricultural land, keep as propertyTypes (will be handled as agricultural subtypes in API)
                    cleaned.propertyTypes = validPropertyTypes;
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:530',message:'Agricultural propertyTypes kept as-is',data:{validPropertyTypes,cleanedPropertyTypes:cleaned.propertyTypes},timestamp:Date.now(),sessionId:'debug-session',runId:'vineyard-search-debug',hypothesisId:'H1'})}).catch(()=>{});
                    // #endregion
                } else {
                    // For commercial properties, convert to commercialSubtypes
                    cleaned.commercialSubtypes = validPropertyTypes;
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:536',message:'Converting propertyTypes to commercialSubtypes',data:{originalPropertyTypes:(filters as any).propertyTypes,validPropertyTypes,cleanedCommercialSubtypes:cleaned.commercialSubtypes},timestamp:Date.now(),sessionId:'debug-session',runId:'subtype-filter-debug',hypothesisId:'H1'})}).catch(()=>{});
                    // #endregion
                }
            }
        }
        if ('selectedCategories' in filters && Array.isArray(filters.selectedCategories) && filters.selectedCategories.length > 0) {
            cleaned.selectedCategories = filters.selectedCategories;
        }
        if ('selectedFurnishing' in filters && Array.isArray(filters.selectedFurnishing) && filters.selectedFurnishing.length > 0) {
            cleaned.selectedFurnishing = filters.selectedFurnishing;
        }
        if ('selectedWorkingOptions' in filters && Array.isArray(filters.selectedWorkingOptions) && filters.selectedWorkingOptions.length > 0) {
            cleaned.selectedWorkingOptions = filters.selectedWorkingOptions;
        }
        if ('selectedElectricityOptions' in filters && Array.isArray(filters.selectedElectricityOptions) && filters.selectedElectricityOptions.length > 0) {
            // For building plots - electricity filter
            cleaned.electricityOptions = filters.selectedElectricityOptions;
        }
        if ('selectedWaterOptions' in filters && Array.isArray(filters.selectedWaterOptions) && filters.selectedWaterOptions.length > 0) {
            // For building plots - water filter
            cleaned.waterOptions = filters.selectedWaterOptions;
        }
        
        // Bed base filters
        if ('bedBaseFrom' in filters && filters.bedBaseFrom !== undefined && filters.bedBaseFrom !== null && filters.bedBaseFrom > 0) {
            cleaned.bedBaseFrom = filters.bedBaseFrom;
        }
        if ('bedBaseTo' in filters && filters.bedBaseTo !== undefined && filters.bedBaseTo !== null && filters.bedBaseTo < 120) {
            cleaned.bedBaseTo = filters.bedBaseTo;
        }
        
        // Distance filter
        if ('distance' in filters && filters.distance !== undefined && filters.distance !== null && filters.distance > 0) {
            cleaned.distance = filters.distance;
        }
        
        // Remove empty strings
        if ('searchTerm' in filters && filters.searchTerm && filters.searchTerm.trim()) {
            cleaned.searchTerm = filters.searchTerm.trim();
        }
        
        // Remove false boolean values (they're only meaningful when true)
        // Note: We don't include false values as they indicate "not set"
        
        return Object.keys(cleaned).length > 0 ? cleaned : null;
    }, [selectedPropertyType]);
    
    // Serialize filters to URL query params
    const serializeFiltersToURL = useCallback((filters: ApartmentFiltersState | HouseFiltersState | CommercialFiltersState | BuildingPlotsFiltersState | AgriculturalLandFiltersState | WarehousesIndustrialFiltersState | GaragesParkingFiltersState | HotelsMotelsFiltersState | EstablishmentsFiltersState | ReplaceRealEstatesFiltersState | BuyRealEstatesFiltersState | OtherRealEstatesFiltersState | null) => {
        if (!filters) return '';
        
        const params = new URLSearchParams();
        params.set('search', '1');
        
        // Clean filters before serializing
        const cleanedFilters = cleanFilters(filters);
        
        // Serialize filter state to JSON and encode it
        try {
            const filtersJson = JSON.stringify(cleanedFilters || filters);
            params.set('filters', encodeURIComponent(filtersJson));
        } catch (error) {
            console.error('Error serializing filters:', error);
        }
        
        return params.toString();
    }, [cleanFilters, formatCityName]);

    const handleSearch = useCallback(async () => {
        const filters = currentFiltersRef.current;
        setSelectedPropertyById(null);
        setPropertyByIdError(null);
        setIsLoadingPropertyById(false);
        setFilteredProperties([]);
        setPropertiesError(null);
        setCurrentPage(1); // Reset to first page when searching

        // Format city name before search
        if (locationState.city && locationState.city.trim()) {
            const formattedCity = formatCityName(locationState.city);
            if (formattedCity !== locationState.city) {
                // Update location state with formatted city
                handleLocationChange(
                    locationState.searchTerm,
                    formattedCity,
                    locationState.neighborhoods,
                    locationState.distance
                );
            }
        }

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
            // Fetch properties based on filters
            setIsLoadingProperties(true);
            try {
                // Use formatted city from locationState (already formatted above)
                const cityToUse = locationState.city ? formatCityName(locationState.city) : '';
                
                const params = new URLSearchParams();
                params.set('baseRoute', baseRoute);
                if (selectedPropertyType) {
                    params.set('propertyTypeId', selectedPropertyType);
                }
                if (filters) {
                    // Clean filters to remove default values before sending to API
                    // cleanFilters already formats the city
                    const cleanedFilters = cleanFilters(filters);
                    if (cleanedFilters) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MapFiltersPage.tsx:625',message:'Sending filters to API',data:{cleanedFilters,serialized:encodeURIComponent(JSON.stringify(cleanedFilters))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
                        // #endregion
                        params.set('filters', encodeURIComponent(JSON.stringify(cleanedFilters)));
                    }
                }
                
                const response = await fetch(`/api/properties?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch properties');
                }
                const data: Property[] = await response.json();
                setFilteredProperties(data);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setPropertiesError('Грешка при зареждането на имотите.');
            } finally {
                setIsLoadingProperties(false);
            }
            
            // Also update URL
            const queryString = serializeFiltersToURL(filters);
            const currentPath = selectedPropertyType 
                ? `${baseRoute}/${selectedPropertyType}` 
                : baseRoute;
            router.push(`${currentPath}?${queryString}`);
        }
        setShowListings(true);
    }, [selectedPropertyType, router, serializeFiltersToURL, baseRoute, locationState, formatCityName, handleLocationChange]);

    const handleBackToMap = useCallback(() => {
        // For sale search: go back to /sale/search when a type is selected
        // For rent search: go back to /rent/search when a type is selected
        // For sale/rent search without a type, go back to root
        const isSaleSearch = baseRoute === '/sale/search';
        const isRentSearch = baseRoute === '/rent/search';
        const isSearchRoute = isSaleSearch || isRentSearch;
        
        let currentPath: string;
        if (isSaleSearch && selectedPropertyType) {
            // /sale/search/[type] → back to /sale/search
            currentPath = baseRoute;
        } else if (isRentSearch && selectedPropertyType) {
            // /rent/search/[type] → back to /rent/search
            currentPath = baseRoute;
        } else if (isSearchRoute && !selectedPropertyType) {
            // /sale/search or /rent/search (no type) → back to root
            currentPath = '/';
        } else {
            // Other routes (e.g., /map-filters)
            currentPath = selectedPropertyType ? `${baseRoute}/${selectedPropertyType}` : baseRoute;
        }

        // Remove search params from URL and reset state
        router.push(currentPath);
        setShowListings(false);
        setCurrentPage(1); // Reset to first page when going back to map
    }, [selectedPropertyType, router, baseRoute]);

    // Calculate pagination for filtered properties
    const totalPages = useMemo(() => {
        if (selectedPropertyById) return 1;
        return Math.ceil(filteredProperties.length / itemsPerPage);
    }, [filteredProperties.length, selectedPropertyById, itemsPerPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProperties = useMemo(() => {
        if (selectedPropertyById) return [selectedPropertyById];
        return filteredProperties.slice(startIndex, endIndex);
    }, [filteredProperties, startIndex, endIndex, selectedPropertyById]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top of listings
        const listingsElement = document.querySelector(`.${styles.propertyListings}`);
        if (listingsElement) {
            listingsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Filter property types for rent/search and sale/search routes
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
        if (baseRoute === '/sale/search') {
            // Filter out 'other-real-estates' from sale/search
            return propertyTypes.filter(type => type.id !== 'other-real-estates');
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
                            onClick={() => {
                                const isSaleSearch = baseRoute === '/sale/search';
                                const isRentSearch = baseRoute === '/rent/search';
                                const isSearchRoute = isSaleSearch || isRentSearch;

                                // Check for query parameters
                                const params = new URLSearchParams(window.location.search);
                                const hasQueryParams = params.has('search') || params.has('filters');

                                let targetPath: string;
                                
                                if (hasQueryParams && selectedPropertyType) {
                                    // Case 3: /sale/search/[subtype]?search=... → /sale/search/[subtype]
                                    targetPath = `${baseRoute}/${selectedPropertyType}`;
                                } else if (selectedPropertyType && isSearchRoute) {
                                    // Case 2: /sale/search/[subtype] → /sale/search
                                    targetPath = baseRoute;
                                } else if (isSearchRoute && !selectedPropertyType) {
                                    // Case 1: /sale/search → /
                                    targetPath = '/';
                                } else {
                                    // Other routes (e.g., /map-filters)
                                    targetPath = selectedPropertyType ? `${baseRoute}/${selectedPropertyType}` : baseRoute;
                                }
                                
                                setShowListings(false);
                                router.push(targetPath);
                            }}
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
                                                {selectedPropertyById ? 1 : filteredProperties.length}
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
                                            ) : isLoadingProperties ? (
                                                <p className={styles.noResults}>Зареждане на имоти...</p>
                                            ) : propertiesError ? (
                                                <p className={styles.noResults}>{propertiesError}</p>
                                            ) : filteredProperties.length === 0 ? (
                                                <p className={styles.noResults}>Няма намерени имоти с избраните филтри</p>
                                            ) : (
                                                paginatedProperties.map((property) => (
                                                    <PropertyCard
                                                        key={property.id}
                                                        property={property}
                                                    />
                                                ))
                                            )}
                                        </div>
                                        {!selectedPropertyById && !isLoadingPropertyById && !propertyByIdError && !isLoadingProperties && !propertiesError && filteredProperties.length > 0 && totalPages > 1 && (
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        )}
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
