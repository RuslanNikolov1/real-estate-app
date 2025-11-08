'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlateEditor } from '@/lib/plate-editor';
import { translateProperty } from '@/lib/translator';
// import { Property, PropertyType, PropertyStatus, LocationType } from '@/types';
import { Save, X, Globe, Loader2 } from 'lucide-react';
import { mockProperties } from '@/features/properties/PropertiesListPage';
import styles from './PropertyFormPage.module.scss';
import { Value } from '@udecode/plate-common';

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
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor: z.number().optional(),
  total_floors: z.number().optional(),
  year_built: z.number().optional(),
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [editorValue, setEditorValue] = useState<Value>(initialEditorValue);
  const [translations, setTranslations] = useState<{
    en?: { title: string; description: string };
    ru?: { title: string; description: string };
    de?: { title: string; description: string };
  }>({});

  const property = propertyId
    ? mockProperties.find((p) => p.id === propertyId)
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
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
          bathrooms: property.bathrooms,
          floor: property.floor,
          total_floors: property.total_floors,
          year_built: property.year_built,
        }
      : {
          title: '',
          description: '',
          type: 'apartment',
          status: 'for-sale',
          location_type: 'urban',
          city: 'Бургас',
          neighborhood: '',
          address: '',
          price: 0,
          currency: 'лв',
          area: 0,
          rooms: undefined,
          bathrooms: undefined,
          floor: undefined,
          total_floors: undefined,
          year_built: undefined,
        },
  });

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
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {propertyId ? 'Редактиране на имот' : 'Добавяне на имот'}
            </h1>
            <Button variant="outline" onClick={() => router.back()}>
              <X size={20} /> Отказ
            </Button>
          </div>

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

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Локация</h2>
                  <div className={styles.formRow}>
                    <Input
                      label="Град *"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                    <Input
                      label="Квартал"
                      {...register('neighborhood')}
                      error={errors.neighborhood?.message}
                    />
                  </div>
                  <Input
                    label="Адрес"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Детайли</h2>
                  <div className={styles.formRow}>
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
                      <label className={styles.label}>Тип локация *</label>
                      <select
                        {...register('location_type')}
                        className={styles.select}
                      >
                        <option value="urban">Градски</option>
                        <option value="mountain">Планински</option>
                        <option value="coastal">Морски</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
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
                      label="Стаи"
                      type="number"
                      {...register('rooms', { valueAsNumber: true })}
                      error={errors.rooms?.message}
                    />
                    <Input
                      label="Бани"
                      type="number"
                      {...register('bathrooms', { valueAsNumber: true })}
                      error={errors.bathrooms?.message}
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
                  <Input
                    label="Година на строеж"
                    type="number"
                    {...register('year_built', { valueAsNumber: true })}
                    error={errors.year_built?.message}
                  />
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
                        <Loader2 size={16} className={styles.spinner} />
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
              </div>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                <Save size={20} /> {propertyId ? 'Запази промените' : 'Добави имот'}
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

