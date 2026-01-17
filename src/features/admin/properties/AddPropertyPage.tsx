'use client';

import { useEffect, useMemo, useRef, useState, DragEvent, useId } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import {
  APARTMENT_FEATURE_FILTERS,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
  FLOOR_SPECIAL_OPTIONS,
  HOUSE_TYPES,
  BUILDING_TYPES,
  GARAGE_CONSTRUCTION_TYPES,
  ESTABLISHMENTS_LOCATION_TYPES,
  ESTABLISHMENT_CONSTRUCTION_TYPES,
  HOTEL_CATEGORIES,
  HOTEL_CONSTRUCTION_TYPES,
  RENT_HOUSE_FEATURES,
  RENT_COMMERCIAL_FEATURES,
  RENT_GARAGE_FEATURES,
  RENT_WAREHOUSE_FEATURES,
  RENT_BUILDING_PLOTS_FEATURES,
  RENT_APARTMENT_FEATURES,
  RENT_HOTEL_FEATURES,
  RENT_RESTAURANT_FEATURES,
  RENT_COMMERCIAL_FLOOR_OPTIONS,
} from '@/features/map-filters/filters/constants';
import { CITY_OPTIONS, getNeighborhoodsByCity, getInitialCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import {
  getPropertyTypeSchema,
} from '@/lib/property-schemas';
import { getAvailablePropertyTypesForAddPage } from '@/lib/property-type-mapper';
import { normalizeSubtypeToId } from '@/lib/subtype-mapper';
import { uploadToCloudinary } from '@/lib/cloudinary';
import type { PropertyType, Property } from '@/types';
import styles from './AddPropertyPage.module.scss';

const PROPERTY_STATUSES = [
  { id: 'for-sale', label: 'За продажба' },
  { id: 'for-rent', label: 'Под наем' },
];

interface AddPropertyPageProps {
  propertyId?: string;
  initialProperty?: Property;
}

export function AddPropertyPage({ propertyId, initialProperty }: AddPropertyPageProps = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPage = pathname === '/post-property';
  const isUpdateMode = !!propertyId;
  const [isLoadingProperty, setIsLoadingProperty] = useState(!!propertyId && !initialProperty);
  const [propertyLoadError, setPropertyLoadError] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | undefined>(initialProperty);
  const [selectedStatus, setSelectedStatus] = useState(PROPERTY_STATUSES[0].id);
  
  // Fetch property data when propertyId is provided
  useEffect(() => {
    if (!propertyId || initialProperty) {
      setIsLoadingProperty(false);
      return;
    }

    let isCancelled = false;

    const fetchProperty = async () => {
      try {
        setIsLoadingProperty(true);
        setPropertyLoadError(null);

        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }

        const data: Property = await response.json();
        if (!isCancelled) {
          setProperty(data);
        }
      } catch (error) {
        console.error('Error loading property:', error);
        if (!isCancelled) {
          setPropertyLoadError('Грешка при зареждане на имота.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProperty(false);
        }
      }
    };

    fetchProperty();

    return () => {
      isCancelled = true;
    };
  }, [propertyId, initialProperty]);
  
  // Get available property types based on sale/rent status
  const availablePropertyTypes = useMemo(() => {
    const isRent = selectedStatus === 'for-rent';
    return getAvailablePropertyTypesForAddPage(isRent);
  }, [selectedStatus]);
  
  const [selectedType, setSelectedType] = useState(() => {
    const isRent = PROPERTY_STATUSES[0].id === 'for-rent';
    const initialTypes = getAvailablePropertyTypesForAddPage(isRent);
    return initialTypes[0]?.id || 'apartment';
  });
  const [selectedCompletion, setSelectedCompletion] = useState(COMPLETION_STATUSES[0].id);
  const [selectedConstruction, setSelectedConstruction] = useState(CONSTRUCTION_FILTERS[0].id);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const initialCity = getInitialCity();
  const [city, setCity] = useState(initialCity);
  const [neighborhood, setNeighborhood] = useState(() => {
    const initialOptions = getNeighborhoodsByCity(initialCity);
    return initialOptions[0] ?? '';
  });
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const createdObjectUrls = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFilesRef = useRef<File[]>([]);
  const brokerImageInputRef = useRef<HTMLInputElement | null>(null);
  const brokerImageFileRef = useRef<File | null>(null);
  const [brokerImagePreview, setBrokerImagePreview] = useState<string | null>(null);
  const [broker, setBroker] = useState({
    name: '',
    title: '',
    phone: '',
  });
  const [yearBuilt, setYearBuilt] = useState('');
  const [subtype, setSubtype] = useState('');
  const [yardArea, setYardArea] = useState('');
  const [floor, setFloor] = useState<string>('');
  const [buildingType, setBuildingType] = useState('');
  const [electricity, setElectricity] = useState('');
  const [water, setWater] = useState('');
  const [hotelCategory, setHotelCategory] = useState('');
  const [agriculturalCategory, setAgriculturalCategory] = useState('');
  const [bedBase, setBedBase] = useState('');
  // Rent-specific fields
  const [furnishing, setFurnishing] = useState<string>('');
  const [houseTypes, setHouseTypes] = useState<string[]>([]);
  const [workingOptions, setWorkingOptions] = useState<string[]>([]);
  const [works, setWorks] = useState<string>('');
  const [locationType, setLocationType] = useState('');
  const [restaurantFurniture, setRestaurantFurniture] = useState<string>('');
  const descriptionFieldId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Furnishing options for rent
  const FURNISHING_OPTIONS = [
    { id: 'furnished', label: 'Обзаведен' },
    { id: 'partially-furnished', label: 'Частично обзаведен' },
    { id: 'unfurnished', label: 'Необзаведен' }
  ];
  
  // Working options for hotels in rent mode
  const WORKING_OPTIONS = [
    { id: 'seasonal', label: 'Работи сезонно' },
    { id: 'year-round', label: 'Работи целогодишно' }
  ];

  // Hotel subtypes for rent mode
  const RENT_HOTEL_SUBTYPES = [
    { id: 'other', label: 'Друго' },
    { id: 'family-hotel', label: 'Семеен хотел' },
    { id: 'hotel', label: 'Хотел' },
    { id: 'hostel-pension', label: 'Хостел/Пансион' },
    { id: 'lodge', label: 'Къща за гости' },
  ];

  // Get schema for current property type
  const typeSchema = useMemo(() => getPropertyTypeSchema(selectedType as PropertyType), [selectedType]);
  
  // Check if we're in rent mode
  const isRentMode = useMemo(() => selectedStatus === 'for-rent', [selectedStatus]);

  // Get subtype options - use custom list for rent hotels
  const subtypeOptions = useMemo(() => {
    if (isRentMode && selectedType === 'hotel') {
      return RENT_HOTEL_SUBTYPES;
    }
    return typeSchema.subtypeOptions;
  }, [isRentMode, selectedType, typeSchema.subtypeOptions]);
  
  // Get features list for current property type
  const featuresList = useMemo(() => {
    // For rent apartments, use RENT_APARTMENT_FEATURES instead of schema features
    if (isRentMode && selectedType === 'apartment') {
      return RENT_APARTMENT_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent houses, use RENT_HOUSE_FEATURES instead of schema features
    if (isRentMode && selectedType === 'house') {
      return RENT_HOUSE_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent offices/shops, use RENT_COMMERCIAL_FEATURES instead of schema features
    if (isRentMode && (selectedType === 'office' || selectedType === 'shop')) {
      return RENT_COMMERCIAL_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent garages, use RENT_GARAGE_FEATURES instead of schema features
    if (isRentMode && selectedType === 'garage') {
      return RENT_GARAGE_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent warehouses, use RENT_WAREHOUSE_FEATURES instead of schema features
    if (isRentMode && selectedType === 'warehouse') {
      return RENT_WAREHOUSE_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent building plots (land), use RENT_BUILDING_PLOTS_FEATURES instead of schema features
    if (isRentMode && selectedType === 'land') {
      return RENT_BUILDING_PLOTS_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent hotels, use RENT_HOTEL_FEATURES instead of schema features
    if (isRentMode && selectedType === 'hotel') {
      return RENT_HOTEL_FEATURES.filter(f => f.id !== 'all');
    }
    // For rent restaurants, use RENT_RESTAURANT_FEATURES instead of schema features
    if (isRentMode && selectedType === 'restaurant') {
      return RENT_RESTAURANT_FEATURES.filter(f => f.id !== 'all');
    }
    const featuresField = typeSchema.fields.find(f => f.key === 'features');
    const defaultFeatures = featuresField?.options || [];
    return defaultFeatures;
  }, [typeSchema, isRentMode, selectedType]);
  
  // Check which fields should be shown
  
  const showFloor = useMemo(() => {
    return selectedType === 'apartment' || selectedType === 'office' || selectedType === 'shop';
  }, [selectedType]);
  
  
  const showYardArea = useMemo(() => {
    return selectedType === 'house';
  }, [selectedType]);
  
  const showConstruction = useMemo(() => {
    const constructionField = typeSchema.fields.find(f => f.key === 'construction_type');
    return !!constructionField;
  }, [typeSchema]);
  
  const showCompletion = useMemo(() => {
    const completionField = typeSchema.fields.find(f => f.key === 'completion_status');
    return !!completionField;
  }, [typeSchema]);
  
  // Rent-specific field visibility
  const showFurnishing = useMemo(() => isRentMode && (selectedType === 'apartment' || selectedType === 'house'), [isRentMode, selectedType]);
  const showHouseTypes = useMemo(() => isRentMode && selectedType === 'house', [isRentMode, selectedType]);
  const showBuildingTypeForRent = useMemo(() => isRentMode && selectedType === 'office', [isRentMode, selectedType]);
  const showWorkingOptions = useMemo(() => isRentMode && (selectedType === 'hotel' || selectedType === 'restaurant'), [isRentMode, selectedType]);
  const showLocationType = useMemo(() => isRentMode && selectedType === 'restaurant', [isRentMode, selectedType]);
  const showRestaurantFurniture = useMemo(() => isRentMode && selectedType === 'restaurant', [isRentMode, selectedType]);
  const showGarageConstruction = useMemo(() => isRentMode && selectedType === 'garage', [isRentMode, selectedType]);
  
  // Reset selected type when status changes (sale/rent)
  // Skip reset in update mode when property is being loaded
  useEffect(() => {
    // Don't reset fields when loading property in update mode
    if (isUpdateMode && property) {
      return;
    }
    // Reset to first available property type when switching between sale/rent
    if (availablePropertyTypes.length > 0) {
      const currentTypeExists = availablePropertyTypes.some(type => type.id === selectedType);
      if (!currentTypeExists) {
        setSelectedType(availablePropertyTypes[0].id);
      }
    }
    // Reset rent-specific fields when switching between sale/rent
    setFurnishing('');
    setHouseTypes([]);
    setWorkingOptions([]);
    setWorks('');
    setLocationType('');
    setRestaurantFurniture('');
  }, [selectedStatus, availablePropertyTypes, selectedType, isUpdateMode, property]);

  // Reset type-specific fields when property type changes
  // Skip reset in update mode when property is being loaded
  useEffect(() => {
    // Don't reset fields when loading property in update mode
    if (isUpdateMode && property) {
      return;
    }
    // Clear subtype when switching types
    setSubtype('');
    // Clear type-specific fields
    if (selectedType !== 'house') {
      setYardArea('');
    }
    if (selectedType !== 'apartment' && selectedType !== 'office' && selectedType !== 'shop') {
      setFloor('');
    }
    // Reset features
    setSelectedFeatures([]);
    // Reset construction/completion if not in schema
    if (!showConstruction) {
      setSelectedConstruction('');
    }
    if (!showCompletion) {
      setSelectedCompletion('');
    }
    // Reset other dynamic fields
    setBuildingType('');
    setElectricity('');
    setWater('');
    setHotelCategory('');
    setAgriculturalCategory('');
    setBedBase('');
    // Reset rent-specific fields
    setFurnishing('');
    setHouseTypes([]);
    setWorkingOptions([]);
    setWorks('');
    setLocationType('');
    setRestaurantFurniture('');
  }, [selectedType, showConstruction, showCompletion, isUpdateMode, property]);

  const neighborhoodOptions = useMemo(() => getNeighborhoodsByCity(city), [city]);

  useEffect(() => {
    if (!neighborhoodOptions.length) {
      setNeighborhood('');
      return;
    }
    if (!neighborhoodOptions.includes(neighborhood)) {
      setNeighborhood(neighborhoodOptions[0]);
    }
  }, [neighborhoodOptions, neighborhood]);

  // Map property data to form state when property is loaded (update mode)
  // Phase 1: Set basic fields including type (but NOT subtype or features yet)
  useEffect(() => {
    if (!property || !isUpdateMode) {
      return;
    }

    // Map sale_or_rent to selectedStatus
    const saleOrRent = (property as any).sale_or_rent || (property.status === 'for-rent' ? 'rent' : 'sale');
    const status = saleOrRent === 'rent' ? 'for-rent' : 'for-sale';
    setSelectedStatus(status);

    // Map property type
    if (property.type) {
      const mappedType = property.type === 'villa' ? 'house' : property.type;
      setSelectedType(mappedType as PropertyType);
    }

    // Map city and neighborhood
    if (property.city) {
      setCity(property.city);
    }
    if (property.neighborhood) {
      setNeighborhood(property.neighborhood);
    }

    // Map basic fields
    if (property.title) {
      setTitle(property.title);
    }
    if (property.description) {
      // Handle description - it might be a string or Plate JSON value
      let descriptionText = property.description;
      if (typeof descriptionText === 'string') {
        try {
          const parsed = JSON.parse(descriptionText);
          if (Array.isArray(parsed)) {
            // It's Plate JSON, convert to plain text
            descriptionText = parsed.map((node: any) => {
              if (node.children) {
                return node.children.map((child: any) => child.text || '').join('');
              }
              return '';
            }).join('\n');
          }
        } catch {
          // Not JSON, use as is
        }
      }
      setDescription(descriptionText);
    }

    // Map price and area
    if (property.price !== undefined) {
      setPrice(property.price.toString());
    }
    if (property.area !== undefined) {
      setArea(property.area.toString());
    }

    // Map price_per_sqm - prefer database value, fallback to calculation
    if ((property as any).price_per_sqm !== undefined && (property as any).price_per_sqm !== null) {
      setPricePerSqm((property as any).price_per_sqm.toString());
    } else if (property.price && property.area) {
      const calculated = Math.round(property.price / property.area).toString();
      setPricePerSqm(calculated);
    }

    // Map floor
    if (property.floor) {
      setFloor(property.floor);
    }

    // Map yard area
    if ((property as any).yard_area_sqm !== undefined) {
      setYardArea((property as any).yard_area_sqm.toString());
    }

    // Map year built
    if (property.year_built) {
      setYearBuilt(property.year_built.toString());
    }

    // Map construction type
    // For garages in rent mode, construction_type maps to buildingType
    // For other cases, it maps to selectedConstruction
    if ((property as any).construction_type) {
      const saleOrRent = (property as any).sale_or_rent || (property.status === 'for-rent' ? 'rent' : 'sale');
      const isRent = saleOrRent === 'rent';
      if (isRent && property.type === 'garage') {
        setBuildingType((property as any).construction_type);
      } else {
        setSelectedConstruction((property as any).construction_type);
      }
    }

    // Map completion status (completion_degree -> selectedCompletion)
    if ((property as any).completion_degree) {
      setSelectedCompletion((property as any).completion_degree);
    }

    // Map building type - for offices, shops, hotels, etc. (both sale and rent modes)
    // For restaurants in rent mode, building_type maps to locationType (handled in rent-specific section)
    const buildingTypeValue = (property as any).building_type;
    if (buildingTypeValue !== undefined && buildingTypeValue !== null && buildingTypeValue !== '') {
      // Only map to buildingType if it's not a restaurant in rent mode
      const saleOrRent = (property as any).sale_or_rent || (property.status === 'for-rent' ? 'rent' : 'sale');
      const isRent = saleOrRent === 'rent';
      if (!(isRent && property.type === 'restaurant')) {
        setBuildingType(buildingTypeValue);
      }
    }

    // Map electricity and water
    if ((property as any).electricity) {
      setElectricity((property as any).electricity);
    }
    if ((property as any).water) {
      setWater((property as any).water);
    }

    // Map hotel category - always map when it exists
    if (property.hotel_category !== undefined && property.hotel_category !== null && property.hotel_category !== '') {
      setHotelCategory(property.hotel_category);
    }

    // Map agricultural category - always map when it exists
    if ((property as any).agricultural_category !== undefined && (property as any).agricultural_category !== null && (property as any).agricultural_category !== '') {
      setAgriculturalCategory((property as any).agricultural_category);
    }

    // Map bed base - handle 0 and null values correctly
    if (property.bed_base !== undefined && property.bed_base !== null) {
      setBedBase(property.bed_base.toString());
    }

    // Map works (working mode) - for hotels and restaurants in both sale and rent modes
    if (property.works !== undefined && property.works !== null && property.works !== '') {
      setWorks(property.works);
    }

    // Map broker fields
    if (property.broker_name) {
      setBroker(prev => ({ ...prev, name: property.broker_name || '' }));
    }
    if (property.broker_position) {
      setBroker(prev => ({ ...prev, title: property.broker_position || '' }));
    }
    if (property.broker_phone) {
      setBroker(prev => ({ ...prev, phone: property.broker_phone || '' }));
    }
    if (property.broker_image) {
      setBrokerImagePreview(property.broker_image);
    }

    // Map images
    if (property.images && property.images.length > 0) {
      setImages(property.images.map(img => img.url));
    }

    // Map rent-specific fields
    if (status === 'for-rent') {
      // Map furniture - check property type to determine if it's for apartments/houses or restaurants
      const furnitureValue = (property as any).furniture;
      if (furnitureValue !== undefined && furnitureValue !== null && furnitureValue !== '') {
        // For restaurants, furniture maps to restaurantFurniture
        if (property.type === 'restaurant') {
          const restaurantFurnitureMap: Record<string, string> = {
            'full': 'with-furniture',
            'none': 'without-furniture',
          };
          const restaurantFurnitureValue = restaurantFurnitureMap[furnitureValue];
          if (restaurantFurnitureValue) {
            setRestaurantFurniture(restaurantFurnitureValue);
          }
        } else {
          // For apartments and houses, furniture maps to furnishing
          const furnitureMap: Record<string, string> = {
            'full': 'furnished',
            'partial': 'partially-furnished',
            'none': 'unfurnished',
          };
          const furnishingValue = furnitureMap[furnitureValue];
          if (furnishingValue) {
            setFurnishing(furnishingValue);
          }
        }
      }

      // Works is already mapped above for both sale and rent modes, so skip here

      // Map house types (if applicable)
      if ((property as any).house_types && Array.isArray((property as any).house_types)) {
        setHouseTypes((property as any).house_types);
      }

      // Map working options (if applicable)
      if ((property as any).working_options && Array.isArray((property as any).working_options)) {
        setWorkingOptions((property as any).working_options);
      }

      // Map location type (for restaurants) - stored in building_type for restaurants
      if (property.type === 'restaurant') {
        if ((property as any).building_type) {
          setLocationType((property as any).building_type);
        }
      }
    }
  }, [property, isUpdateMode]);

  // Phase 2: Set subtype and features AFTER selectedType has been set and reset useEffect has completed
  // This fixes the race condition where subtype and features get cleared when property type changes
  useEffect(() => {
    if (!property || !isUpdateMode || !selectedType) {
      return;
    }

    // Map subtype (normalize if needed) - now safe to set after type reset has happened
    if (property.subtype) {
      const normalizedSubtype = normalizeSubtypeToId(property.subtype) || property.subtype;
      setSubtype(normalizedSubtype);
    }

    // Map features - now safe to set after type reset has happened
    if (property.features && Array.isArray(property.features)) {
      setSelectedFeatures(property.features);
    }
  }, [property, isUpdateMode, selectedType]);

  const calculatedPricePerSqm = useMemo(() => {
    if (!price || !area) {
      return '';
    }
    const priceValue = parseFloat(price);
    const areaValue = parseFloat(area);
    if (!priceValue || !areaValue) {
      return '';
    }
    return Math.round(priceValue / areaValue).toString();
  }, [price, area]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((feature) => feature !== id) : [...prev, id],
    );
  };

  const addObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    createdObjectUrls.current.push(url);
    imageFilesRef.current.push(file);
    setImages((prev) => [...prev, url]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    Array.from(files).forEach((file) => addObjectUrl(file));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleBrokerImageFile = (file: File | null) => {
    if (!file) return;
    if (brokerImagePreview && brokerImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(brokerImagePreview);
    }
    const url = URL.createObjectURL(file);
    brokerImageFileRef.current = file;
    setBrokerImagePreview(url);
  };

  const handleBrokerImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleBrokerImageFile(file);
    }
  };

  const handleBrowseBrokerImage = () => {
    brokerImageInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedBrokerName = broker.name.trim();
    const trimmedBrokerPhone = broker.phone.trim();
    const numericArea = Number(area);
    const numericPrice = Number(price);

    if (!trimmedTitle) {
      setSubmitError(t('errors.titleRequired'));
      return;
    }

    if (!trimmedDescription) {
      setSubmitError(t('errors.descriptionRequired'));
      return;
    }

    // Area validation - skip for rent hotels
    if (!(isRentMode && selectedType === 'hotel')) {
      if (!Number.isFinite(numericArea) || numericArea <= 0) {
        setSubmitError(t('errors.areaMustBePositive'));
        return;
      }
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setSubmitError(t('errors.priceMustBePositive'));
      return;
    }

    if (!neighborhood) {
      setSubmitError(t('errors.neighborhoodRequired'));
      return;
    }

    if (subtypeOptions.length > 0 && !subtype) {
      setSubmitError(t('errors.subtypeRequired') || 'Подтипът е задължителен');
      return;
    }

    if (!broker.title.trim()) {
      setSubmitError(t('errors.brokerPositionRequired') || 'Длъжността е задължителна');
      return;
    }

    // Validate broker image - required for add mode, but in update mode existing image is OK
    const hasBrokerImage = brokerImageFileRef.current || (brokerImagePreview && !brokerImagePreview.startsWith('blob:'));
    if (!hasBrokerImage) {
      setSubmitError(t('errors.brokerImageRequired') || 'Снимката на брокера е задължителна');
      return;
    }

    if (images.length === 0) {
      setSubmitError(t('errors.addAtLeastOneImage'));
      return;
    }

    if (!trimmedBrokerName || !trimmedBrokerPhone) {
      setSubmitError(t('errors.brokerNameAndPhoneRequired'));
      return;
    }

    // Validate floor (required for apartments, offices, shops)
    if (showFloor && !floor) {
      setSubmitError(t('errors.floorRequired'));
      return;
    }

    // Validate year built (required, but not for rent mode)
    if (!isRentMode && (!yearBuilt || !yearBuilt.trim())) {
      setSubmitError(t('errors.yearBuiltRequired'));
      return;
    }

    // Validate construction type (required when shown, but not for rent mode)
    if (showConstruction && !isRentMode && (!selectedConstruction || selectedConstruction.trim() === '')) {
      setSubmitError(t('errors.constructionRequired'));
      return;
    }

    // Validate completion status (required when shown, but not for rent mode)
    if (showCompletion && !isRentMode && (!selectedCompletion || selectedCompletion.trim() === '')) {
      setSubmitError(t('errors.completionStatusRequired'));
      return;
    }

    // Validate features (at least one required)
    if (selectedFeatures.length === 0) {
      setSubmitError(t('errors.atLeastOneFeatureRequired'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload images directly to Cloudinary first (bypasses 4.5MB API limit)
      const uploadedImages: Array<{ url: string; public_id: string }> = [];
      let brokerImageUrl: string | null = null;
      let brokerImagePublicId: string | null = null;

      // Upload broker image if provided (or skip if in update mode without new file)
      if (brokerImageFileRef.current) {
        try {
          // Validate file before upload
          if (!brokerImageFileRef.current.type.startsWith('image/')) {
            throw new Error('Broker image must be an image file');
          }
          
          const brokerUpload = await uploadToCloudinary(brokerImageFileRef.current, 'brokers');
          brokerImageUrl = brokerUpload.url;
          brokerImagePublicId = brokerUpload.public_id;
        } catch (error) {
          console.error('Error uploading broker image:', error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to upload broker image to Cloudinary';
          throw new Error(t('errors.brokerImageUploadFailed') || errorMessage);
        }
      } else if (!isUpdateMode && !brokerImagePreview) {
        // In add mode, broker image should be required
        throw new Error(t('errors.brokerImageRequired') || 'Broker image is required');
      } else if (isUpdateMode && brokerImagePreview && !brokerImagePreview.startsWith('blob:')) {
        // In update mode, if we have existing broker image, use it
        brokerImageUrl = brokerImagePreview;
      }

      // Upload property images to Cloudinary
      if (imageFilesRef.current.length > 0) {
        try {
          const uploadPromises = imageFilesRef.current.map((file) =>
            uploadToCloudinary(file, 'properties')
          );
          const results = await Promise.all(uploadPromises);
          uploadedImages.push(...results.map(r => ({ url: r.url, public_id: r.public_id })));
        } catch (error) {
          console.error('Error uploading property images:', error);
          throw new Error(t('errors.imageUploadFailed') || 'Failed to upload images');
        }
      }

      // In update mode, preserve existing images that weren't replaced
      if (isUpdateMode) {
        images.forEach((url) => {
          if (url && !url.startsWith('blob:')) {
            // Extract public_id from existing URL if possible
            const publicIdMatch = url.match(/\/upload\/.*\/([^/]+)\./);
            uploadedImages.push({
              url,
              public_id: publicIdMatch ? publicIdMatch[1] : url,
            });
          }
        });
      }

      // Validate that we have at least one image
      if (uploadedImages.length === 0) {
        throw new Error(t('errors.addAtLeastOneImage'));
      }

      const saleOrRentValue = selectedStatus === 'for-rent' ? 'rent' : 'sale';
      
      // Prepare JSON payload instead of FormData (images already uploaded)
      const payload: Record<string, any> = {
        sale_or_rent: saleOrRentValue,
        type: selectedType,
        price: numericPrice,
      };

      if (subtypeOptions.length > 0 && subtype) {
        payload.subtype = subtype;
      }

      // Area - skip for rent hotels (don't send area_sqm at all)
      if (!(isRentMode && selectedType === 'hotel')) {
        payload.area_sqm = numericArea;
      }

      const resolvedPricePerSqm = pricePerSqm || calculatedPricePerSqm;
      if (resolvedPricePerSqm) {
        payload.price_per_sqm = resolvedPricePerSqm;
      } else if (isRentMode && selectedType === 'hotel') {
        payload.price_per_sqm = 0;
      }

      if (showFloor) {
        payload.floor = floor;
      }

      payload.city = city;
      payload.neighborhood = neighborhood;
      payload.title = trimmedTitle;
      payload.description = trimmedDescription;

      if (!isRentMode) {
        payload.build_year = yearBuilt;
      }

      if (showConstruction && !isRentMode && selectedConstruction) {
        payload.construction_type = selectedConstruction;
      }

      if (showCompletion && !isRentMode && selectedCompletion) {
        payload.completion_degree = selectedCompletion;
      }

      if (showBuildingTypeForRent && buildingType) {
        payload.building_type = buildingType;
      }

      if (selectedType === 'hotel') {
        payload.hotel_category = hotelCategory || '';
      } else if (hotelCategory) {
        payload.hotel_category = hotelCategory;
      }

      if (agriculturalCategory) {
        payload.agricultural_category = agriculturalCategory;
      }

      if (bedBase && bedBase.trim() !== '') {
        payload.bed_base = bedBase;
      }

      const hasElectricityField = typeSchema.fields.find(f => f.key === 'electricity');
      if (hasElectricityField && !isRentMode && electricity) {
        payload.electricity = electricity;
      }

      const hasWaterField = typeSchema.fields.find(f => f.key === 'water');
      if (hasWaterField && !isRentMode && water) {
        payload.water = water;
      }

      if (yardArea) {
        payload.yard_area = yardArea;
      }

      payload.features = selectedFeatures;

      if (isRentMode) {
        if (showFurnishing && furnishing && selectedType === 'apartment') {
          const furnitureMap: Record<string, string> = {
            'furnished': 'full',
            'partially-furnished': 'partial',
            'unfurnished': 'none',
          };
          const furnitureValue = furnitureMap[furnishing];
          if (furnitureValue) {
            payload.furniture = furnitureValue;
          }
        }
        
        if (showWorkingOptions) {
          payload.works = works || '';
        }
        
        if (showLocationType && locationType) {
          payload.building_type = locationType;
        }
        
        if (showRestaurantFurniture && restaurantFurniture && selectedType === 'restaurant') {
          const furnitureMap: Record<string, string> = {
            'with-furniture': 'full',
            'without-furniture': 'none',
          };
          const furnitureValue = furnitureMap[restaurantFurniture];
          if (furnitureValue) {
            payload.furniture = furnitureValue;
          }
        }
        
        if (showGarageConstruction && buildingType) {
          payload.construction_type = buildingType;
        }
        
        if (isRentMode && selectedType === 'hotel' && selectedConstruction) {
          payload.construction_type = selectedConstruction;
        }
      }

      payload.broker_name = trimmedBrokerName;
      payload.broker_position = broker.title.trim();
      payload.broker_phone = trimmedBrokerPhone;

      // Add uploaded image URLs and public_ids
      payload.image_urls = uploadedImages.map(img => img.url);
      payload.image_public_ids = uploadedImages.map(img => img.public_id);
      if (brokerImageUrl) {
        payload.broker_image = brokerImageUrl;
        payload.broker_image_public_id = brokerImagePublicId;
      }

      // Determine API endpoint and method
      const apiEndpoint = isUpdateMode 
        ? `/api/properties/${propertyId}`
        : (isPublicPage ? '/api/properties/pending' : '/api/properties');
      const method = isUpdateMode ? 'PUT' : 'POST';
      
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'flashMessages.propertyAddError';
        // Translate error message if it's a translation key
        const translatedError = errorMessage.startsWith('errors.') 
          ? t(errorMessage as any, { fileName: errorMessage.split(':')[1] || '' })
          : errorMessage.startsWith('flashMessages.')
          ? t(errorMessage as any)
          : errorMessage;
        throw new Error(translatedError);
      }

      const savedProperty = await response.json();
      
      if (isPublicPage) {
        // For public page, show success message and reset form
        setSubmitSuccess(true);
        setSubmitError(null);
        
        // Reset form fields
        setTitle('');
        setDescription('');
        setPrice('');
        setArea('');
        setPricePerSqm('');
        setImages([]);
        imageFilesRef.current = [];
        createdObjectUrls.current.forEach(url => URL.revokeObjectURL(url));
        createdObjectUrls.current = [];
        setBrokerImagePreview(null);
        brokerImageFileRef.current = null;
        setBroker({ name: '', title: '', phone: '' });
        setYearBuilt('');
        setSubtype('');
        setYardArea('');
        setFloor('');
        setBuildingType('');
        setElectricity('');
        setWater('');
        setHotelCategory('');
        setAgriculturalCategory('');
        setBedBase('');
        setSelectedFeatures([]);
        setFurnishing('');
        setHouseTypes([]);
        setWorkingOptions([]);
        setWorks('');
        setLocationType('');
        setRestaurantFurniture('');
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // For admin page, store optimistic property and redirect
        if (savedProperty) {
          sessionStorage.setItem('optimistic-property', JSON.stringify(savedProperty));
          sessionStorage.setItem('optimistic-action', isUpdateMode ? 'update' : 'add');
        }
        const redirectStatus = isUpdateMode ? 'property-updated' : 'property-added';
        router.push(`/admin/properties/quick-view?status=${redirectStatus}`);
      }
    } catch (error) {
      console.error('Failed to create property via configurator:', error);
      setSubmitError(
        error instanceof Error ? error.message : t('flashMessages.propertyAddError'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  const removeImageField = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target && target.startsWith('blob:')) {
        URL.revokeObjectURL(target);
        createdObjectUrls.current = createdObjectUrls.current.filter((url) => url !== target);
      }
      imageFilesRef.current = imageFilesRef.current.filter((_, i) => i !== index);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    return () => {
      createdObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrls.current = [];
      imageFilesRef.current = [];
      if (brokerImagePreview && brokerImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(brokerImagePreview);
      }
    };
  }, []);

  // Show loading state while fetching property
  if (isLoadingProperty) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/properties/quick-view">Имоти</Link>
              <span>/</span>
              <span>Редактиране</span>
            </div>
            <div className={styles.panel}>
              <p>Зареждане на имот...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state if property failed to load
  if (isUpdateMode && propertyLoadError) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/properties/quick-view">Имоти</Link>
              <span>/</span>
              <span>Редактиране</span>
            </div>
            <div className={styles.panel}>
              <div className={styles.errorBanner} role="alert">
                {propertyLoadError}
              </div>
              <Link href="/admin/properties/quick-view" className={styles.linkButton}>
                Назад към списъка
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/admin/properties/quick-view">Имоти</Link>
          <span>/</span>
          <span>{isUpdateMode ? 'Редактиране' : 'Конфигуратор'}</span>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h1 className={styles.title}>{isUpdateMode ? 'Редактирай имот' : 'Добави имот'}</h1>
              <p className={styles.subtitle}>
                {isUpdateMode 
                  ? 'Използвайте опциите по-долу за да редактирате имота.' 
                  : 'Използвайте опциите по-долу за да подготвите нов имот.'}
              </p>
            </div>
            <Link href="/admin/properties/quick-view" className={styles.linkButton}>
              Назад към списъка
            </Link>
          </div>

          <section className={styles.section}>
            <h2>Основна информация</h2>
            <div className={styles.optionGrid}>
              <div className={styles.control}>
                <label>Статус *</label>
                <div className={styles.radioGroup}>
                  {PROPERTY_STATUSES.map((status) => (
                    <label key={status.id} className={styles.radio}>
                      <input
                        type="radio"
                        name="status"
                        value={status.id}
                        checked={selectedStatus === status.id}
                        onChange={() => setSelectedStatus(status.id)}
                        required
                      />
                      <span>{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.inputsRow}>
                <div className={styles.control}>
                  <label>Град *</label>
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className={styles.select}
                    required
                  >
                    {CITY_OPTIONS.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.control}>
                  <NeighborhoodSelect
                    city={city}
                    value={neighborhood}
                    onChange={(val) => setNeighborhood(Array.isArray(val) ? val[0] ?? '' : val)}
                    disabled={!city}
                    label="Квартал"
                    required
                  />
                </div>
              </div>
              <div className={styles.inputsRow}>
                <Input
                  label="Заглавие *"
                  placeholder="Луксозен апартамент в центъра"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className={styles.inputsRow}>
                <div className={styles.selectWrapper}>
                  <label className={styles.label}>Тип имот *</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={styles.select}
                    required
                  >
                    {availablePropertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Subtype field - shown based on property type */}
                {subtypeOptions.length > 0 && (
                  <div className={styles.selectWrapper}>
                    <label className={styles.label}>
                      Подтип *
                    </label>
                    <select
                      value={subtype}
                      onChange={(e) => setSubtype(e.target.value)}
                      className={styles.select}
                      required
                    >
                      <option value="">Изберете</option>
                      {subtypeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Основни стойности</h2>
            <div className={styles.inputsRow}>
              {/* Area input - hidden for rent hotels */}
              {!(isRentMode && selectedType === 'hotel') && (
                <Input
                  label={`${selectedType === 'hotel' ? 'РЗП (м²)' : 'Площ (м²)'} *`}
                  placeholder="120"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  required
                />
              )}
              <Input
                label={isRentMode ? "Месечен наем (евро) *" : "Цена *"}
                placeholder={isRentMode ? "5000" : "250 000"}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
              {/* Price per sqm - hidden for rent hotels */}
              {!(isRentMode && selectedType === 'hotel') && (
                <Input
                  label={isRentMode ? "Наем на м² (евро)" : "Цена на м²"}
                  placeholder="изчислява се"
                  value={pricePerSqm || calculatedPricePerSqm}
                  onChange={(event) => setPricePerSqm(event.target.value)}
                />
              )}
              {/* Yard area - only for houses and villas */}
              {showYardArea && (
                <Input
                  label="Площ на двора (м²)"
                  placeholder="200"
                  value={yardArea}
                  onChange={(event) => setYardArea(event.target.value)}
                />
              )}
              {/* Floor Options - only for apartments, offices, shops */}
              {showFloor && (
                <div className={styles.selectWrapper}>
                  <label className={styles.label}>Етаж *</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">Изберете етаж</option>
                    {(isRentMode && (selectedType === 'office' || selectedType === 'shop'))
                      ? RENT_COMMERCIAL_FLOOR_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))
                      : FLOOR_SPECIAL_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))
                    }
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>
              Изображения <span className={styles.requiredMarker}>*</span>
            </h2>
            <div className={styles.imagesList}>
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div key={`image-${index}`} className={styles.imageRow}>
                    <div className={styles.imagePreview}>
                      {image ? (
                        <img src={image} alt={`Изображение ${index + 1}`} />
                      ) : (
                        <div className={styles.imagePlaceholder}>Няма визуализация</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() => removeImageField(index)}
                    >
                      Премахни
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noImages}>
                  Все още няма добавени изображения. Плъзнете файлове или използвайте бутона по-долу.
                </p>
              )}
              <p className={styles.imageNote}>{t('errors.firstImagePreviewNote')}</p>
              <div
                className={styles.dropzone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <p>Пуснете изображения тук или</p>
                <button type="button" onClick={handleBrowseFiles}>
                  качи от компютър
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.fileInput}
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    if (event.target.value) {
                      event.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Описание</h2>
            <label htmlFor={descriptionFieldId} className={styles.textareaLabel}>
              Описание *
            </label>
            <textarea
              id={descriptionFieldId}
              className={styles.textarea}
              placeholder="Добавете описание на имота..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              required
            />
          </section>

          {/* Параметри section - hidden for all rent types */}
          {!isRentMode && (
          <section className={styles.section}>
            <h2>Параметри</h2>
            <div className={styles.filtersRow}>
              {/* Year built - shown for all property types */}
              <div className={styles.control}>
                <label>Година на строеж *</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={yearBuilt}
                  onChange={(event) => setYearBuilt(event.target.value)}
                  required
                />
              </div>
              {/* Construction Type - only if in schema */}
              {showConstruction && (
                <div className={styles.control}>
                  <label>Конструкция *</label>
                  <select
                    value={selectedConstruction}
                    onChange={(e) => setSelectedConstruction(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const constructionField = typeSchema.fields.find(f => f.key === 'construction_type');
                      return constructionField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
                  </select>
                </div>
              )}
              {/* Completion Status - only if in schema */}
              {showCompletion && (
                <div className={styles.control}>
                  <label>Степен на завършеност *</label>
                  <select
                    value={selectedCompletion}
                    onChange={(e) => setSelectedCompletion(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">Изберете</option>
                    {COMPLETION_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Building Type - for offices/shops (rent mode) */}
              {showBuildingTypeForRent && (
                <div className={styles.control}>
                  <label>Вид сграда</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {BUILDING_TYPES.filter(type => type.id !== 'all').map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Building Type - for offices/shops (sale mode) */}
              {!isRentMode && typeSchema.fields.find(f => f.key === 'building_type') && (
                <div className={styles.control}>
                  <label>Вид сграда</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const buildingTypeField = typeSchema.fields.find(f => f.key === 'building_type');
                      return buildingTypeField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
                  </select>
                </div>
              )}
              {/* Garage Construction Type - for garages (rent mode) */}
              {showGarageConstruction && (
                <div className={styles.control}>
                  <label>Вид конструкция</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {GARAGE_CONSTRUCTION_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Hotel Construction Type - for hotels (rent mode) */}
              {isRentMode && selectedType === 'hotel' && (
                <div className={styles.control}>
                  <label>Тип строителство</label>
                  <select
                    value={selectedConstruction}
                    onChange={(e) => setSelectedConstruction(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {HOTEL_CONSTRUCTION_TYPES.filter(type => type.id !== 'all').map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Works - for hotels (sale mode only, rent hotels handled in rent section) */}
              {!isRentMode && showWorkingOptions && (
                <div className={styles.control}>
                  <label>Работен режим</label>
                  <select
                    value={works}
                    onChange={(e) => setWorks(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {WORKING_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Hotel Category - for hotels (sale mode only, rent hotels handled in rent section) */}
              {!isRentMode && (typeSchema.fields.find(f => f.key === 'hotel_category') || selectedType === 'hotel') && (
                <div className={styles.control}>
                  <label>Категория</label>
                  <select
                    value={hotelCategory}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {HOTEL_CATEGORIES.filter(c => c.id !== 'all').map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Agricultural Category - for agricultural land */}
              {typeSchema.fields.find(f => f.key === 'agricultural_category') && (
                <div className={styles.control}>
                  <label>Категория</label>
                  <select
                    value={agriculturalCategory}
                    onChange={(e) => setAgriculturalCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const agriculturalCategoryField = typeSchema.fields.find(f => f.key === 'agricultural_category');
                      return agriculturalCategoryField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
                  </select>
                </div>
              )}
              {/* Bed Base - for hotels (sale mode only, rent hotels handled in rent section) */}
              {!isRentMode && (typeSchema.fields.find(f => f.key === 'bed_base') || selectedType === 'hotel') && (
                <div className={styles.control}>
                  <label>Леглова база</label>
                  <Input
                    type="number"
                    placeholder="Брой легла"
                    value={bedBase}
                    onChange={(e) => setBedBase(e.target.value)}
                  />
                </div>
              )}
              {/* Electricity - for land */}
              {typeSchema.fields.find(f => f.key === 'electricity') && (
                <div className={styles.control}>
                  <label>Ток</label>
                  <select
                    value={electricity}
                    onChange={(e) => setElectricity(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const electricityField = typeSchema.fields.find(f => f.key === 'electricity');
                      return electricityField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
                  </select>
                </div>
              )}
              {/* Water - for land */}
              {typeSchema.fields.find(f => f.key === 'water') && (
                <div className={styles.control}>
                  <label>Вода</label>
                  <select
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const waterField = typeSchema.fields.find(f => f.key === 'water');
                      return waterField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
                  </select>
                </div>
              )}
            </div>
          </section>
          )}

          {/* Features section - dynamically rendered based on property type */}
          {featuresList.length > 0 && (
            <section className={styles.section}>
              <h2>Особености <span className={styles.requiredMarker}>*</span></h2>
              <div className={styles.featuresGrid}>
                {featuresList.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    className={`${styles.featureCard} ${
                      selectedFeatures.includes(feature.id) ? styles.active : ''
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <span>{feature.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Rent-specific filters */}
          {isRentMode && (
            <section className={styles.section}>
              {/* Hide title for hotel rent properties */}
              {selectedType !== 'hotel' && (
                <h2>Допълнителни параметри за наем</h2>
              )}
              <div className={styles.filtersRow}>
                {/* Bed Base - for hotels in rent mode */}
                {selectedType === 'hotel' && (
                  <div className={styles.control}>
                    <label>Леглова база</label>
                    <Input
                      type="number"
                      placeholder="Брой легла"
                      value={bedBase}
                      onChange={(e) => setBedBase(e.target.value)}
                    />
                  </div>
                )}
                {/* Works - for hotels in rent mode */}
                {selectedType === 'hotel' && (
                  <div className={styles.control}>
                    <label>Работен режим</label>
                    <select
                      value={works}
                      onChange={(e) => setWorks(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Изберете</option>
                      {WORKING_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Hotel Category - for hotels in rent mode */}
                {selectedType === 'hotel' && (
                  <div className={styles.control}>
                    <label>Категория</label>
                    <select
                      value={hotelCategory}
                      onChange={(e) => setHotelCategory(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Изберете</option>
                      {HOTEL_CATEGORIES.filter(c => c.id !== 'all').map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Furnishing - for apartments and houses */}
                {showFurnishing && (
                  <div className={styles.control}>
                    <label>Обзавеждане</label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Изберете</option>
                      {FURNISHING_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Furniture - for restaurants (rent mode) */}
                {showRestaurantFurniture && (
                  <div className={styles.control}>
                    <label>Оборудване</label>
                    <select
                      value={restaurantFurniture}
                      onChange={(e) => setRestaurantFurniture(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Изберете</option>
                      <option value="with-furniture">С оборудване</option>
                      <option value="without-furniture">Без оборудване</option>
                    </select>
                  </div>
                )}
                {/* Works - for restaurants (rent mode) */}
                {showWorkingOptions && selectedType === 'restaurant' && (
                  <div className={styles.control}>
                    <label>Работен режим</label>
                    <select
                      value={works}
                      onChange={(e) => setWorks(e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Изберете</option>
                      {WORKING_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2>Брокер</h2>
            <div className={styles.brokerGrid}>
              <Input
                label="Име *"
                placeholder="Иван Петров"
                value={broker.name}
                onChange={(event) => setBroker((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <Input
                label="Длъжност *"
                placeholder="Старши брокер"
                value={broker.title}
                onChange={(event) => setBroker((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
              <Input
                label="Телефон *"
                placeholder="+359 888 123 456"
                value={broker.phone}
                onChange={(event) => setBroker((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
            <div className={styles.imagesList}>
              <h3 className={styles.brokerImageSectionTitle}>Снимка на брокера *</h3>
              {brokerImagePreview && (
                <div className={`${styles.imageRow} ${styles.brokerImageRow}`}>
                  <div className={styles.imagePreview}>
                    <img src={brokerImagePreview} alt="Снимка на брокера" />
                  </div>
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={() => {
                      if (brokerImagePreview && brokerImagePreview.startsWith('blob:')) {
                        URL.revokeObjectURL(brokerImagePreview);
                      }
                      brokerImageFileRef.current = null;
                      setBrokerImagePreview(null);
                    }}
                  >
                    Премахни
                  </button>
                </div>
              )}
              <div
                className={styles.dropzone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleBrokerImageDrop}
              >
                <p>Пуснете снимка на брокера тук или</p>
                <button type="button" onClick={handleBrowseBrokerImage}>
                  качи от компютър
                </button>
                <input
                  ref={brokerImageInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    handleBrokerImageFile(file);
                    if (event.target.value) {
                      event.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </section>


          {submitError && (
            <div className={styles.errorBanner} role="alert">
              {submitError}
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="primary" size={isMobile ? 'sm' : 'md'} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting 
                ? (isUpdateMode ? 'Запазване...' : t('admin.addPropertySubmitting'))
                : (isUpdateMode ? 'Запази промените' : t('admin.addPropertyButton'))}
            </Button>
            <Link href="/admin/properties/quick-view" className={styles.linkButton}>
              Отказ
            </Link>
          </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Toast for property submission success (public page only) */}
      {isPublicPage && (
        <Toast
          message={t('flashMessages.propertySentForApproval')}
          isVisible={submitSuccess}
          onClose={() => setSubmitSuccess(false)}
          duration={5000}
        />
      )}
    </div>
  );
}

