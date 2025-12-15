'use client';

import { useState, useEffect, useMemo, useRef, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlateEditor, Value } from '@/lib/plate-editor';
import { translateProperty } from '@/lib/translator';
import { CITY_OPTIONS, getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import type { Property, PropertyType } from '@/types';
import { FloppyDisk, X, Globe, SpinnerGap } from '@phosphor-icons/react';
import {
  generatePropertySchema,
  getPropertyTypeSchema,
  getFieldsForPropertyType,
} from '@/lib/property-schemas';
import { DynamicPropertyField } from '@/components/forms/DynamicPropertyField';
import { plateValueToPlainText } from '@/lib/plate-utils';
import { normalizeSubtypeToId } from '@/lib/subtype-mapper';
import { FLOOR_SPECIAL_OPTIONS } from '@/features/map-filters/filters/constants';
import styles from './PropertyFormPage.module.scss';

type PropertyFormData = z.infer<ReturnType<typeof generatePropertySchema>>;

interface PropertyFormPageProps {
  propertyId?: string;
}

const initialEditorValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function PropertyFormPage({ propertyId }: PropertyFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [isLoadingProperty, setIsLoadingProperty] = useState<boolean>(!!propertyId);
  const [propertyLoadError, setPropertyLoadError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editorValue, setEditorValue] = useState<Value>(initialEditorValue);
  const [translations, setTranslations] = useState<{
    en?: { title: string; description: string };
    ru?: { title: string; description: string };
    de?: { title: string; description: string };
  }>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createdObjectUrlsRef = useRef<string[]>([]);
  const imageFilesRef = useRef<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const brokerImageInputRef = useRef<HTMLInputElement | null>(null);
  const brokerImageFileRef = useRef<File | null>(null);
  const brokerImageObjectUrlRef = useRef<string | null>(null);
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!propertyId) {
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
  }, [propertyId]);

  const cityOptions = useMemo(() => {
    if (property?.city && !CITY_OPTIONS.includes(property.city)) {
      return [property.city, ...CITY_OPTIONS];
    }
    return CITY_OPTIONS;
  }, [property?.city]);

  const addObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
    imageFilesRef.current.push(file);
    setImageUrls((prev) => [...prev, url]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
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
    // Revoke previous object URL if any
    if (brokerImageObjectUrlRef.current) {
      URL.revokeObjectURL(brokerImageObjectUrlRef.current);
      brokerImageObjectUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    brokerImageObjectUrlRef.current = url;
    brokerImageFileRef.current = file;
    setBrokerImageUrl(url);
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

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((item) => item !== featureId) : [...prev, featureId],
    );
  };

  const removeImageAtIndex = (index: number) => {
    setImageUrls((prev) => {
      const target = prev[index];
      if (target && target.startsWith('blob:')) {
        URL.revokeObjectURL(target);
        createdObjectUrlsRef.current = createdObjectUrlsRef.current.filter((url) => url !== target);
        // Remove corresponding file from ref
        imageFilesRef.current = imageFilesRef.current.filter((_, i) => i !== index);
      } else {
        // For non-blob URLs (existing images), just remove from array
        imageFilesRef.current = imageFilesRef.current.filter((_, i) => i !== index);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrlsRef.current = [];
      if (brokerImageObjectUrlRef.current) {
        URL.revokeObjectURL(brokerImageObjectUrlRef.current);
        brokerImageObjectUrlRef.current = null;
      }
    };
  }, []);


  // Initialize property type from existing property or default to apartment
  const [propertyType, setPropertyType] = useState<PropertyType>(() => {
    if (property?.type && ['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel', 'agricultural', 'garage', 'restaurant', 'replace-real-estates', 'buy-real-estates', 'other-real-estates'].includes(property.type)) {
      // Map villa to house since they're combined
      return property.type === 'villa' ? 'house' : (property.type as PropertyType);
    }
    return 'apartment';
  });
  
  // Update property type when property changes (for edit mode)
  useEffect(() => {
    if (property?.type && property.type !== propertyType) {
      const validTypes: PropertyType[] = ['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel', 'agricultural', 'garage', 'restaurant', 'replace-real-estates', 'buy-real-estates', 'other-real-estates'];
      if (validTypes.includes(property.type as PropertyType)) {
        // Map villa to house since they're combined
        const mappedType = property.type === 'villa' ? 'house' : property.type;
        setPropertyType(mappedType as PropertyType);
      }
    }
  }, [property?.type, propertyType]);

  // Generate schema dynamically based on property type
  const propertySchema = useMemo(() => generatePropertySchema(propertyType), [propertyType]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues,
    setValue,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    shouldFocusError: false, // Prevent automatic scroll to error
    defaultValues: {
      title: '',
      description: '',
      type: 'apartment',
      status: 'for-sale',
      location_type: 'urban',
      city: CITY_OPTIONS[0] ?? 'Бургас',
      neighborhood: '',
      price: 0,
      area: 0,
      price_per_sqm: undefined,
      floor: '',
      total_floors: undefined,
      construction_type: '',
      completion_status: '',
      subtype: '',
      yard_area: undefined,
      hotel_category: '',
      broker_name: '',
      broker_title: '',
      broker_phone: '',
    },
  });

  const cityValue = watch('city');
  const neighborhoodValue = watch('neighborhood');
  const watchedType = watch('type') as PropertyType;

  // Update property type when it changes and reset type-specific fields
  useEffect(() => {
    if (watchedType && watchedType !== propertyType) {
      const currentValues = watch();
      setPropertyType(watchedType);
      
      // Get the new schema
      const newSchema = getPropertyTypeSchema(watchedType);
      
      // Prepare values to keep (base fields that are common)
      const valuesToKeep: any = {
        title: currentValues.title || '',
        description: currentValues.description || '',
        type: watchedType,
        status: currentValues.status || 'for-sale',
        location_type: currentValues.location_type || 'urban',
        city: currentValues.city || CITY_OPTIONS[0] || 'Бургас',
        neighborhood: currentValues.neighborhood || '',
        price: currentValues.price || 0,
        area: currentValues.area || 0,
        price_per_sqm: currentValues.price_per_sqm,
        year_built: currentValues.year_built,
        broker_name: currentValues.broker_name || '',
        broker_title: currentValues.broker_title || '',
        broker_phone: currentValues.broker_phone || '',
        // Reset type-specific fields
        subtype: '',
        rooms: undefined,
        floor: undefined,
        total_floors: undefined,
        yard_area: undefined,
        construction_type: '',
        completion_status: '',
        hotel_category: '',
        agricultural_category: '',
        features: [],
      };
      
      // Reset features UI state
      setSelectedFeatures([]);
      
      // Update form with cleared values
      reset(valuesToKeep);
    }
  }, [watchedType, propertyType, setValue, reset, watch]);

  const neighborhoodOptions = useMemo(() => getNeighborhoodsByCity(cityValue), [cityValue]);
  
  // Get fields for current property type
  const typeSchema = useMemo(() => getPropertyTypeSchema(propertyType), [propertyType]);
  const typeFields = useMemo(() => getFieldsForPropertyType(propertyType), [propertyType]);
  
  // Get features list for current property type
  const featuresList = useMemo(() => {
    const featuresField = typeSchema.fields.find(f => f.key === 'features');
    return featuresField?.options || [];
  }, [typeSchema]);
  
  // Check which fields should be shown based on property type
  
  const showFloor = useMemo(() => {
    return propertyType === 'apartment' || propertyType === 'office' || propertyType === 'shop';
  }, [propertyType]);
  
  
  const showYardArea = useMemo(() => {
    return propertyType === 'house';
  }, [propertyType]);

  useEffect(() => {
    if (!neighborhoodOptions.length) {
      setValue('neighborhood', '');
      return;
    }
    if (!neighborhoodValue || !neighborhoodOptions.includes(neighborhoodValue)) {
      setValue('neighborhood', neighborhoodOptions[0]);
    }
  }, [neighborhoodOptions, neighborhoodValue, setValue]);

  useEffect(() => {
    if (!cityValue && cityOptions.length) {
      setValue('city', cityOptions[0]);
    }
  }, [cityValue, cityOptions, setValue]);

  useEffect(() => {
    if (!property) {
      return;
    }

    // Prefill form fields from loaded property
    // Handle description - it might be a string or Plate JSON value
    let descriptionText = property.description || '';
    if (descriptionText && typeof descriptionText === 'string') {
      try {
        // Try to parse as JSON (Plate value)
        const parsed = JSON.parse(descriptionText);
        if (Array.isArray(parsed)) {
          descriptionText = plateValueToPlainText(parsed);
        }
      } catch {
        // If parsing fails, it's already plain text, use as is
        descriptionText = descriptionText;
      }
    }
    
    const mappedDefaults: Partial<PropertyFormData> = {
      title: property.title,
      description: descriptionText,
      type: property.type as any,
      status:
        property.status === 'for-sale' || property.status === 'for-rent'
          ? (property.status as any)
          : 'for-sale',
      location_type: (property as any).location_type || 'urban',
      city: property.city || CITY_OPTIONS[0] || 'Бургас',
      neighborhood: property.neighborhood || '',
      price: property.price,
      area: property.area,
      floor: property.floor || '',
      total_floors: property.total_floors,
      price_per_sqm:
        property.area && property.price ? Math.round(property.price / property.area) : undefined,
      year_built: property.year_built,
      construction_type: (property as any).construction_type || '',
      completion_status: (property as any).completion_degree || '', // Redirect completion_degree to completion_status input
      // Normalize subtype to ID (in case database has Bulgarian label)
      subtype: normalizeSubtypeToId((property as any).subtype) || '',
      yard_area: (property as any).yard_area || undefined,
      hotel_category: (property as any).hotel_category || '',
      agricultural_category: (property as any).agricultural_category || '',
      bed_base: (property as any).bed_base || undefined,
      electricity: (property as any).electricity || '',
      water: (property as any).water || '',
      broker_name: (property as any)?.broker_name || '',
      broker_title: (property as any)?.broker_position || '', // Redirect broker_position to broker_title input
      broker_phone: (property as any)?.broker_phone || '',
    };

    reset(mappedDefaults);

    // Parse existing description for editor if it's JSON (from Plate)
    if (property.description) {
      try {
        const parsed = JSON.parse(property.description);
        setEditorValue(parsed);
      } catch {
        setEditorValue([
          {
            type: 'p',
            children: [{ text: property.description }],
          },
        ]);
      }
    }

    if (property.images?.length) {
      setImageUrls(property.images.map((img) => img.url));
    } else {
      setImageUrls([]);
    }

    if ((property as any)?.features) {
      setSelectedFeatures((property as any).features);
    } else {
      setSelectedFeatures([]);
    }

    if ((property as any)?.broker_image) {
      setBrokerImageUrl((property as any).broker_image || null);
    }
  }, [property, reset]);

  const handleAutoTranslate = async () => {
    const formData = watch();
    setIsTranslating(true);

    try {
      const [en, ru, de] = await Promise.all([
        translateProperty(
          { title: formData.title, description: formData.description },
          'en'
        ),
        translateProperty(
          { title: formData.title, description: formData.description },
          'ru'
        ),
        translateProperty(
          { title: formData.title, description: formData.description },
          'de'
        ),
      ]);

      setTranslations({ en, ru, de });
    } catch (error) {
      console.error('Translation error:', error);
      alert('Грешка при превеждането. Моля, опитайте отново.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Helper function to translate error messages from API and Zod
  const translateErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return errorMessage;
    
    // Check if it's a translation key (format: "errors.key:param")
    if (errorMessage.startsWith('errors.')) {
      const parts = errorMessage.split(':');
      const key = parts[0];
      const param = parts[1] || '';
      
      try {
        // Handle different error types with different params
        if (key === 'errors.fileSizeExceeded') {
          return t(key as any, { fileName: param });
        } else if (key === 'errors.fieldMustBePositive' || key === 'errors.fieldRequired') {
          return t(key as any, { fieldLabel: param });
        } else {
          return t(key as any);
        }
      } catch {
        return errorMessage;
      }
    }
    
    // Check if it's a flashMessages key
    if (errorMessage.startsWith('flashMessages.')) {
      try {
        return t(errorMessage as any);
      } catch {
        return errorMessage;
      }
    }
    
    return errorMessage;
  };

  // Helper to format city / neighborhood names: each word capitalized
  const formatLocationName = (value: string) => {
    if (!value) return value;
    return value
      .trim()
      .split(/\s+/)
      .map((word) =>
        word.length ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word,
      )
      .join(' ');
  };

  const onSubmit = async (data: PropertyFormData) => {
    console.log('onSubmit called with data:', data);
    setIsSubmittingForm(true);
    setSubmitError(null);

    try {
      const saleOrRent = data.status === 'for-rent' ? 'rent' : 'sale';
      // Get all new image files (exclude existing URLs that aren't blobs)
      const newImageFiles = imageFilesRef.current.filter((_, index) => {
        const url = imageUrls[index];
        return url && url.startsWith('blob:');
      });

      // Check if there are existing images (non-blob URLs) or new images to upload
      const existingImages = imageUrls.filter((url) => url && !url.startsWith('blob:'));
      const hasAnyImages = existingImages.length > 0 || newImageFiles.length > 0;

      if (!hasAnyImages) {
        setSubmitError(t('errors.atLeastOneImageRequired'));
        setIsSubmittingForm(false);
        // Scroll to error message
        setTimeout(() => {
          const errorElement = document.querySelector(`.${styles.errorMessage}`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }

      // Convert Plate editor JSON to plain text
      const descriptionText = plateValueToPlainText(editorValue);
      if (!descriptionText.trim()) {
        setSubmitError(t('errors.descriptionRequired'));
        setIsSubmittingForm(false);
        // Scroll to error message
        setTimeout(() => {
          const errorElement = document.querySelector(`.${styles.errorMessage}`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }

      // Validate broker image
      const hasBrokerImage = brokerImageFileRef.current || (brokerImageUrl && !brokerImageUrl.startsWith('blob:'));
      if (!hasBrokerImage) {
        setSubmitError(t('errors.brokerImageRequired') || 'Снимката на брокера е задължителна');
        setIsSubmittingForm(false);
        // Scroll to error message
        setTimeout(() => {
          const errorElement = document.querySelector(`.${styles.errorMessage}`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }

      // Validate floor (required for apartments, offices, shops)
      if (showFloor && (!data.floor || data.floor.trim() === '')) {
        setSubmitError(t('errors.floorRequired'));
        setIsSubmittingForm(false);
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="floor"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (errorElement as HTMLElement).focus();
          }
        }, 100);
        return;
      }

      // Validate year built (required)
      if (!data.year_built) {
        setSubmitError(t('errors.yearBuiltRequired'));
        setIsSubmittingForm(false);
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="year_built"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (errorElement as HTMLElement).focus();
          }
        }, 100);
        return;
      }

      // Validate construction type (required if field exists in typeFields)
      const hasConstructionField = typeFields.some(field => field.key === 'construction_type');
      if (hasConstructionField && (!data.construction_type || data.construction_type.trim() === '')) {
        setSubmitError(t('errors.constructionRequired'));
        setIsSubmittingForm(false);
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="construction_type"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (errorElement as HTMLElement).focus();
          }
        }, 100);
        return;
      }

      // Validate completion status (required if field exists in typeFields)
      const hasCompletionField = typeFields.some(field => field.key === 'completion_status');
      if (hasCompletionField && (!data.completion_status || data.completion_status.trim() === '')) {
        setSubmitError(t('errors.completionStatusRequired'));
        setIsSubmittingForm(false);
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="completion_status"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (errorElement as HTMLElement).focus();
          }
        }, 100);
        return;
      }

      // Validate features (at least one required)
      if (featuresList.length > 0 && selectedFeatures.length === 0) {
        setSubmitError(t('errors.atLeastOneFeatureRequired'));
        setIsSubmittingForm(false);
        setTimeout(() => {
          const errorElement = document.querySelector(`.${styles.sectionTitle}`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Map form fields to API fields
      // Note: status column removed from database, using sale_or_rent instead
      formData.append('sale_or_rent', saleOrRent);
      formData.append('type', data.type);
      if (data.subtype) {
        formData.append('subtype', data.subtype);
      }
      
      // Map area -> area_sqm
      formData.append('area_sqm', String(data.area));
      formData.append('price', String(data.price));
      if (data.price_per_sqm) {
        formData.append('price_per_sqm', String(data.price_per_sqm));
      }
      // Floor - send if it has a valid value, otherwise send empty string
      const floorValue = data.floor && data.floor !== '' && ['basement', 'ground', 'first-residential', 'not-last', 'last', 'attic'].includes(data.floor)
        ? String(data.floor)
        : '';
      formData.append('floor', floorValue);
      if (data.total_floors !== undefined && data.total_floors !== null) {
        formData.append('total_floors', String(data.total_floors));
      }
      
      // Location – format both city and neighborhood before sending
      const formattedCity = formatLocationName(data.city);
      const formattedNeighborhood = data.neighborhood
        ? formatLocationName(data.neighborhood)
        : data.neighborhood;

      formData.append('city', formattedCity);
      formData.append('neighborhood', formattedNeighborhood || '');
      // address field removed - not saving to database
      
      // Description
      formData.append('title', data.title);
      formData.append('description', descriptionText);
      
      // Map year_built -> build_year
      if (data.year_built) {
        formData.append('build_year', String(data.year_built));
      }
      if (data.construction_type) {
        formData.append('construction_type', data.construction_type);
      }
      // Map completion_status -> completion_degree (redirect from form input)
      if (data.completion_status) {
        formData.append('completion_degree', data.completion_status);
      }
      
      // Additional property-specific fields
      if (data.yard_area !== undefined) {
        formData.append('yard_area', String(data.yard_area));
      }
      if (data.hotel_category) {
        formData.append('hotel_category', data.hotel_category);
      }
      if (data.agricultural_category) {
        formData.append('agricultural_category', data.agricultural_category);
      }
      // building_type field removed - not saving to database
      if (data.electricity) {
        formData.append('electricity', data.electricity);
      }
      if (data.water) {
        formData.append('water', data.water);
      }
      if (data.bed_base !== undefined) {
        formData.append('bed_base', String(data.bed_base));
      }
      
      // Features
      selectedFeatures.forEach((feature) => {
        formData.append('features', feature);
      });
      
      // Broker
      formData.append('broker_name', data.broker_name);
      if (data.broker_title) {
        formData.append('broker_position', data.broker_title);
      }
      formData.append('broker_phone', data.broker_phone);
      // Broker image - append new file if provided, otherwise API will keep existing image
      // Validation already checked above that we have either a file or an existing image
      if (brokerImageFileRef.current) {
        formData.append('broker_image', brokerImageFileRef.current);
      }
      // If no new file, API will use existing broker_image from database
      
      // Images - append existing image URLs and new files
      // First, append existing images (non-blob URLs)
      imageUrls.forEach((url) => {
        if (url && !url.startsWith('blob:')) {
          formData.append('existing_images', url);
        }
      });
      
      // Then append new image files
      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Call the API - use PUT for updates, POST for new properties
      const apiUrl = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
      const method = propertyId ? 'PUT' : 'POST';
      
      console.log('Submitting property update:', { propertyId, method, apiUrl });
      console.log('Floor value:', data.floor);
      console.log('Total floors value:', data.total_floors);
      
      const response = await fetch(apiUrl, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.details || `HTTP error! status: ${response.status}`;
        console.error('Update error details:', errorData);
        throw new Error(errorMessage);
      }

      const updatedProperty = await response.json();
      console.log('Property saved successfully:', updatedProperty);

      // Store optimistic property in sessionStorage for immediate UI update
      if (updatedProperty) {
        sessionStorage.setItem('optimistic-property', JSON.stringify(updatedProperty));
        sessionStorage.setItem('optimistic-action', propertyId ? 'update' : 'add');
      }

      // Redirect to quick view with status for flash message
      // Use replace to avoid adding to history and prevent back button issues
      router.replace('/admin/properties/quick-view?status=property-updated', { scroll: false });
    } catch (error) {
      console.error('Error saving property:', error);
      const errorMessage = error instanceof Error ? error.message : 'flashMessages.propertySaveError';
      setSubmitError(translateErrorMessage(errorMessage));
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className={styles.propertyFormPage}>
      <main className={styles.main}>
        <div className={styles.container}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(
                (data) => {
                  onSubmit(data);
                },
                (errors) => {
              // Handle validation errors - scroll to first error
                  console.error('Validation failed with errors:', errors);
                  
                  // If errors object is empty but validation failed, it might be a schema issue
                  // Try to submit anyway with current form values
                  if (Object.keys(errors).length === 0) {
                    console.warn('Empty errors object detected - attempting to submit with current values');
                    const formValues = getValues();
                    // Manually validate required fields before submitting
                    if (!formValues.title || !formValues.description || !formValues.city) {
                      setSubmitError('Моля, попълнете всички задължителни полета');
                      return;
                    }
                    // Submit with current form values
                    onSubmit(formValues as PropertyFormData);
                    return;
                  }
                  
              const firstErrorField = Object.keys(errors)[0];
              if (firstErrorField) {
                    const fieldError = errors[firstErrorField as keyof typeof errors];
                    const errorMessage = fieldError?.message || 'Грешка при валидация';
                    setSubmitError(`Грешка в полето "${firstErrorField}": ${errorMessage}`);
                    
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement) {
                  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  (errorElement as HTMLElement).focus();
                }
              }
                }
              )(e);
            }} 
            className={styles.form}
          >
            <div className={styles.formGrid}>
              <div className={styles.formMain}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Основни данни</h2>
                  <Input
                    label="Заглавие *"
                    {...register('title')}
                    error={errors.title?.message ? translateErrorMessage(String(errors.title.message)) : undefined}
                  />
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Детайли</h2>
                  <div className={styles.formRow}>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Статус *</label>
                      <select
                        {...register('status')}
                        className={styles.select}
                      >
                        <option value="for-sale">За продажба</option>
                        <option value="for-rent">Под наем</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Тип имот *</label>
                      <select
                        {...register('type')}
                        className={styles.select}
                        onChange={(e) => {
                          setValue('type', e.target.value);
                          setPropertyType(e.target.value as PropertyType);
                        }}
                      >
                        <option value="apartment">Апартамент</option>
                        <option value="house">Къща/Вила</option>
                        <option value="office">Офис</option>
                        <option value="shop">Магазин</option>
                        <option value="warehouse">Склад</option>
                        <option value="land">Земя</option>
                        <option value="hotel">Хотел</option>
                        <option value="agricultural">Земеделска земя</option>
                        <option value="garage">Гараж/Паркоместа</option>
                        <option value="restaurant">Ресторант</option>
                        <option value="replace-real-estates">Замяна на недвижими имоти</option>
                        <option value="buy-real-estates">Купуване на недвижими имоти</option>
                        <option value="other-real-estates">Други недвижими имоти</option>
                      </select>
                    </div>
                    {/* Subtype field - shown based on property type */}
                    {typeSchema.subtypeOptions.length > 0 && (
                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>
                          Подтип *
                        </label>
                        <select
                          {...register('subtype', { required: 'Подтипът е задължителен' })}
                          className={styles.select}
                          value={watch('subtype') || ''}
                          onChange={(e) => setValue('subtype', e.target.value)}
                          required
                        >
                          <option value="">Изберете</option>
                          {typeSchema.subtypeOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.subtype?.message && (
                          <p className={styles.errorMessage}>
                            {translateErrorMessage(String(errors.subtype.message))}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={styles.formRow}>
                    <Input
                      label={propertyType === 'hotel' ? "РЗП (м²) *" : "Площ (м²) *"}
                      type="number"
                      {...register('area', { valueAsNumber: true })}
                      error={errors.area?.message ? translateErrorMessage(String(errors.area.message)) : undefined}
                    />
                    <Input
                      label="Цена *"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message ? translateErrorMessage(String(errors.price.message)) : undefined}
                    />
                    <Input
                      label="Цена на м²"
                      type="number"
                      {...register('price_per_sqm', { valueAsNumber: true })}
                      error={errors.price_per_sqm?.message ? translateErrorMessage(String(errors.price_per_sqm.message)) : undefined}
                    />
                  </div>
                  {/* Dynamic fields based on property type - conditionally shown */}
                  <div className={styles.formRow}>
                    {/* Floor Options - only for apartments, offices, shops */}
                    {showFloor && (
                      <div className={styles.selectWrapper}>
                        <label className={styles.label}>Етаж *</label>
                        <select
                          {...register('floor')}
                          className={styles.select}
                          required
                        >
                          <option value="">Изберете етаж</option>
                          {FLOOR_SPECIAL_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Yard area - only for houses */}
                    {showYardArea && (
                      <Input
                        label="Площ на двора (м²)"
                        type="number"
                        {...register('yard_area' as any, { valueAsNumber: true })}
                        error={errors.yard_area?.message ? translateErrorMessage(String(errors.yard_area.message)) : undefined}
                        placeholder="Площ на двора"
                      />
                    )}
                  </div>
                </div>

                {/* Features section - dynamically rendered based on property type */}
                {featuresList.length > 0 && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Особености <span className={styles.requiredMarker}>*</span></h2>
                    <DynamicPropertyField
                      field={{
                        key: 'features',
                        label: 'Особености',
                        type: 'multi-select',
                        required: false,
                        options: featuresList,
                      }}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      onFeaturesChange={setSelectedFeatures}
                      selectedFeatures={selectedFeatures}
                    />
                  </div>
                )}

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Локация</h2>
                  <div className={styles.formRow}>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Град *</label>
                      <select
                        {...register('city')}
                        className={styles.select}
                      >
                        {cityOptions.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                      {errors.city?.message && (
                        <p className={styles.errorMessage}>{translateErrorMessage(String(errors.city.message))}</p>
                      )}
                    </div>
                    <div className={styles.selectWrapper}>
                      <NeighborhoodSelect
                        city={cityValue}
                        value={neighborhoodValue || ''}
                        onChange={(val) =>
                          setValue('neighborhood', Array.isArray(val) ? val[0] ?? '' : val)
                        }
                        disabled={!cityValue}
                        error={errors.neighborhood?.message
                          ? translateErrorMessage(String(errors.neighborhood.message))
                          : undefined}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    {/* Year built - shown for all property types */}
                    <Input
                      label="Година на строеж *"
                      type="number"
                      {...register('year_built', { valueAsNumber: true })}
                      error={errors.year_built?.message ? translateErrorMessage(String(errors.year_built.message)) : undefined}
                      placeholder="Година"
                      required
                    />
                    {/* Dynamic fields from schema - construction, completion, hotel_category, agricultural_category, electricity, water, bed_base */}
                    {typeFields
                      .filter(field => 
                        ['construction_type', 'completion_status', 'hotel_category', 'agricultural_category', 'electricity', 'water', 'bed_base'].includes(field.key)
                      )
                      .map(field => {
                        // Mark construction_type and completion_status as required
                        const isRequired = field.key === 'construction_type' || field.key === 'completion_status';
                        const fieldWithRequired = isRequired ? { ...field, required: true } : field;
                        return (
                        <DynamicPropertyField
                          key={field.key}
                            field={fieldWithRequired}
                          register={register}
                          errors={errors}
                          setValue={setValue}
                          value={watch(field.key as any)}
                        />
                        );
                      })}
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Изображения</h2>
                  <div className={styles.imagesList}>
                    {imageUrls.length > 0 ? (
                      imageUrls.map((url, index) => (
                        <div className={styles.imageRow} key={`image-${index}`}>
                          <div className={styles.imagePreview}>
                            {url ? (
                              <img src={url} alt={`Изображение ${index + 1}`} />
                            ) : (
                              <div className={styles.imagePlaceholder}>Няма визуализация</div>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => removeImageAtIndex(index)}
                          >
                            Премахни
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noImages}>
                        Все още няма добавени изображения. Използвайте зоната по-долу, за да
                        качите нови.
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
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Описание</h2>
                  <div className={styles.editorSection}>
                    <label className={styles.label}>Описание *</label>
                    <div className={styles.editorWrapper}>
                      <PlateEditor
                        value={editorValue}
                        onChange={setEditorValue}
                        placeholder="Въведете описание на имота..."
                      />
                    </div>
                    {errors.description && (
                      <p className={styles.errorMessage}>{translateErrorMessage(String(errors.description.message))}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formSidebar}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Преводи</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                    className={styles.translateButton}
                  >
                    {isTranslating ? (
                      <>
                        <SpinnerGap size={16} className={styles.spinner} />
                        Превеждане...
                      </>
                    ) : (
                      <>
                        <Globe size={16} />
                        Автоматично превеждане
                      </>
                    )}
                  </Button>

                  {translations.en && (
                    <div className={styles.translation}>
                      <h3 className={styles.translationTitle}>Английски</h3>
                      <p className={styles.translationText}>
                        <strong>{translations.en.title}</strong>
                      </p>
                      <p className={styles.translationText}>{translations.en.description}</p>
                    </div>
                  )}

                  {translations.ru && (
                    <div className={styles.translation}>
                      <h3 className={styles.translationTitle}>Руски</h3>
                      <p className={styles.translationText}>
                        <strong>{translations.ru.title}</strong>
                      </p>
                      <p className={styles.translationText}>{translations.ru.description}</p>
                    </div>
                  )}

                  {translations.de && (
                    <div className={styles.translation}>
                      <h3 className={styles.translationTitle}>Немски</h3>
                      <p className={styles.translationText}>
                        <strong>{translations.de.title}</strong>
                      </p>
                      <p className={styles.translationText}>{translations.de.description}</p>
                    </div>
                  )}
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Брокер</h2>
                  <Input
                    label="Име"
                    {...register('broker_name')}
                    error={errors.broker_name?.message ? translateErrorMessage(String(errors.broker_name.message)) : undefined}
                  />
                  <Input
                    label="Длъжност *"
                    {...register('broker_title', { required: 'Длъжността е задължителна' })}
                    error={errors.broker_title?.message ? translateErrorMessage(String(errors.broker_title.message)) : undefined}
                    required
                  />
                  <Input
                    label="Телефон"
                    {...register('broker_phone')}
                    error={errors.broker_phone?.message ? translateErrorMessage(String(errors.broker_phone.message)) : undefined}
                  />
                  <div className={styles.brokerImageSection}>
                    <h3 className={styles.brokerImageSectionTitle}>Снимка на брокера *</h3>
                    {brokerImageUrl && (
                      <div className={styles.imageRow}>
                        <div className={styles.imagePreview}>
                          <img src={brokerImageUrl} alt="Снимка на брокера" />
                        </div>
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => {
                            if (brokerImageObjectUrlRef.current) {
                              URL.revokeObjectURL(brokerImageObjectUrlRef.current);
                              brokerImageObjectUrlRef.current = null;
                            }
                            brokerImageFileRef.current = null;
                            setBrokerImageUrl(null);
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
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              {submitError && (
                <div className={styles.errorBanner}>
                  <p className={styles.errorMessage}>{submitError}</p>
                </div>
              )}
              {Object.keys(errors).length > 0 && (
                <div className={styles.errorBanner}>
                  <p className={styles.errorMessage}>
                    Моля, поправете грешките във формуляра: {Object.keys(errors).filter(key => key !== 'floor').join(', ')}
                    {Object.keys(errors).includes('floor') && (
                      <span style={{ display: 'none' }}>Floor field validation bypassed</span>
                    )}
                  </p>
                </div>
              )}
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting || isSubmittingForm}
                onClick={() => console.log('Submit button clicked, isSubmitting:', isSubmitting, 'isSubmittingForm:', isSubmittingForm)}
              >
                {isSubmitting || isSubmittingForm ? (
                  <>
                    <SpinnerGap size={20} className={styles.spinner} />
                    {propertyId ? 'Запазване...' : 'Добавяне...'}
                  </>
                ) : (
                  <>
                    <FloppyDisk size={20} /> {propertyId ? 'Запази промените' : 'Добави имот'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отказ
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

