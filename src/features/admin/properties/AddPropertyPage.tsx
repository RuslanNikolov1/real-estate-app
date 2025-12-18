'use client';

import { useEffect, useMemo, useRef, useState, DragEvent, useId, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  APARTMENT_FEATURE_FILTERS,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
  FLOOR_SPECIAL_OPTIONS,
} from '@/features/map-filters/filters/constants';
import { CITY_OPTIONS, getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import burgasCities from '@/data/burgasCities.json';
import {
  getPropertyTypeSchema,
} from '@/lib/property-schemas';
import type { PropertyType } from '@/types';
import styles from './AddPropertyPage.module.scss';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Апартамент' },
  { id: 'house', label: 'Къща/Вила' },
  { id: 'office', label: 'Магазин/Офис/Кабинет/Салон' },
  { id: 'land', label: 'Строителен парцел/Инвестиционен проект' },
  { id: 'agricultural', label: 'Земеделска земя/Лозя/Гори' },
  { id: 'warehouse', label: 'Складове/Индустриални и стопански имоти' },
  { id: 'garage', label: 'Гараж/Паркоместа' },
  { id: 'hotel', label: 'Хотели/Мотели' },
  { id: 'restaurant', label: 'Ресторант' },
  { id: 'replace-real-estates', label: 'Замяна на недвижими имоти' },
  { id: 'buy-real-estates', label: 'Купуване на недвижими имоти' },
];

const PROPERTY_STATUSES = [
  { id: 'for-sale', label: 'За продажба' },
  { id: 'for-rent', label: 'Под наем' },
];


export function AddPropertyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(PROPERTY_TYPES[0].id);
  const [selectedStatus, setSelectedStatus] = useState(PROPERTY_STATUSES[0].id);
  const [selectedCompletion, setSelectedCompletion] = useState(COMPLETION_STATUSES[0].id);
  const [selectedConstruction, setSelectedConstruction] = useState(CONSTRUCTION_FILTERS[0].id);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [manualNeighborhoodInput, setManualNeighborhoodInput] = useState('');
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if the city is a valid selected city from the list
  const isValidCity = useCallback((cityName: string) => {
    if (!cityName) return false;
    return CITY_OPTIONS.some(
      (c) => c.toLowerCase() === cityName.toLowerCase()
    );
  }, []);
  
  const isCitySelected = isValidCity(city.trim());
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [areaError, setAreaError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [pricePerSqmError, setPricePerSqmError] = useState<string | null>(null);
  const [yearBuiltError, setYearBuiltError] = useState<string | null>(null);
  const [brokerPhoneError, setBrokerPhoneError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  // Helper to validate Bulgarian phone number
  // Supports: +359XXXXXXXXX (10 digits after +359) or 0XXXXXXXXX (9 digits after 0)
  // Allows spaces/dashes: +359 XXX XXX XXX or 0XXX XXX XXX
  const validateBulgarianPhone = (phone: string): boolean => {
    if (!phone || !phone.trim()) return false;
    // Remove all spaces and dashes for validation
    const cleaned = phone.replace(/[\s-]/g, '');
    // Check +359 format: +359 followed by 9 digits (total 13 chars)
    if (cleaned.startsWith('+359')) {
      return /^\+359[0-9]{9}$/.test(cleaned);
    }
    // Check 0 format: 0 followed by 9 digits (total 10 chars)
    if (cleaned.startsWith('0')) {
      return /^0[0-9]{9}$/.test(cleaned);
    }
    return false;
  };
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
  const descriptionFieldId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get schema for current property type
  const typeSchema = useMemo(() => getPropertyTypeSchema(selectedType as PropertyType), [selectedType]);
  
  // Get features list for current property type
  const featuresList = useMemo(() => {
    const featuresField = typeSchema.fields.find(f => f.key === 'features');
    return featuresField?.options || [];
  }, [typeSchema]);
  
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
  
  // Reset type-specific fields when property type changes
  useEffect(() => {
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
    // Clear validation errors
    setAreaError(null);
    setPriceError(null);
    setPricePerSqmError(null);
    setYearBuiltError(null);
    setBrokerPhoneError(null);
  }, [selectedType, showConstruction, showCompletion]);

  const neighborhoodOptions = useMemo(() => getNeighborhoodsByCity(city), [city]);

  useEffect(() => {
    // Only validate neighborhoods if city is in the list
    if (isCitySelected) {
      if (!neighborhoodOptions.length) {
        setNeighborhood('');
        setManualNeighborhoodInput('');
        return;
      }
      if (!neighborhoodOptions.includes(neighborhood)) {
        setNeighborhood(neighborhoodOptions[0]);
      }
      // Clear manual input when switching to a valid city
      if (manualNeighborhoodInput) {
        setManualNeighborhoodInput('');
      }
    } else {
      // For manual cities, use manual neighborhood input
      if (manualNeighborhoodInput.trim()) {
        setNeighborhood(manualNeighborhoodInput.trim());
      } else {
        setNeighborhood('');
      }
    }
  }, [neighborhoodOptions, neighborhood, isCitySelected, manualNeighborhoodInput]);

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

  // Helper to format city / neighborhood names: each word capitalized
  // For neighborhoods, keeps abbreviations like "ж.к", "ул.", "бул." lowercase
  const formatLocationName = (value: string, isNeighborhood: boolean = false) => {
    if (!value) return value;
    return value
      .trim()
      .split(/\s+/)
      .map((word) => {
        if (word.length === 0) return word;
        // For neighborhoods, keep abbreviations lowercase
        if (isNeighborhood) {
          const lowerWord = word.toLowerCase();
          if (lowerWord.startsWith('ж.к') || lowerWord.startsWith('ул.') || lowerWord.startsWith('бул.')) {
            return lowerWord;
          }
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
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

    // Validate area is a number
    if (!area.trim() || isNaN(numericArea) || !Number.isFinite(numericArea) || numericArea <= 0) {
      setAreaError(t('errors.areaMustBePositive'));
      setSubmitError(t('errors.areaMustBePositive'));
      return;
    }

    // Validate price is a number
    if (!price.trim() || isNaN(numericPrice) || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setPriceError(t('errors.priceMustBePositive'));
      setSubmitError(t('errors.priceMustBePositive'));
      return;
    }
    
    // Validate price per sqm (required)
    const resolvedPricePerSqm = pricePerSqm || calculatedPricePerSqm;
    if (!resolvedPricePerSqm || !resolvedPricePerSqm.trim()) {
      setPricePerSqmError(t('errors.pricePerSqmInvalid'));
      setSubmitError(t('errors.pricePerSqmInvalid'));
      return;
    }
    const numericPricePerSqm = parseFloat(resolvedPricePerSqm);
    if (isNaN(numericPricePerSqm) || !Number.isFinite(numericPricePerSqm) || numericPricePerSqm < 0) {
      setPricePerSqmError(t('errors.pricePerSqmInvalid'));
      setSubmitError(t('errors.pricePerSqmInvalid'));
      return;
    }

    if (typeSchema.subtypeOptions.length > 0 && !subtype) {
      setSubmitError(t('errors.subtypeRequired'));
      return;
    }

    if (!broker.title.trim()) {
      setSubmitError(t('errors.brokerPositionRequired'));
      return;
    }

    if (!brokerImageFileRef.current && !brokerImagePreview) {
      setSubmitError(t('errors.brokerImageRequired'));
      return;
    }

    if (images.length === 0) {
      setSubmitError(t('errors.addAtLeastOneImage'));
      return;
    }

    if (!trimmedBrokerName || !trimmedBrokerPhone) {
      if (!trimmedBrokerPhone) {
        setBrokerPhoneError(t('errors.brokerNameAndPhoneRequired'));
      }
      setSubmitError(t('errors.brokerNameAndPhoneRequired'));
      return;
    }
    
    // Validate Bulgarian phone number format
    if (!validateBulgarianPhone(trimmedBrokerPhone)) {
      setBrokerPhoneError(t('errors.phoneInvalid'));
      setSubmitError(t('errors.phoneInvalid'));
      return;
    }

    // Validate floor (required for apartments, offices, shops)
    if (showFloor && !floor) {
      setSubmitError(t('errors.floorRequired'));
      return;
    }

    // Validate year built (required and must be a number)
    if (!yearBuilt || !yearBuilt.trim()) {
      setYearBuiltError(t('errors.yearBuiltRequired'));
      setSubmitError(t('errors.yearBuiltRequired'));
      return;
    }
    const numericYearBuilt = parseInt(yearBuilt, 10);
    if (isNaN(numericYearBuilt) || !Number.isFinite(numericYearBuilt)) {
      setYearBuiltError(t('errors.yearBuiltInvalid'));
      setSubmitError(t('errors.yearBuiltInvalid'));
      return;
    }
    if (numericYearBuilt < 1000 || numericYearBuilt > new Date().getFullYear() + 10) {
      setYearBuiltError(t('errors.yearBuiltInvalid'));
      setSubmitError(t('errors.yearBuiltInvalid'));
      return;
    }

    // Validate construction type (required when shown)
    if (showConstruction && (!selectedConstruction || selectedConstruction.trim() === '')) {
      setSubmitError(t('errors.constructionRequired'));
      return;
    }

    // Validate completion status (required when shown)
    if (showCompletion && (!selectedCompletion || selectedCompletion.trim() === '')) {
      setSubmitError(t('errors.completionStatusRequired'));
      return;
    }

    // Validate features (at least one required)
    if (selectedFeatures.length === 0) {
      setSubmitError(t('errors.atLeastOneFeatureRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const saleOrRentValue = selectedStatus === 'for-rent' ? 'rent' : 'sale';
      const formData = new FormData();
      // Note: status column removed from database, using sale_or_rent instead
      formData.append('sale_or_rent', saleOrRentValue);
      formData.append('type', selectedType);

      if (typeSchema.subtypeOptions.length > 0) {
        formData.append('subtype', subtype);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:subtype',message:'Submitting property with subtype',data:{selectedType,subtype},timestamp:Date.now(),sessionId:'debug-session',runId:'subtype-debug',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      }

      formData.append('area_sqm', numericArea.toString());
      formData.append('price', numericPrice.toString());

      // Price per sqm is required - use provided value or calculated value
      const resolvedPricePerSqm = pricePerSqm || calculatedPricePerSqm;
      formData.append('price_per_sqm', resolvedPricePerSqm);

      // Floor is required for apartments, offices, shops
      if (showFloor) {
        formData.append('floor', floor);
      }

      const formattedCity = formatLocationName(city, false);
      const formattedNeighborhood = formatLocationName(neighborhood, true);

      formData.append('city', formattedCity);
      formData.append('neighborhood', formattedNeighborhood);

      formData.append('title', trimmedTitle);
      formData.append('description', trimmedDescription);

      // Year built is required
        formData.append('build_year', yearBuilt);

      // Construction type is required when shown
      if (showConstruction && selectedConstruction) {
        formData.append('construction_type', selectedConstruction);
      }

      // Completion status is required when shown
      if (showCompletion && selectedCompletion) {
        formData.append('completion_degree', selectedCompletion);
      }

      // Building type (вид сграда) - optional, when available in schema
      if (buildingType) {
        formData.append('building_type', buildingType);
      }

      if (hotelCategory) {
        formData.append('hotel_category', hotelCategory);
      }

      if (agriculturalCategory) {
        formData.append('agricultural_category', agriculturalCategory);
      }

      if (bedBase) {
        formData.append('bed_base', bedBase);
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:494',message:'Electricity and water values before formData append',data:{electricity,electricityType:typeof electricity,electricityTruthy:!!electricity,water,waterType:typeof water,waterTruthy:!!water,selectedType},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-debug',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      if (electricity) {
        formData.append('electricity', electricity);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:496',message:'Electricity appended to formData',data:{electricity},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-debug',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:497',message:'Electricity NOT appended (falsy value)',data:{electricity},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-debug',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      }

      if (water) {
        formData.append('water', water);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:500',message:'Water appended to formData',data:{water},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-debug',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:501',message:'Water NOT appended (falsy value)',data:{water},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-debug',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      }

      if (yardArea) {
        formData.append('yard_area', yardArea);
      }

      selectedFeatures.forEach((feature) => {
        formData.append('features', feature);
      });

      formData.append('broker_name', trimmedBrokerName);
      formData.append('broker_position', broker.title.trim());
      formData.append('broker_phone', trimmedBrokerPhone);

      // Broker image is required - validation already checked above
      if (brokerImageFileRef.current) {
        formData.append('broker_image', brokerImageFileRef.current);
      } else {
        // This should not happen due to validation, but handle it gracefully
        setSubmitError(t('errors.brokerImageRequired'));
        return;
      }

      imageFilesRef.current.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddPropertyPage.tsx:472',message:'API error response',data:{status:response.status,statusText:response.statusText,errorData,formDataKeys:Array.from(formData.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        // Handle validation errors - format them in Bulgarian
        if (errorData?.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: any) => {
            const fieldLabel = err.fieldLabel || err.path || 'поле';
            return `${fieldLabel}: ${err.message}`;
          }).join('\n');
          throw new Error(`Грешки при валидация:\n${validationErrors}`);
        }
        
        const errorMessage = errorData?.error || errorData?.details || 'flashMessages.propertyAddError';
        // Translate error message if it's a translation key
        const translatedError = errorMessage.startsWith('errors.') 
          ? t(errorMessage as any, { fileName: errorMessage.split(':')[1] || '' })
          : errorMessage.startsWith('flashMessages.')
          ? t(errorMessage as any)
          : errorMessage;
        throw new Error(translatedError);
      }

      const createdProperty = await response.json();
      
      // Store optimistic property in sessionStorage for immediate UI update
      if (createdProperty) {
        sessionStorage.setItem('optimistic-property', JSON.stringify(createdProperty));
        sessionStorage.setItem('optimistic-action', 'add');
      }

      router.push('/admin/properties/quick-view?status=property-added');
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

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link href="/admin/properties/quick-view">Имоти</Link>
          <span>/</span>
          <span>Конфигуратор</span>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h1 className={styles.title}>Добави имот</h1>
              <p className={styles.subtitle}>Използвайте опциите по-долу за да подготвите нов имот.</p>
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
                <div className={styles.selectWrapper}>
                  <label className={styles.label}>Тип имот *</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="apartment">Апартамент</option>
                    <option value="house">Къща/Вила</option>
                    <option value="office">Магазин/Офис/Кабинет/Салон</option>
                    <option value="land">Строителен парцел/Инвестиционен проект</option>
                    <option value="agricultural">Земеделска земя/Лозя/Гори</option>
                    <option value="warehouse">Складове/Индустриални и стопански имоти</option>
                    <option value="garage">Гараж/Паркоместа</option>
                    <option value="hotel">Хотели/Мотели</option>
                    <option value="restaurant">Ресторант</option>
                    <option value="replace-real-estates">Замяна на недвижими имоти</option>
                    <option value="buy-real-estates">Купуване на недвижими имоти</option>
                  </select>
                </div>
                {/* Subtype field - shown based on property type */}
                {typeSchema.subtypeOptions.length > 0 && (
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
                      {typeSchema.subtypeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className={`${styles.inputsRow} ${styles.titleRow}`}>
              <Input
                label="Заглавие *"
                placeholder="Луксозен апартамент в центъра"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Основни стойности</h2>
            <div className={styles.inputsRow}>
              <Input
                label={`${selectedType === 'hotel' ? 'РЗП (м²)' : 'Площ (м²)'} *`}
                placeholder="120"
                type="number"
                min="0"
                step="0.01"
                value={area}
                onChange={(event) => {
                  const value = event.target.value;
                  setArea(value);
                  // Validate immediately
                  if (value.trim() === '') {
                    setAreaError(null);
                  } else {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                      setAreaError(t('errors.areaInvalid'));
                    } else if (numValue <= 0) {
                      setAreaError(t('errors.areaMustBePositive'));
                    } else {
                      setAreaError(null);
                    }
                  }
                }}
                onBlur={() => {
                  if (area.trim() && !areaError) {
                    const numValue = parseFloat(area);
                    if (isNaN(numValue) || numValue <= 0) {
                      setAreaError('Площта трябва да е положително число');
                    }
                  }
                }}
                error={areaError || undefined}
                required
              />
              <Input
                label="Цена *"
                placeholder="250 000"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => {
                  const value = event.target.value;
                  setPrice(value);
                  // Validate immediately
                  if (value.trim() === '') {
                    setPriceError(null);
                  } else {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                      setPriceError(t('errors.priceInvalid'));
                    } else if (numValue <= 0) {
                      setPriceError(t('errors.priceMustBePositive'));
                    } else {
                      setPriceError(null);
                    }
                  }
                }}
                onBlur={() => {
                  if (price.trim() && !priceError) {
                    const numValue = parseFloat(price);
                    if (isNaN(numValue) || numValue <= 0) {
                      setPriceError('Цената трябва да е положително число');
                    }
                  }
                }}
                error={priceError || undefined}
                required
              />
              <Input
                label="Цена на м² *"
                placeholder="изчислява се"
                type="number"
                min="0"
                step="0.01"
                value={pricePerSqm || calculatedPricePerSqm}
                onChange={(event) => {
                  const value = event.target.value;
                  setPricePerSqm(value);
                  // Validate immediately
                  const resolvedValue = value || calculatedPricePerSqm;
                  if (!resolvedValue || !resolvedValue.trim()) {
                    setPricePerSqmError(t('errors.pricePerSqmInvalid'));
                  } else {
                    const numValue = parseFloat(resolvedValue);
                    if (isNaN(numValue)) {
                      setPricePerSqmError(t('errors.pricePerSqmInvalid'));
                    } else if (numValue < 0) {
                      setPricePerSqmError(t('errors.pricePerSqmInvalid'));
                    } else {
                      setPricePerSqmError(null);
                    }
                  }
                }}
                onBlur={() => {
                  const resolvedValue = pricePerSqm || calculatedPricePerSqm;
                  if (!resolvedValue || !resolvedValue.trim()) {
                    setPricePerSqmError(t('errors.pricePerSqmInvalid'));
                  } else {
                    const numValue = parseFloat(resolvedValue);
                    if (isNaN(numValue) || numValue < 0) {
                      setPricePerSqmError(t('errors.pricePerSqmInvalid'));
                    } else {
                      setPricePerSqmError(null);
                    }
                  }
                }}
                error={pricePerSqmError || undefined}
                required
              />
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
                    {FLOOR_SPECIAL_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Локация</h2>
            <div className={styles.inputsRow}>
              <div className={styles.control}>
                <label>Град *</label>
                <div className={styles.autocompleteWrapper}>
                  <Input
                    placeholder="Въведете или изберете град (пр. Бургас)"
                        value={city}
                            onChange={(event) => {
                      const value = event.target.value;
                      setCity(value);
                      // Show dropdown only when there is some input
                      if (value.trim().length > 0) {
                        setShowCityDropdown(true);
                      } else {
                        setShowCityDropdown(false);
                      }
                    }}
                    onFocus={() => {
                      // Show dropdown if there are matching options
                      if (city.trim().length > 0 || CITY_OPTIONS.length > 0) {
                        setShowCityDropdown(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding dropdown to allow click on dropdown item
                      setTimeout(() => {
                        if (!cityDropdownRef.current?.contains(document.activeElement)) {
                          setShowCityDropdown(false);
                          // Format city name on blur if manually entered
                          if (city.trim() && !isCitySelected) {
                            const formatted = formatLocationName(city, false);
                            setCity(formatted);
                          }
                        }
                      }, 200);
                    }}
                    ref={cityInputRef}
                    required
                  />
                  {showCityDropdown && CITY_OPTIONS.length > 0 && (
                    <div
                      ref={cityDropdownRef}
                      className={styles.cityDropdown}
                    >
                      {CITY_OPTIONS
                        .filter((cityName) => {
                          const searchTerm = city.toLowerCase().trim();
                          if (!searchTerm) return true;
                          return cityName.toLowerCase().includes(searchTerm);
                        })
                        .map((cityName) => {
                          // Find coordinates from burgasCities for map/distance calculations
                          const cityData = burgasCities.cities.find(
                            (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
                              c.nameEn.toLowerCase() === cityName.toLowerCase()
                          );
                          const coordinates: [number, number] = cityData && cityData.coordinates && cityData.coordinates.length === 2
                            ? [cityData.coordinates[0], cityData.coordinates[1]]
                            : [0, 0]; // Fallback if coordinates not found
                          
                          return (
                            <button
                              key={cityName}
                              type="button"
                              className={styles.cityDropdownItem}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                              }}
                                    onClick={() => {
                                const formattedCityName = formatLocationName(cityName, false);
                                setCity(formattedCityName);
                                setShowCityDropdown(false);
                                // Reset neighborhood when city changes
                                const newOptions = getNeighborhoodsByCity(formattedCityName);
                                setNeighborhood(newOptions[0] ?? '');
                                setManualNeighborhoodInput('');
                              }}
                            >
                              {cityName}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
              {city.trim() && (
                <div className={styles.control}>
                  {isCitySelected ? (
                    <NeighborhoodSelect
                      city={city}
                      value={neighborhood}
                      onChange={(val) => setNeighborhood(Array.isArray(val) ? val[0] ?? '' : val)}
                      disabled={!isCitySelected}
                      label="Квартал"
                    />
                  ) : (
                    <div className={styles.manualNeighborhoodInputWrapper}>
                      <label htmlFor="neighborhood-manual" className={styles.manualNeighborhoodLabel}>
                        Квартал
                      </label>
                      <input
                        id="neighborhood-manual"
                        type="text"
                        placeholder="Въведете квартал"
                        value={manualNeighborhoodInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setManualNeighborhoodInput(value);
                          // Update neighborhood state immediately
                          const trimmedValue = value.trim();
                          setNeighborhood(trimmedValue);
                        }}
                        onBlur={() => {
                          // Format neighborhood name on blur
                          if (manualNeighborhoodInput.trim()) {
                            const formatted = formatLocationName(manualNeighborhoodInput, true);
                            setManualNeighborhoodInput(formatted);
                            setNeighborhood(formatted);
                          }
                        }}
                        className={styles.manualNeighborhoodInputField}
                      />
                    </div>
                  )}
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

          <section className={styles.section}>
            <h2>Параметри</h2>
            <div className={styles.filtersRow}>
              {/* Year built - shown for all property types */}
              <div className={styles.control}>
                <label>Година на строеж *</label>
                <Input
                  type="number"
                  placeholder="2024"
                  min="1000"
                  max={new Date().getFullYear() + 10}
                  step="1"
                  value={yearBuilt}
                  onChange={(event) => {
                    setYearBuilt(event.target.value);
                    // Clear error when user types
                    setYearBuiltError(null);
                  }}
                  error={yearBuiltError || undefined}
                  required
                />
              </div>
              {/* Construction Type - only if in schema */}
              {showConstruction && (
                <div className={styles.control}>
                  <label>Вид строителство *</label>
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
              {/* Building Type - for offices/shops */}
              {typeSchema.fields.find(f => f.key === 'building_type') && (
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
              {/* Hotel Category - for hotels */}
              {typeSchema.fields.find(f => f.key === 'hotel_category') && (
                <div className={styles.control}>
                  <label>Категория</label>
                  <select
                    value={hotelCategory}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Изберете</option>
                    {(() => {
                      const hotelCategoryField = typeSchema.fields.find(f => f.key === 'hotel_category');
                      return hotelCategoryField?.options?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      )) || [];
                    })()}
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
              {/* Bed Base - for hotels */}
              {typeSchema.fields.find(f => f.key === 'bed_base') && (
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
                placeholder="+359 888 123 456 или 0888 123 456"
                value={broker.phone}
                onChange={(event) => {
                  setBroker((prev) => ({ ...prev, phone: event.target.value }));
                  // Clear error when user types
                  setBrokerPhoneError(null);
                }}
                error={brokerPhoneError || undefined}
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
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('admin.addPropertySubmitting') : t('admin.addPropertyButton')}
            </Button>
            <Link href="/admin/properties/quick-view" className={styles.linkButton}>
              Отказ
            </Link>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

