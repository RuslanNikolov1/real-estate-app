'use client';

import { useEffect, useMemo, useRef, useState, DragEvent, useId } from 'react';
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
} from '@/features/map-filters/filters/constants';
import { CITY_OPTIONS, getNeighborhoodsByCity, getInitialCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import {
  getPropertyTypeSchema,
} from '@/lib/property-schemas';
import type { PropertyType } from '@/types';
import styles from './AddPropertyPage.module.scss';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Апартамент' },
  { id: 'house', label: 'Къща/Вила' },
  { id: 'office', label: 'Офис' },
  { id: 'shop', label: 'Магазин' },
  { id: 'warehouse', label: 'Склад' },
  { id: 'land', label: 'Парцел' },
  { id: 'hotel', label: 'Хотел' },
  { id: 'agricultural', label: 'Земеделска земя' },
  { id: 'garage', label: 'Гараж/Паркоместа' },
  { id: 'restaurant', label: 'Ресторант' },
  { id: 'replace-real-estates', label: 'Замяна на недвижими имоти' },
  { id: 'buy-real-estates', label: 'Купуване на недвижими имоти' },
  { id: 'other-real-estates', label: 'Други недвижими имоти' },
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
  const [broker, setBroker] = useState({
    name: '',
    title: '',
    phone: '',
  });
  const [yearBuilt, setYearBuilt] = useState('');
  const [subtype, setSubtype] = useState('');
  const [yardArea, setYardArea] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
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
  
  const showTotalFloors = useMemo(() => {
    return selectedType === 'apartment';
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
    if (selectedType !== 'apartment') {
      setFloor('');
      setTotalFloors('');
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
  }, [selectedType, showConstruction, showCompletion]);

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
      setSubmitError('Заглавието е задължително');
      return;
    }

    if (!trimmedDescription) {
      setSubmitError('Описанието е задължително');
      return;
    }

    if (!Number.isFinite(numericArea) || numericArea <= 0) {
      setSubmitError('Площта трябва да е положително число');
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setSubmitError('Цената трябва да е положително число');
      return;
    }

    if (!neighborhood) {
      setSubmitError('Моля, изберете квартал');
      return;
    }

    if (imageFilesRef.current.length === 0) {
      setSubmitError('Добавете поне едно изображение');
      return;
    }

    if (!trimmedBrokerName || !trimmedBrokerPhone) {
      setSubmitError('Името и телефонът на брокера са задължителни');
      return;
    }

    setIsSubmitting(true);

    try {
      const saleOrRentValue = selectedStatus === 'for-rent' ? 'rent' : 'sale';
      const formData = new FormData();
      formData.append('status', selectedStatus);
      formData.append('sale_or_rent', saleOrRentValue);
      formData.append('type', selectedType);

      if (subtype) {
        formData.append('subtype', subtype);
      }

      formData.append('area_sqm', numericArea.toString());
      formData.append('price', numericPrice.toString());

      const resolvedPricePerSqm = pricePerSqm || calculatedPricePerSqm;
      if (resolvedPricePerSqm) {
        formData.append('price_per_sqm', resolvedPricePerSqm);
      }

      if (floor) {
        formData.append('floor', floor);
      }

      if (totalFloors) {
        formData.append('total_floors', totalFloors);
      }

      formData.append('city', city);
      formData.append('neighborhood', neighborhood);

      formData.append('title', trimmedTitle);
      formData.append('description', trimmedDescription);

      if (yearBuilt) {
        formData.append('build_year', yearBuilt);
      }

      if (selectedConstruction) {
        formData.append('construction_type', selectedConstruction);
      }

      if (selectedCompletion) {
        formData.append('completion_degree', selectedCompletion);
      }

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

      if (electricity) {
        formData.append('electricity', electricity);
      }

      if (water) {
        formData.append('water', water);
      }

      if (yardArea) {
        formData.append('yard_area', yardArea);
      }

      selectedFeatures.forEach((feature) => {
        formData.append('features', feature);
      });

      formData.append('broker_name', trimmedBrokerName);

      if (broker.title.trim()) {
        formData.append('broker_position', broker.title.trim());
      }

      formData.append('broker_phone', trimmedBrokerPhone);

      imageFilesRef.current.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Грешка при добавянето на имота');
      }

      router.push('/admin/properties/quick-view?status=property-added');
    } catch (error) {
      console.error('Failed to create property via configurator:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Неуспешно добавяне на имота. Моля, опитайте отново.',
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
    };
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <Link href="/admin/properties">Имоти</Link>
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
            <Input
              label="Заглавие *"
              placeholder="Луксозен апартамент в центъра"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </section>

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
              <div className={styles.control}>
                <label>Тип имот *</label>
                <div className={styles.chipGroup}>
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`${styles.chip} ${
                        selectedType === type.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Subtype field - shown based on property type */}
              {typeSchema.subtypeOptions.length > 0 && (
                <div className={styles.control}>
                  <label>
                    {selectedType === 'house'
                      ? 'Етажност'
                      : 'Подтип'}
                  </label>
                  <select
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    className={styles.select}
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
          </section>

          <section className={styles.section}>
            <h2>Основни стойности</h2>
            <div className={styles.inputsRow}>
              <Input
                label={`${selectedType === 'hotel' ? 'РЗП (м²)' : 'Площ (м²)'} *`}
                placeholder="120"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                required
              />
              <Input
                label="Цена *"
                placeholder="250 000"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
              <Input
                label="Цена на м²"
                placeholder="изчислява се"
                value={pricePerSqm || calculatedPricePerSqm}
                onChange={(event) => setPricePerSqm(event.target.value)}
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
              {/* Floor - only for apartments, offices, shops */}
              {showFloor && (
                <Input
                  label="Етаж"
                  placeholder="3"
                  value={floor}
                  onChange={(event) => setFloor(event.target.value)}
                />
              )}
              {/* Total floors - only for apartments */}
              {showTotalFloors && (
                <Input
                  label="Общо етажи"
                  placeholder="5"
                  value={totalFloors}
                  onChange={(event) => setTotalFloors(event.target.value)}
                />
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Локация</h2>
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
              <NeighborhoodSelect
                city={city}
                value={neighborhood}
                onChange={(val) => setNeighborhood(Array.isArray(val) ? val[0] ?? '' : val)}
                disabled={!city}
                label="Квартал"
                required
              />
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
                <label>Година на строеж</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={yearBuilt}
                  onChange={(event) => setYearBuilt(event.target.value)}
                />
              </div>
              {/* Construction Type - only if in schema */}
              {showConstruction && (
                <div className={styles.control}>
                  <label>Конструкция</label>
                  <select
                    value={selectedConstruction}
                    onChange={(e) => setSelectedConstruction(e.target.value)}
                    className={styles.select}
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
                  <label>Степен на завършеност</label>
                  <div className={styles.chipGroup}>
                    {COMPLETION_STATUSES.map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        className={`${styles.chipSmall} ${
                          selectedCompletion === status.id ? styles.active : ''
                        }`}
                        onClick={() => setSelectedCompletion(status.id)}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
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
              <h2>Особености</h2>
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
                label="Длъжност"
                placeholder="Старши брокер"
                value={broker.title}
                onChange={(event) => setBroker((prev) => ({ ...prev, title: event.target.value }))}
              />
              <Input
                label="Телефон *"
                placeholder="+359 888 123 456"
                value={broker.phone}
                onChange={(event) => setBroker((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
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
      </main>
      <Footer />
    </div>
  );
}

