'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MapPin, Square } from '@phosphor-icons/react';
import { Property } from '@/types';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { getSubtypeLabel } from '@/lib/subtype-mapper';
import { useTranslation } from 'react-i18next';
import { CONSTRUCTION_FILTERS, COMPLETION_STATUSES, BUILDING_TYPES } from '@/features/map-filters/filters/constants';
import { HOTEL_CATEGORIES, AGRICULTURAL_CATEGORIES, ELECTRICITY_OPTIONS, WATER_OPTIONS } from '@/features/map-filters/filters/constants';
import styles from './PendingPropertyCard.module.scss';

// Property type labels in Bulgarian
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Апартамент',
  house: 'Къща',
  villa: 'Вила',
  office: 'Офис',
  shop: 'Магазин',
  warehouse: 'Склад',
  land: 'Парцел',
  hotel: 'Хотел',
  garage: 'Гараж',
  restaurant: 'Ресторант',
  agricultural: 'Земеделска земя',
  'replace-real-estates': 'Замяна на недвижими имоти',
  'buy-real-estates': 'Купуване на недвижими имоти',
  'other-real-estates': 'Други недвижими имоти',
};

interface PendingPropertyCardProps {
  property: Property;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingPropertyCard({
  property,
  onApprove,
  onReject,
}: PendingPropertyCardProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'bg';

  const images = property.images || [];

  // Format number consistently
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Translate property type to Bulgarian
  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPE_LABELS[type] || type;
  };

  // Translate construction type to Bulgarian
  const getConstructionTypeLabel = (constructionType?: string) => {
    if (!constructionType) return '';
    const translationKey = `filters.construction.${constructionType}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const construction = CONSTRUCTION_FILTERS.find((c) => c.id === constructionType);
    return construction?.label || constructionType;
  };

  // Translate completion degree to Bulgarian
  const getCompletionDegreeLabel = (completionDegree?: string) => {
    if (!completionDegree) return '';
    const translationKey = `filters.completion.${completionDegree}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const completion = COMPLETION_STATUSES.find((c) => c.id === completionDegree);
    return completion?.label || completionDegree;
  };

  // Translate building type to Bulgarian
  const getBuildingTypeLabel = (buildingType?: string) => {
    if (!buildingType) return '';
    const translationKey = `filters.buildingTypes.${buildingType}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const building = BUILDING_TYPES.find((b) => b.id === buildingType);
    return building?.label || buildingType;
  };

  // Translate furniture to Bulgarian
  const getFurnitureLabel = (furniture?: string) => {
    if (!furniture) return '';
    
    // For restaurants, use different labels
    if (property.type === 'restaurant') {
      const restaurantFurnitureMap: Record<string, string> = {
        'full': t('propertyDetail.furniture.withEquipment'),
        'none': t('propertyDetail.furniture.withoutEquipment'),
      };
      return restaurantFurnitureMap[furniture] || furniture;
    }
    
    // For apartments and other types, use standard furniture labels
    const furnitureMap: Record<string, string> = {
      'full': t('propertyDetail.furniture.furnished'),
      'partial': t('propertyDetail.furniture.partiallyFurnished'),
      'none': t('propertyDetail.furniture.unfurnished'),
    };
    
    return furnitureMap[furniture] || furniture;
  };

  // Translate hotel category to Bulgarian
  const getHotelCategoryLabel = (category?: string) => {
    if (!category) return '';
    const translationKey = `filters.hotelCategories.${category}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const hotelCategory = HOTEL_CATEGORIES.find((c) => c.id === category);
    return hotelCategory?.label || category;
  };

  // Translate agricultural category to Bulgarian
  const getAgriculturalCategoryLabel = (category?: string) => {
    if (!category) return '';
    const translationKey = `filters.agriculturalCategories.${category}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const agriculturalCategory = AGRICULTURAL_CATEGORIES.find((c) => c.id === category);
    return agriculturalCategory?.label || category;
  };

  // Translate electricity to Bulgarian
  const getElectricityLabel = (electricity?: string) => {
    if (!electricity) return '';
    const translationKey = `filters.electricityOptions.${electricity}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const electricityOption = ELECTRICITY_OPTIONS.find((e) => e.id === electricity);
    return electricityOption?.label || electricity;
  };

  // Translate water to Bulgarian
  const getWaterLabel = (water?: string) => {
    if (!water) return '';
    const translationKey = `filters.waterOptions.${water}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    const waterOption = WATER_OPTIONS.find((w) => w.id === water);
    return waterOption?.label || water;
  };

  // Translate works to Bulgarian
  const getWorksLabel = (works?: string) => {
    if (!works) return '';
    const worksMap: Record<string, string> = {
      'seasonal': t('propertyDetail.workingModes.seasonal'),
      'year-round': t('propertyDetail.workingModes.yearRound'),
    };
    return worksMap[works] || works;
  };

  // Check if value exists and is not empty
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0 || value === 0;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.card}
    >
      <div className={styles.imagesSection}>
        {images.length > 0 ? (
          <div className={styles.imagesGrid}>
            {images.map((image, index) => (
              <div key={image.id || index} className={styles.imageWrapper}>
                <CloudinaryImage
                  src={image.url}
                  publicId={image.public_id}
                  alt={`${property.title} - снимка ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className={styles.image}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.imageContainer}>
            <div className={styles.placeholder}>Няма снимка</div>
          </div>
        )}
        <div className={styles.badge}>
          {property.status === 'for-sale' ? 'За продажба' : 'Под наем'}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{property.title}</h3>
        
        <div className={styles.location}>
          <MapPin size={18} />
          <span>
            {property.city}
            {property.neighborhood && `, ${property.neighborhood}`}
          </span>
        </div>

        <div className={styles.price}>
          {formatNumber(property.price)} {property.currency}
          {property.status === 'for-rent' && <span>/месец</span>}
        </div>

        <div className={styles.details}>
          {property.area > 0 && (
            <div className={styles.detail}>
              <Square size={18} />
              <span>{property.area} м²</span>
            </div>
          )}
          {property.subtype && (
            <div className={styles.detail}>
              <span>{getSubtypeLabel(property.subtype, currentLanguage)}</span>
            </div>
          )}
          {property.floor && (
            <div className={styles.detail}>
              <span>Етаж: {property.floor}</span>
            </div>
          )}
          {property.yard_area_sqm && (
            <div className={styles.detail}>
              <Square size={18} />
              <span>Двор: {property.yard_area_sqm} м²</span>
            </div>
          )}
        </div>

        {property.description && (
          <div className={styles.description}>
            <p>{property.description}</p>
          </div>
        )}

        {property.broker_name && (
          <div className={styles.broker}>
            <strong>Брокер:</strong> {property.broker_name}
            {property.broker_phone && ` • ${property.broker_phone}`}
            {property.broker_position && ` • ${property.broker_position}`}
          </div>
        )}

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <strong>Тип:</strong> {getPropertyTypeLabel(property.type)}
          </div>
          {hasValue(property.subtype) && (
            <div className={styles.metaItem}>
              <strong>Подтип:</strong> {getSubtypeLabel(property.subtype!, currentLanguage)}
            </div>
          )}
          {hasValue(property.rooms) && (
            <div className={styles.metaItem}>
              <strong>Стаи:</strong> {property.rooms}
            </div>
          )}
          {hasValue(property.bathrooms) && (
            <div className={styles.metaItem}>
              <strong>Бани:</strong> {property.bathrooms}
            </div>
          )}
          {hasValue(property.total_floors) && (
            <div className={styles.metaItem}>
              <strong>Общо етажи:</strong> {property.total_floors}
            </div>
          )}
          {hasValue(property.year_built) && (
            <div className={styles.metaItem}>
              <strong>Година на строителство:</strong> {property.year_built}
            </div>
          )}
          {hasValue(property.construction_type) && (
            <div className={styles.metaItem}>
              <strong>Строителство:</strong> {getConstructionTypeLabel(property.construction_type)}
            </div>
          )}
          {hasValue(property.completion_degree) && (
            <div className={styles.metaItem}>
              <strong>Завършеност:</strong> {getCompletionDegreeLabel(property.completion_degree)}
            </div>
          )}
          {hasValue(property.building_type) && (
            <div className={styles.metaItem}>
              <strong>Сграда:</strong> {getBuildingTypeLabel(property.building_type)}
            </div>
          )}
          {hasValue(property.furniture) && (
            <div className={styles.metaItem}>
              <strong>Обзавеждане:</strong> {getFurnitureLabel(property.furniture)}
            </div>
          )}
          {hasValue(property.electricity) && (
            <div className={styles.metaItem}>
              <strong>Ток:</strong> {getElectricityLabel(property.electricity)}
            </div>
          )}
          {hasValue(property.water) && (
            <div className={styles.metaItem}>
              <strong>Вода:</strong> {getWaterLabel(property.water)}
            </div>
          )}
          {hasValue(property.hotel_category) && (
            <div className={styles.metaItem}>
              <strong>Категория хотел:</strong> {getHotelCategoryLabel(property.hotel_category)}
            </div>
          )}
          {hasValue(property.agricultural_category) && (
            <div className={styles.metaItem}>
              <strong>Категория земя:</strong> {getAgriculturalCategoryLabel(property.agricultural_category)}
            </div>
          )}
          {hasValue(property.bed_base) && (
            <div className={styles.metaItem}>
              <strong>Леглова база:</strong> {property.bed_base}
            </div>
          )}
          {hasValue(property.works) && (
            <div className={styles.metaItem}>
              <strong>Работен режим:</strong> {getWorksLabel(property.works)}
            </div>
          )}
          {hasValue((property as any).heating) && (
            <div className={styles.metaItem}>
              <strong>Отопление:</strong> {(property as any).heating}
            </div>
          )}
          {hasValue((property as any).has_elevator) && (
            <div className={styles.metaItem}>
              <strong>Асансьор:</strong> {(property as any).has_elevator ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_condominium) && (
            <div className={styles.metaItem}>
              <strong>Кондо:</strong> {(property as any).has_condominium ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_wiring) && (
            <div className={styles.metaItem}>
              <strong>Кабелна мрежа:</strong> {(property as any).has_wiring ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_access_control) && (
            <div className={styles.metaItem}>
              <strong>Контрол на достъп:</strong> {(property as any).has_access_control ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_garage) && (
            <div className={styles.metaItem}>
              <strong>Гараж:</strong> {(property as any).has_garage ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).is_luxury) && (
            <div className={styles.metaItem}>
              <strong>Луксозен:</strong> {(property as any).is_luxury ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_air_conditioning) && (
            <div className={styles.metaItem}>
              <strong>Климатизация:</strong> {(property as any).has_air_conditioning ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).has_video_surveillance) && (
            <div className={styles.metaItem}>
              <strong>Видеонаблюдение:</strong> {(property as any).has_video_surveillance ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue((property as any).is_renovated) && (
            <div className={styles.metaItem}>
              <strong>Реновиран:</strong> {(property as any).is_renovated ? 'Да' : 'Не'}
            </div>
          )}
          {hasValue(property.features) && (
            <div className={styles.metaItem}>
              <strong>Допълнително:</strong> {property.features!.join(', ')}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.approveButton}
            onClick={onApprove}
            aria-label="Одобри имот"
            title="Одобри имот"
          >
            <CheckCircle size={48} weight="fill" />
            <span>Одобри</span>
          </button>
          <button
            type="button"
            className={styles.rejectButton}
            onClick={onReject}
            aria-label="Отхвърли имот"
            title="Отхвърли имот"
          >
            <XCircle size={48} weight="fill" />
            <span>Отхвърли</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
