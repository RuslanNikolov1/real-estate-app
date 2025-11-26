'use client';

import { useState, useEffect, useMemo, useRef, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlateEditor, Value } from '@/lib/plate-editor';
import { translateProperty } from '@/lib/translator';
import { CITY_OPTIONS, getNeighborhoodsByCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
// import { Property, PropertyType, PropertyStatus, LocationType } from '@/types';
import { FloppyDisk, X, Globe, SpinnerGap } from '@phosphor-icons/react';
import { mockProperties } from '@/features/properties/PropertiesListPage';
import {
  generatePropertySchema,
  getPropertyTypeSchema,
  getFieldsForPropertyType,
} from '@/lib/property-schemas';
import type { PropertyType } from '@/types';
import { DynamicPropertyField } from '@/components/forms/DynamicPropertyField';
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
  const router = useRouter();
  const property = propertyId ? mockProperties.find((p) => p.id === propertyId) : undefined;
  const [isTranslating, setIsTranslating] = useState(false);
  const [editorValue, setEditorValue] = useState<Value>(initialEditorValue);
  const [translations, setTranslations] = useState<{
    en?: { title: string; description: string };
    ru?: { title: string; description: string };
    de?: { title: string; description: string };
  }>({});
  const [imageUrls, setImageUrls] = useState<string[]>(property?.images?.map((img) => img.url) ?? []);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    (property as any)?.features ?? [],
  );
  const createdObjectUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cityOptions = useMemo(() => {
    if (property?.city && !CITY_OPTIONS.includes(property.city)) {
      return [property.city, ...CITY_OPTIONS];
    }
    return CITY_OPTIONS;
  }, [property?.city]);

  const addObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
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
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      createdObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrlsRef.current = [];
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
    setValue,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          title: property.title,
          description: property.description,
          type: property.type,
          status: property.status === 'for-sale' || property.status === 'for-rent' ? property.status : 'for-sale',
          location_type: property.location_type,
          city: property.city,
          neighborhood: property.neighborhood || '',
          address: property.address || '',
          price: property.price,
          area: property.area,
          floor: property.floor,
          total_floors: property.total_floors,
          price_per_sqm:
            property.area && property.price ? Math.round(property.price / property.area) : undefined,
          construction_type: (property as any).construction_type || '',
          completion_status: (property as any).completion_status || '',
          subtype: (property as any).subtype || '',
          yard_area: (property as any).yard_area || undefined,
          hotel_category: (property as any).hotel_category || '',
          broker_name: (property as any)?.broker?.name || '',
          broker_title: (property as any)?.broker?.title || '',
          broker_phone: (property as any)?.broker?.phone || '',
        }
      : {
          title: '',
          description: '',
          type: 'apartment',
          status: 'for-sale',
          location_type: 'urban',
          city: CITY_OPTIONS[0] ?? 'Бургас',
          neighborhood: '',
          address: '',
          price: 0,
          area: 0,
          price_per_sqm: undefined,
          floor: undefined,
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
        address: currentValues.address || '',
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
  
  const showTotalFloors = useMemo(() => {
    return propertyType === 'apartment';
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
    if (property?.description) {
      // Parse existing description if it's JSON (from Plate)
      try {
        const parsed = JSON.parse(property.description);
        setEditorValue(parsed);
      } catch {
        // If not JSON, create a simple paragraph
        setEditorValue([
          {
            type: 'p',
            children: [{ text: property.description }],
          },
        ]);
      }
    }

    if (property?.images?.length) {
      setImageUrls(property.images.map((img) => img.url));
    } else {
      setImageUrls([]);
    }
    if ((property as any)?.features) {
      setSelectedFeatures((property as any).features);
    } else {
      setSelectedFeatures([]);
    }
  }, [property]);

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

  const onSubmit = async (data: PropertyFormData) => {
    try {
      // Convert editor value to JSON string
      const descriptionJson = JSON.stringify(editorValue);

      // TODO: Save to Supabase
      console.log('Property data:', {
        ...data,
        description: descriptionJson,
        translations,
        images: imageUrls.filter((url) => url.trim().length > 0),
        features: selectedFeatures,
      });

      // Redirect to admin properties list
      router.push('/admin/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Грешка при запазването. Моля, опитайте отново.');
    }
  };

  return (
    <div className={styles.propertyFormPage}>
      <main className={styles.main}>
        <div className={styles.container}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formMain}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Основни данни</h2>
                  <Input
                    label="Заглавие *"
                    {...register('title')}
                    error={errors.title?.message ? String(errors.title.message) : undefined}
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
                          {propertyType === 'house'
                            ? 'Етажност' 
                            : propertyType === 'apartment'
                            ? 'Подтип'
                            : 'Подтип'}
                        </label>
                        <select
                          {...register('subtype')}
                          className={styles.select}
                          value={watch('subtype') || ''}
                          onChange={(e) => setValue('subtype', e.target.value)}
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
                            {String(errors.subtype.message)}
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
                      error={errors.area?.message ? String(errors.area.message) : undefined}
                    />
                    <Input
                      label="Цена *"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message ? String(errors.price.message) : undefined}
                    />
                    <Input
                      label="Цена на м²"
                      type="number"
                      {...register('price_per_sqm', { valueAsNumber: true })}
                      error={errors.price_per_sqm?.message ? String(errors.price_per_sqm.message) : undefined}
                    />
                  </div>
                  {/* Dynamic fields based on property type - conditionally shown */}
                  <div className={styles.formRow}>
                    {/* Floor - only for apartments, offices, shops */}
                    {showFloor && (
                      <Input
                        label="Етаж"
                        type="number"
                        {...register('floor', { valueAsNumber: true })}
                        error={errors.floor?.message ? String(errors.floor.message) : undefined}
                        placeholder="Етаж"
                      />
                    )}
                    {/* Total floors - only for apartments */}
                    {showTotalFloors && (
                      <Input
                        label="Общо етажи"
                        type="number"
                        {...register('total_floors', { valueAsNumber: true })}
                        error={errors.total_floors?.message ? String(errors.total_floors.message) : undefined}
                        placeholder="Общо етажи"
                      />
                    )}
                    {/* Yard area - only for houses */}
                    {showYardArea && (
                      <Input
                        label="Площ на двора (м²)"
                        type="number"
                        {...register('yard_area' as any, { valueAsNumber: true })}
                        error={errors.yard_area?.message ? String(errors.yard_area.message) : undefined}
                        placeholder="Площ на двора"
                      />
                    )}
                  </div>
                </div>

                {/* Features section - dynamically rendered based on property type */}
                {featuresList.length > 0 && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Особености</h2>
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
                        <p className={styles.errorMessage}>{String(errors.city.message)}</p>
                      )}
                    </div>
                    <NeighborhoodSelect
                      city={cityValue}
                      value={neighborhoodValue || ''}
                      onChange={(val) =>
                        setValue('neighborhood', Array.isArray(val) ? val[0] ?? '' : val)
                      }
                      disabled={!cityValue}
                      error={errors.neighborhood?.message ? String(errors.neighborhood.message) : undefined}
                    />
                  </div>
                  <div className={styles.formRow}>
                    {/* Year built - shown for all property types */}
                    <Input
                      label="Година на строеж"
                      type="number"
                      {...register('year_built', { valueAsNumber: true })}
                      error={errors.year_built?.message ? String(errors.year_built.message) : undefined}
                      placeholder="Година"
                    />
                    {/* Dynamic fields from schema - construction, completion, building_type, hotel_category, agricultural_category, electricity, water, bed_base */}
                    {typeFields
                      .filter(field => 
                        ['construction_type', 'completion_status', 'building_type', 'hotel_category', 'agricultural_category', 'electricity', 'water', 'bed_base'].includes(field.key)
                      )
                      .map(field => (
                        <DynamicPropertyField
                          key={field.key}
                          field={field}
                          register={register}
                          errors={errors}
                          setValue={setValue}
                          value={watch(field.key as any)}
                        />
                      ))}
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
                            <span className={styles.imageUrl}>{url}</span>
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
                      <p className={styles.errorMessage}>{String(errors.description.message)}</p>
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
                    error={errors.broker_name?.message ? String(errors.broker_name.message) : undefined}
                  />
                  <Input
                    label="Длъжност"
                    {...register('broker_title')}
                    error={errors.broker_title?.message ? String(errors.broker_title.message) : undefined}
                  />
                  <Input
                    label="Телефон"
                    {...register('broker_phone')}
                    error={errors.broker_phone?.message ? String(errors.broker_phone.message) : undefined}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                <FloppyDisk size={20} /> {propertyId ? 'Запази промените' : 'Добави имот'}
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

