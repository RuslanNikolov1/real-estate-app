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
  APARTMENT_FEATURE_FILTERS,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
} from '@/features/map-filters/filters/constants';
import styles from './PropertyFormPage.module.scss';

const propertySchema = z.object({
  title: z.string().min(1, 'Заглавието е задължително'),
  description: z.string().min(1, 'Описанието е задължително'),
  type: z.enum(['apartment', 'house', 'villa', 'office', 'shop', 'warehouse', 'land', 'hotel']),
  status: z.enum(['for-sale', 'for-rent']),
  location_type: z.enum(['urban', 'mountain', 'coastal']),
  city: z.string().min(1, 'Градът е задължителен'),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  price: z.number().min(0, 'Цената трябва да е положително число'),
  currency: z.string().min(1, 'Валутата е задължителна'),
  area: z.number().min(0, 'Площта трябва да е положително число'),
  price_per_sqm: z.number().optional(),
  rooms: z.number().optional(),
  floor: z.number().optional(),
  total_floors: z.number().optional(),
  year_built: z.number().optional(),
  construction_type: z.string().optional(),
  completion_status: z.string().optional(),
  broker_name: z.string().optional(),
  broker_title: z.string().optional(),
  broker_phone: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

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


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
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
          currency: property.currency,
          area: property.area,
          rooms: property.rooms,
          floor: property.floor,
          total_floors: property.total_floors,
          year_built: property.year_built,
          price_per_sqm:
            property.area && property.price ? Math.round(property.price / property.area) : undefined,
          construction_type: (property as any).construction_type || '',
          completion_status: (property as any).completion_status || '',
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
          currency: 'лв',
          area: 0,
          price_per_sqm: undefined,
          rooms: undefined,
          floor: undefined,
          total_floors: undefined,
          year_built: undefined,
          construction_type: '',
          completion_status: '',
          broker_name: '',
          broker_title: '',
          broker_phone: '',
        },
  });

  const cityValue = watch('city');
  const neighborhoodValue = watch('neighborhood');

  const neighborhoodOptions = useMemo(() => getNeighborhoodsByCity(cityValue), [cityValue]);

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
                    error={errors.title?.message}
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
                      >
                        <option value="apartment">Апартамент</option>
                        <option value="house">Къща</option>
                        <option value="villa">Вила</option>
                        <option value="office">Офис</option>
                        <option value="shop">Магазин</option>
                        <option value="warehouse">Склад</option>
                        <option value="land">Земя</option>
                        <option value="hotel">Хотел</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <Input
                      label="Стаи"
                      type="number"
                      {...register('rooms', { valueAsNumber: true })}
                      error={errors.rooms?.message}
                    />
                    <Input
                      label="Площ (м²) *"
                      type="number"
                      {...register('area', { valueAsNumber: true })}
                      error={errors.area?.message}
                    />
                    <Input
                      label="Цена *"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message}
                    />
                    <Input
                      label="Валута *"
                      {...register('currency')}
                      error={errors.currency?.message}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <Input
                      label="Цена на м²"
                      type="number"
                      {...register('price_per_sqm', { valueAsNumber: true })}
                      error={errors.price_per_sqm?.message}
                    />
                    <Input
                      label="Етаж"
                      type="number"
                      {...register('floor', { valueAsNumber: true })}
                      error={errors.floor?.message}
                    />
                    <Input
                      label="Общо етажи"
                      type="number"
                      {...register('total_floors', { valueAsNumber: true })}
                      error={errors.total_floors?.message}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Особености</h2>
                  <div className={styles.featuresGrid}>
                    {APARTMENT_FEATURE_FILTERS.map((feature) => (
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
                </div>

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
                        <p className={styles.errorMessage}>{errors.city.message}</p>
                      )}
                    </div>
                    <NeighborhoodSelect
                      city={cityValue}
                      value={neighborhoodValue || ''}
                      onChange={(val) =>
                        setValue('neighborhood', Array.isArray(val) ? val[0] ?? '' : val)
                      }
                      disabled={!cityValue}
                      error={errors.neighborhood?.message}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Година на строеж</label>
                      <Input
                        type="number"
                        {...register('year_built', { valueAsNumber: true })}
                        error={errors.year_built?.message}
                      />
                    </div>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Тип строителство</label>
                      <select
                        {...register('construction_type')}
                        className={styles.select}
                      >
                        <option value="">Изберете</option>
                        {CONSTRUCTION_FILTERS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.selectWrapper}>
                      <label className={styles.label}>Степен на завършеност</label>
                      <select
                        {...register('completion_status')}
                        className={styles.select}
                      >
                        <option value="">Изберете</option>
                        {COMPLETION_STATUSES.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      <p className={styles.errorMessage}>{errors.description.message}</p>
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
                    error={errors.broker_name?.message}
                  />
                  <Input
                    label="Длъжност"
                    {...register('broker_title')}
                    error={errors.broker_title?.message}
                  />
                  <Input
                    label="Телефон"
                    {...register('broker_phone')}
                    error={errors.broker_phone?.message}
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

