'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { AuthModal } from '@/features/auth/components/AuthModal';

// Lazy load ShareModal to reduce initial bundle size
const ShareModal = dynamic(
  () => import('@/components/ui/ShareModal').then((mod) => ({ default: mod.ShareModal })),
  { ssr: false }
);
import { useAuth } from '@/contexts/AuthContext';
import { isFavorite as checkIsFavorite, toggleFavorite, addFavorite, getFavorites } from '@/lib/favorites';
import { Property } from '@/types';
import {
  MapPin,
  Bed,
  Square,
  Calendar,
  ShareNetwork,
  HeartStraight,
  Phone,
  CaretLeft,
  CaretRight,
  X,
  Cube,
  IdentificationBadge,
  Buildings,
  Envelope,
  ChatCircle,
  ChatCircleDots,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from './components/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSubtypeLabel as getSubtypeLabelTranslated } from '@/lib/subtype-mapper';
import { getFloorLabel } from '@/lib/floor-options';
import {
  APARTMENT_FEATURE_FILTERS,
  HOUSE_FEATURES,
  COMMERCIAL_FEATURES,
  BUILDING_PLOTS_FEATURES,
  AGRICULTURAL_FEATURES,
  WAREHOUSES_FEATURES,
  GARAGES_FEATURES,
  HOTELS_FEATURES,
  ESTABLISHMENTS_FEATURES,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
  APARTMENT_SUBTYPES,
  HOUSE_TYPES,
  COMMERCIAL_PROPERTY_TYPES,
  WAREHOUSES_PROPERTY_TYPES,
  HOTELS_PROPERTY_TYPES,
  GARAGES_PROPERTY_TYPES,
  AGRICULTURAL_PROPERTY_TYPES,
  BUILDING_TYPES,
  HOTEL_CATEGORIES,
  HOTEL_CONSTRUCTION_TYPES,
  AGRICULTURAL_CATEGORIES,
  ELECTRICITY_OPTIONS,
  WATER_OPTIONS,
  GARAGE_CONSTRUCTION_TYPES,
  ESTABLISHMENT_CONSTRUCTION_TYPES,
  ESTABLISHMENTS_LOCATION_TYPES,
  RENT_RESTAURANT_FEATURES,
} from '@/features/map-filters/filters/constants';
import { mockProperties as baseProperties } from './mockProperties';
import styles from './PropertyDetailPage.module.scss';

// Extended mock properties with additional details
const mockProperties: Property[] = baseProperties.map((prop) => {
  if (prop.id === '1') {
    return {
      ...prop,
      features: ['elevator', 'parking', 'furnished', 'sea-view', 'security', 'gasified', 'turnkey'],
      construction_type: 'brick',
      completion_status: 'completed',
      images: [
        ...prop.images,
        {
          id: 'img1-2',
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
          public_id: 'prop1-2',
          width: 1200,
          height: 800,
        },
        {
          id: 'img1-3',
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
          public_id: 'prop1-3',
          width: 1200,
          height: 800,
        },
        {
          id: 'img1-4',
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
          public_id: 'prop1-4',
          width: 1200,
          height: 800,
        },
        {
          id: 'img1-5',
          url: 'https://images.unsplash.com/photo-1560448075-cbc16ba4a9fa',
          public_id: 'prop1-5',
          width: 1200,
          height: 800,
        },
      ],
      price_history: [
        { date: '2022-01-15', price: 195000 },
        { date: '2022-06-01', price: 190000 },
        { date: '2023-01-15', price: 185000 },
        { date: '2023-06-01', price: 182000 },
        { date: '2024-01-15', price: 180000 },
      ],
      description: `Този луксозен тристаен апартамент се намира в най-престижния квартал на Бургас, само на няколко минути от плажа. Апартаментът е напълно обзаведен с модерни мебели и техника от висок клас, което го прави готов за настаняване веднага.

Голямата всекидневна с отворена кухня предлага прекрасен изглед към морето и е идеално подходяща за приемане на гости. Кухнята е оборудвана с всички необходими уреди и модерни шкафове, които осигуряват максимално удобство при готвене.

Спалните са просторни и уютни, всяка с собствена баня и гардероб. Главната спалня разполага с голяма тераса с панорамен изглед към морето, което създава усещане за лукс и спокойствие.

Имота разполага с паркомясто в подземен гараж и достъп до всички удобства на сградата, включително фитнес, СПА зона и охрана 24/7. Сградата е изградена с висококачествени материали и отговаря на всички съвременни стандарти за енергийна ефективност.

Местоположението е изключително удобно - близо до плажа, центъра на града, училища, болници и всички необходими услуги. Кварталът е тих и спокоен, идеален за семейства с деца.

Това е идеално място за живеене или инвестиция, тъй като районът се развива бързо и недвижимите имоти тук запазват и увеличават стойността си с времето.`,
    };
  }
  return {
    ...prop,
    features: ['elevator', 'parking'],
    construction_type: 'epk',
    completion_status: 'completed',
    price_history: [
      { date: '2023-01-01', price: prop.price + 10000 },
      { date: '2024-01-01', price: prop.price },
    ],
  };
});

interface PropertyDetailPageProps {
  propertyId: string;
}

export function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
  // Hooks must be called in the same order on every render
  // Call useTranslation at the top, before any conditional logic or early returns
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language || 'bg';
  const { user } = useAuth();

  const [remoteProperty, setRemoteProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/properties/short/${propertyId}`);

        if (!response.ok) {
          if (response.status === 404) {
            if (isMounted) {
              setRemoteProperty(null);
              setError(t('propertyDetail.notFound'));
            }
            return;
          }

          throw new Error(t('propertyDetail.errorLoading'));
        }

        const data: Property = await response.json();
        if (isMounted) {
          setRemoteProperty(data);
        }
      } catch (err) {
        console.error('Error fetching property by id:', err);
        if (isMounted) {
          setError(t('propertyDetail.errorLoading'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  // Check if property is favorited when user state changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && propertyId) {
        const favorited = await checkIsFavorite(propertyId);
        setIsFavorite(favorited);
      } else {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [user, propertyId]);

  // Refresh favorite status when page becomes visible or regains focus
  // This ensures the button updates if favorite was removed in another tab/window
  useEffect(() => {
    if (!user || !propertyId) return;

    const refreshFavoriteStatus = async () => {
      const favorited = await checkIsFavorite(propertyId);
      setIsFavorite(favorited);
    };

    // Check on visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshFavoriteStatus();
      }
    };

    // Check on window focus (switching back to window)
    const handleFocus = () => {
      refreshFavoriteStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, propertyId]);

  // Handle favorite after login (auto-favorite if pending)
  useEffect(() => {
    const handlePendingFavorite = async () => {
      if (user) {
        const pendingFavorite = localStorage.getItem('pendingFavorite');
        if (pendingFavorite === propertyId) {
          const success = await addFavorite(propertyId);
          if (success) {
            setIsFavorite(true);
          }
          localStorage.removeItem('pendingFavorite');
        }
      }
    };

    handlePendingFavorite();
  }, [user, propertyId]);

  const fallbackProperty = useMemo(
    () => mockProperties.find((p) => p.id === propertyId),
    [propertyId]
  );

  const property = useMemo(
    () => remoteProperty ?? fallbackProperty,
    [remoteProperty, fallbackProperty]
  );

  // Basic runtime validation for required property fields
  // For rent hotels, area_sqm can be null (area will be 0), so skip area validation for rent hotels
  const isRentHotel = property?.status === 'for-rent' && property?.type === 'hotel';
  const hasRequiredFields =
    !!property &&
    !!property.title &&
    !!property.description &&
    typeof property.price === 'number' &&
    property.price > 0 &&
    (isRentHotel || (typeof property.area === 'number' && property.area > 0)) &&
    !!property.city &&
    !!property.currency;

  // Keyboard navigation for slideshow
  const imagesLength = property?.images?.length ?? 0;
  useEffect(() => {
    if (!isFullscreen || !property || !property.images || imagesLength <= 1) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, imagesLength, property]);

  if (isLoading && !property) {
    return (
      <div className={styles.propertyPage}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <p>{t('propertyDetail.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if ((!property && !isLoading) || error || (property && !hasRequiredFields)) {
    return (
      <div className={styles.propertyPage}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <p suppressHydrationWarning>
              {error ||
                (property && !hasRequiredFields
                  ? t('propertyDetail.incompleteData')
                  : t('propertyDetail.notFound'))}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.propertyPage}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <p>{t('propertyDetail.notFound')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const day = date.getDate();
    const month = t(`propertyDetail.months.${monthKeys[date.getMonth()]}`);
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleShare = () => {
    // Always show custom share modal with all platform options
    setShowShareModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (property.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + (property.images?.length || 1)) % (property.images?.length || 1)
    );
  };

  // For rent hotels, area can be 0/null, so pricePerSqm will be 0
  // We'll hide it in the UI for rent hotels when it's 0
  const pricePerSqm = property.area > 0 ? Math.round(property.price / property.area) : 0;
  const shouldShowPricePerSqm = !(property.type === 'hotel' && property.status === 'for-rent') || pricePerSqm > 0;

  // Consistent number formatter to avoid hydration mismatch
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Format property ID (prefer short_id) to 3 digits
  const formatPropertyId = (id: string | number | undefined) => {
    if (id === undefined || id === null) return '';
    const numId = typeof id === 'number' ? id : parseInt(id, 10);
    if (!isNaN(numId)) {
      return numId.toString().padStart(3, '0');
    }
    return String(id);
  };

  const getSubtypeLabel = () => {
    if (!property.subtype) {
      return t('propertyDetail.notSpecified');
    }

    // Use the translation function for all property types
    const translated = getSubtypeLabelTranslated(property.subtype, currentLanguage);
    // If translation found (and it's not just the ID itself), use it
    if (translated && translated !== property.subtype && translated !== '') {
      return translated;
    }
    
    // If translation returned empty or the ID itself, try translation keys based on property type
    let translationKey: string | undefined;
    
    switch (property.type) {
      case 'house':
      case 'villa':
        translationKey = `filters.houseTypes.${property.subtype}`;
        break;
      case 'office':
      case 'shop':
        translationKey = `filters.commercialTypes.${property.subtype}`;
        break;
      case 'warehouse':
        translationKey = `filters.warehouseTypes.${property.subtype}`;
        break;
      case 'hotel':
        translationKey = `filters.hotelTypes.${property.subtype}`;
        break;
      case 'garage':
        translationKey = `filters.garageTypes.${property.subtype}`;
        break;
      case 'agricultural':
        translationKey = `filters.agriculturalTypes.${property.subtype}`;
        break;
      case 'restaurant':
        translationKey = `filters.establishmentLocationTypes.${property.subtype}`;
        break;
      case 'apartment':
      default:
        translationKey = `filters.apartmentSubtypes.${property.subtype}`;
        break;
    }
    
    // Try translation key if available
    if (translationKey) {
      const keyTranslated = t(translationKey);
      if (keyTranslated && keyTranslated !== translationKey) {
        return keyTranslated;
      }
    }
    
    // Final fallback to constants
    let options:
      | { id: string; label: string }[]
      | undefined;

    switch (property.type) {
      case 'house':
      case 'villa':
        options = HOUSE_TYPES;
        break;
      case 'office':
      case 'shop':
        options = COMMERCIAL_PROPERTY_TYPES;
        break;
      case 'warehouse':
        options = WAREHOUSES_PROPERTY_TYPES;
        break;
      case 'hotel':
        options = HOTELS_PROPERTY_TYPES;
        break;
      case 'garage':
        options = GARAGES_PROPERTY_TYPES;
        break;
      case 'agricultural':
        options = AGRICULTURAL_PROPERTY_TYPES;
        break;
      case 'restaurant':
        options = ESTABLISHMENTS_LOCATION_TYPES;
        break;
      default:
        options = undefined;
    }

    const match = options?.find((opt) => opt.id === property.subtype);
    return match?.label ?? property.subtype;
  };

  // Get construction type label
  const getConstructionLabel = () => {
    const constructionTypeId = (property as any).construction_type as string | undefined;
    if (!constructionTypeId) return t('propertyDetail.notSpecified');
    
    // For hotels, use hotel-specific construction types
    if (property.type === 'hotel') {
      const hotelTranslationKey = `filters.hotelConstructionTypes.${constructionTypeId}`;
      const hotelTranslated = t(hotelTranslationKey);
      if (hotelTranslated && hotelTranslated !== hotelTranslationKey) {
        return hotelTranslated;
      }
      // Fallback to hotel construction types constant
      const hotelConstruction = HOTEL_CONSTRUCTION_TYPES.find((c) => c.id === constructionTypeId);
      if (hotelConstruction) {
        return hotelConstruction.label;
      }
    }
    
    // For other property types, use standard construction types
    const translationKey = `filters.construction.${constructionTypeId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const construction = CONSTRUCTION_FILTERS.find((c) => c.id === constructionTypeId);
    return construction?.label || t('propertyDetail.notSpecified');
  };

  // Get building type label (Вид сграда)
  const getBuildingTypeLabel = () => {
    const buildingTypeId = (property as any).building_type as string | undefined;
    if (!buildingTypeId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.buildingTypes.${buildingTypeId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const match = BUILDING_TYPES.find((b) => b.id === buildingTypeId);
    return match?.label || t('propertyDetail.notSpecified');
  };

  // Get floor translation
  const getFloorTranslation = (floorId: string | number | undefined | null): string => {
    if (!floorId && floorId !== 0) return '';
    
    let floorIdStr: string;
    
    // Map numeric values to IDs
    if (typeof floorId === 'number') {
      const floorMap: Record<number, string> = {
        [-1]: 'basement',
        [0]: 'ground',
        [1]: 'first-residential',
        [2]: 'not-last',
        [3]: 'last',
        [99]: 'attic',
      };
      floorIdStr = floorMap[floorId] || String(floorId);
    } else {
      floorIdStr = String(floorId);
    }
    
    // Try translation first
    const translationKey = `filters.floor.${floorIdStr}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    
    // Fallback to getFloorLabel if translation not found
    return getFloorLabel(floorIdStr);
  };

  // Get feature translation based on property type
  const getFeatureTranslation = (featureId: string, propertyType: string, propertyStatus?: string): string => {
    // Determine the translation key prefix based on property type
    let translationPrefix: string;
    
    switch (propertyType) {
      case 'house':
      case 'villa':
        translationPrefix = 'filters.houseFeatures';
        break;
      case 'office':
      case 'shop':
        translationPrefix = 'filters.commercialFeatures';
        break;
      case 'warehouse':
        translationPrefix = 'filters.warehouseFeatures';
        break;
      case 'land':
        translationPrefix = 'filters.buildingPlotsFeatures';
        break;
      case 'agricultural':
        translationPrefix = 'filters.agriculturalFeatures';
        break;
      case 'garage':
        translationPrefix = 'filters.garageFeatures';
        break;
      case 'hotel':
        translationPrefix = 'filters.hotelFeatures';
        break;
      case 'restaurant':
        translationPrefix = propertyStatus === 'for-rent' ? 'filters.establishmentFeatures' : 'filters.establishmentFeatures';
        break;
      case 'apartment':
      default:
        // For apartments, check if it's rent mode
        translationPrefix = propertyStatus === 'for-rent' ? 'filters.features' : 'filters.features';
        break;
    }
    
    const translationKey = `${translationPrefix}.${featureId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    
    // Fallback: try generic features for apartments
    if (propertyType === 'apartment') {
      const genericKey = `filters.features.${featureId}`;
      const genericTranslated = t(genericKey);
      if (genericTranslated && genericTranslated !== genericKey) {
        return genericTranslated;
      }
    }
    
    // Final fallback: return the feature ID or find from constants
    return featureId;
  };

  // Get completion status label
  const getCompletionLabel = () => {
    const completionId = (property as any).completion_degree as string | undefined;
    if (!completionId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.completion.${completionId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const completion = COMPLETION_STATUSES.find((c) => c.id === completionId);
    return completion?.label || t('propertyDetail.notSpecified');
  };

  // Get hotel category label
  const getHotelCategoryLabel = () => {
    const categoryId = (property as any).hotel_category as string | undefined;
    if (!categoryId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.hotelCategories.${categoryId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const category = HOTEL_CATEGORIES.find((c) => c.id === categoryId);
    return category?.label || t('propertyDetail.notSpecified');
  };

  // Get agricultural category label
  const getAgriculturalCategoryLabel = () => {
    const categoryId = (property as any).agricultural_category as string | undefined;
    if (!categoryId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.agriculturalCategories.${categoryId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const category = AGRICULTURAL_CATEGORIES.find((c) => c.id === categoryId);
    return category?.label || t('propertyDetail.notSpecified');
  };

  // Get works label (for rent hotels and restaurants)
  const getWorksLabel = () => {
    const works = (property as any).works as string | undefined;
    if (!works) return t('propertyDetail.notSpecified');
    
    const worksMap: Record<string, string> = {
      'seasonal': t('propertyDetail.workingModes.seasonal'),
      'year-round': t('propertyDetail.workingModes.yearRound'),
    };
    
    return worksMap[works] || works;
  };

  // Get electricity label
  const getElectricityLabel = () => {
    const electricityId = (property as any).electricity as string | undefined;
    if (!electricityId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.electricityOptions.${electricityId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const electricity = ELECTRICITY_OPTIONS.find((e) => e.id === electricityId);
    return electricity?.label || t('propertyDetail.notSpecified');
  };

  // Get water label
  const getWaterLabel = () => {
    const waterId = (property as any).water as string | undefined;
    if (!waterId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.waterOptions.${waterId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const water = WATER_OPTIONS.find((w) => w.id === waterId);
    return water?.label || t('propertyDetail.notSpecified');
  };

  // Get garage construction type label
  const getGarageConstructionLabel = () => {
    const constructionTypeId = (property as any).construction_type as string | undefined;
    if (!constructionTypeId) return t('propertyDetail.notSpecified');
    const translationKey = `filters.garageConstructionTypes.${constructionTypeId}`;
    const translated = t(translationKey);
    // If translation exists and is not the same as the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Fallback to constant label if translation not found
    const construction = GARAGE_CONSTRUCTION_TYPES.find((c) => c.id === constructionTypeId);
    return construction?.label || t('propertyDetail.notSpecified');
  };

  // Get establishment construction type label (for restaurants)
  const getEstablishmentConstructionLabel = () => {
    const construction = ESTABLISHMENT_CONSTRUCTION_TYPES.find((c) => c.id === (property as any).construction_type);
    return construction?.label || t('propertyDetail.notSpecified');
  };

  // Get furniture label (for rent apartments and restaurants)
  const getFurnitureLabel = () => {
    const furniture = (property as any).furniture as string | undefined;
    if (!furniture) return t('propertyDetail.notSpecified');
    
    // For restaurants, use different labels
    if (property.type === 'restaurant') {
      const restaurantFurnitureMap: Record<string, string> = {
        'full': t('propertyDetail.furniture.withEquipment'),
        'none': t('propertyDetail.furniture.withoutEquipment'),
      };
      return restaurantFurnitureMap[furniture] || t('propertyDetail.notSpecified');
    }
    
    // For apartments, use standard furniture labels
    const furnitureMap: Record<string, string> = {
      'full': t('propertyDetail.furniture.furnished'),
      'partial': t('propertyDetail.furniture.partiallyFurnished'),
      'none': t('propertyDetail.furniture.unfurnished'),
    };
    
    return furnitureMap[furniture] || t('propertyDetail.notSpecified');
  };


  const handleImageClick = () => {
    if (property.images && property.images.length > 0) {
      setIsFullscreen(true);
    }
  };

  const logoImageUrl = '/Red Logo.jpg'; // Logo from public folder

  // Prepare exactly 5 display slots, filling missing ones with null (logo fallback)
  // First image goes to middle (main), then left column (top to bottom), then right column
  const images = property.images || [];
  const middleSlot = images[0] || null; // First image as main
  const leftSlot1 = images[1] || null; // Second image, left column top
  const leftSlot2 = images[2] || null; // Third image, left column bottom
  const rightSlot1 = images[3] || null; // Fourth image, right column top
  const rightSlot2 = images[4] || null; // Fifth image, right column bottom

  const remainingImagesCount = Math.max(0, (property.images?.length || 0) - 5);
  const activeFullscreenImage = property.images?.[currentImageIndex];

  const handleImageError = (imageId: string) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  return (
    <div className={styles.propertyPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Image Gallery Section - Clickable */}
          <div className={styles.imageSection}>
            {/* Left Column - 2 images stacked */}
            <div className={styles.leftImagesContainer}>
              {[leftSlot1, leftSlot2].map((img, index) => (
                <div
                  key={img?.id ?? `placeholder-left-${index}`}
                  className={styles.sideImage}
                  onClick={handleImageClick}
                >
                  {!img || failedImages.has(img.id) ? (
                    <div className={styles.imagePlaceholder}>
                      <Image
                        src={logoImageUrl}
                        alt="Logo"
                        fill
                        className={styles.logoImage}
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                  ) : (
                    <CloudinaryImage
                      src={img.url}
                      publicId={img.public_id}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 50vw, 20vw"
                      priority={index === 0}
                      onError={() => handleImageError(img.id)}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Middle Column - 1 main image */}
            <div className={styles.mainImageContainer} onClick={handleImageClick}>
              <div className={styles.mainImage}>
                {!middleSlot || failedImages.has(middleSlot.id) ? (
                  <div className={styles.imagePlaceholder}>
                    <Image
                      src={logoImageUrl}
                      alt="Logo"
                      fill
                      className={styles.logoImage}
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                ) : (
                  <CloudinaryImage
                    src={middleSlot.url}
                    publicId={middleSlot.public_id}
                    alt={property.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                    onError={() => handleImageError(middleSlot.id)}
                  />
                )}
              </div>
            </div>
            
            {/* Right Column - 2 images stacked */}
            <div className={styles.rightImagesContainer}>
              {[rightSlot1, rightSlot2].map((img, index) => (
                <div
                  key={img?.id ?? `placeholder-right-${index}`}
                  className={styles.sideImage}
                  onClick={handleImageClick}
                >
                  {!img || failedImages.has(img.id) ? (
                    <div className={styles.imagePlaceholder}>
                      <Image
                        src={logoImageUrl}
                        alt="Logo"
                        fill
                        className={styles.logoImage}
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                  ) : (
                    <CloudinaryImage
                      src={img.url}
                      publicId={img.public_id}
                      alt={`${property.title} - ${index + 4}`}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 50vw, 20vw"
                      onError={() => handleImageError(img.id)}
                    />
                  )}
                  {index === 1 && remainingImagesCount > 0 && (
                    <div className={styles.moreImagesLabel}>
                      <span>{t('propertyDetail.morePhotos', { count: remainingImagesCount })}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Property Title */}
          {property.title && (
            <div className={styles.propertyTitleSection}>
              <h1 className={styles.propertyTitle}>{property.title}</h1>
            </div>
          )}

          {/* Two Column Layout */}
          <div className={styles.contentLayout}>
            {/* Left Column - 66% */}
            <div className={styles.leftColumn}>
              {/* Price and Details Section */}
              <div className={styles.priceDetailsSection}>
                {/* Price Section */}
                <div className={styles.priceSection}>
                  <div className={styles.priceRow}>
                    <div className={styles.priceValue}>{formatNumber(property.price)} {property.currency}</div>
                  </div>
                  {shouldShowPricePerSqm && (
                    <div className={styles.pricePerSqmRow}>
                      <div className={styles.pricePerSqmValue}>{formatNumber(pricePerSqm)} {property.currency}/м²</div>
                    </div>
                  )}
                </div>

                {/* Details Row */}
                <div className={styles.detailsRow}>
                  {/* Subtype - only show for types that have it in schema */}
                  {(property.type !== 'land' && 
                    property.type !== 'replace-real-estates' && 
                    property.type !== 'buy-real-estates' && 
                    property.type !== 'other-real-estates' &&
                    property.subtype) && (
                    <div className={styles.detailBox}>
                      <Bed size={24} />
                      <div className={styles.detailValue}>{getSubtypeLabel()}</div>
                    </div>
                  )}
                  {/* Area - hide for rent hotels (area is 0/null) */}
                  {!(property.type === 'hotel' && property.status === 'for-rent') && (
                    <div className={styles.detailBox}>
                      <Square size={24} />
                      <div className={styles.detailValue}>{property.area} м²</div>
                    </div>
                  )}
                  {/* Yard Area - only show for houses/villas */}
                  {(property.type === 'house' && property.yard_area_sqm) && (
                    <div className={styles.detailBox}>
                      <Square size={24} />
                      <div className={styles.detailValue}>{t('propertyDetail.labels.yard')}: {property.yard_area_sqm} м²</div>
                    </div>
                  )}
                  {/* Floor - only show for apartments, offices, shops, restaurants */}
                  {((property.type === 'apartment' || property.type === 'office' || property.type === 'shop' || property.type === 'restaurant') && property.floor) && (
                    <div className={styles.detailBox}>
                      <Buildings size={24} />
                      <div className={styles.detailValue}>
                        {getFloorTranslation(property.floor)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>{t('propertyDetail.sections.description')}</h2>
                <p className={styles.description}>{property.description}</p>
              </div>

              {/* Features Section */}
              {property.features && property.features.length > 0 && (
                <div className={styles.featuresSection}>
                  <h2 className={styles.sectionTitle}>{t('propertyDetail.sections.features')}</h2>
                  <div className={styles.featuresGrid}>
                    {property.features.map((featureId) => {
                      let source;

                      switch (property.type) {
                        case 'house':
                        case 'villa':
                          source = HOUSE_FEATURES;
                          break;
                        case 'office':
                        case 'shop':
                          source = COMMERCIAL_FEATURES;
                          break;
                        case 'warehouse':
                          source = WAREHOUSES_FEATURES;
                          break;
                        case 'land':
                          source = BUILDING_PLOTS_FEATURES;
                          break;
                        case 'agricultural':
                          source = AGRICULTURAL_FEATURES;
                          break;
                        case 'garage':
                          source = GARAGES_FEATURES;
                          break;
                        case 'hotel':
                          source = HOTELS_FEATURES;
                          break;
                        case 'restaurant':
                          // For rent restaurants, use RENT_RESTAURANT_FEATURES; for sale restaurants, use ESTABLISHMENTS_FEATURES
                          source = property.status === 'for-rent' ? RENT_RESTAURANT_FEATURES : ESTABLISHMENTS_FEATURES;
                          break;
                        default:
                          source = APARTMENT_FEATURE_FILTERS;
                      }

                      const feature = source.find((f) => f.id === featureId);
                      if (!feature) return null;

                      // Get translated feature label
                      const featureLabel = getFeatureTranslation(featureId, property.type, property.status) || feature.label;

                      return (
                        <div key={featureId} className={styles.featureItem}>
                          {feature.icon && <span className={styles.featureIcon}>{feature.icon}</span>}
                          <span className={styles.featureLabel}>{featureLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Construction Details / Additional Details */}
              {(() => {
                const propType = property.type;
                const prop = property as any;

                // For rent offices/shops, hide the construction details section entirely
                const isRentOfficeOrShop =
                  property.status === 'for-rent' &&
                  (propType === 'office' || propType === 'shop');

                if (isRentOfficeOrShop) {
                  return false;
                }

                const hasConstructionDetails =
                  (propType === 'apartment' && (prop.construction_type || prop.completion_degree || property.year_built || (property.status === 'for-rent' && prop.furniture))) ||
                  ((propType === 'office' || propType === 'shop') && (prop.construction_type || prop.completion_degree || property.year_built || property.floor)) ||
                  (propType === 'restaurant' && (
                    (property.status === 'for-sale' && (prop.construction_type || property.year_built || property.floor)) ||
                    (property.status === 'for-rent' && (property.year_built || property.floor || prop.furniture || prop.works))
                  )) ||
                  (propType === 'hotel' && (
                    (property.status === 'for-sale' && (prop.construction_type || prop.completion_degree || prop.hotel_category || prop.bed_base || property.year_built)) ||
                    (property.status === 'for-rent' && (prop.hotel_category || prop.bed_base || property.year_built || prop.works))
                  )) ||
                  (propType === 'garage' && (prop.construction_type || property.year_built)) ||
                  ((propType === 'house' || propType === 'villa') && (property.year_built || property.yard_area_sqm)) ||
                  (propType === 'agricultural' && prop.agricultural_category) ||
                  (propType === 'land' && (prop.electricity || prop.water));

                return hasConstructionDetails;
              }              )() && (
                <div className={styles.constructionSection}>
                  <h2 className={styles.sectionTitle}>
                    {property.type === 'land' 
                      ? t('propertyDetail.sections.additionalParameters')
                      : t('propertyDetail.sections.constructionDetails')}
                  </h2>
                  <div className={styles.constructionGrid}>
                    {/* Building Type (Вид сграда) - for offices, shops (not restaurants) */}
                    {(property.type === 'office' || property.type === 'shop') && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.buildingType')}</span>
                        <span className={styles.constructionValue}>{getBuildingTypeLabel()}</span>
                      </div>
                    )}
                    
                    {/* Construction Type - for apartments, offices, shops, restaurants, and sale hotels (not rent hotels) */}
                    {((property.type === 'apartment' || property.type === 'office' || property.type === 'shop' || property.type === 'restaurant' || (property.type === 'hotel' && property.status === 'for-sale')) && (property as any).construction_type) && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>
                          {property.type === 'apartment' ? t('propertyDetail.labels.constructionType') : 
                           property.type === 'hotel' ? t('propertyDetail.labels.constructionTypeHotel') :
                           property.type === 'restaurant' ? t('propertyDetail.labels.constructionTypeRestaurant') : t('propertyDetail.labels.constructionTypeGeneric')}
                        </span>
                        <span className={styles.constructionValue}>
                          {property.type === 'apartment' ? getConstructionLabel() :
                           property.type === 'restaurant' ? getEstablishmentConstructionLabel() :
                           getConstructionLabel()}
                        </span>
                      </div>
                    )}
                    
                    {/* Garage Construction Type */}
                    {property.type === 'garage' && (property as any).construction_type && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.garageConstructionType')}</span>
                        <span className={styles.constructionValue}>{getGarageConstructionLabel()}</span>
                      </div>
                    )}


                    {/* Completion Status - for apartments (sale only), offices, shops, sale hotels (not restaurants, not rent hotels) */}
                    {(
                      // Apartments: show only for sale mode
                      (property.type === 'apartment' && property.status === 'for-sale') ||
                      // Other supported types: always show when present (except rent hotels and restaurants)
                      property.type === 'office' ||
                      property.type === 'shop' ||
                      (property.type === 'hotel' && property.status === 'for-sale')
                    ) && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.completionStatus')}</span>
                        <span className={styles.constructionValue}>{getCompletionLabel()}</span>
                      </div>
                    )}

                    {/* Furniture - for rent apartments */}
                    {property.type === 'apartment' && property.status === 'for-rent' && (property as any).furniture && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.furnishing')}</span>
                        <span className={styles.constructionValue}>{getFurnitureLabel()}</span>
                      </div>
                    )}

                    {/* Furniture (Оборудване) - for rent restaurants */}
                    {property.type === 'restaurant' && property.status === 'for-rent' && (property as any).furniture && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.equipment')}</span>
                        <span className={styles.constructionValue}>{getFurnitureLabel()}</span>
                      </div>
                    )}

                    {/* Works (Работен режим) - for rent restaurants */}
                    {property.type === 'restaurant' && property.status === 'for-rent' && (property as any).works && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.workingMode')}</span>
                        <span className={styles.constructionValue}>{getWorksLabel()}</span>
                      </div>
                    )}

                    {/* Year Built - for all types that have it (except land and agricultural) */}
                    {property.year_built && property.type !== 'land' && property.type !== 'agricultural' && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.yearBuilt')}</span>
                        <span className={styles.constructionValue}>{property.year_built}</span>
                      </div>
                    )}

                    {/* Yard Area - for houses/villas */}
                    {((property.type === 'house' || property.type === 'villa') && property.yard_area_sqm) && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.yardArea')}</span>
                        <span className={styles.constructionValue}>{property.yard_area_sqm}</span>
                      </div>
                    )}

                    {/* Hotel Category */}
                    {property.type === 'hotel' && (property as any).hotel_category && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.category')}</span>
                        <span className={styles.constructionValue}>{getHotelCategoryLabel()}</span>
                      </div>
                    )}

                    {/* Hotel Bed Base */}
                    {property.type === 'hotel' && (property as any).bed_base && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.bedBase')}</span>
                        <span className={styles.constructionValue}>{(property as any).bed_base}</span>
                      </div>
                    )}

                    {/* Works (Работен режим) - for rent hotels */}
                    {property.type === 'hotel' && property.status === 'for-rent' && (property as any).works && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.workingMode')}</span>
                        <span className={styles.constructionValue}>{getWorksLabel()}</span>
                      </div>
                    )}

                    {/* Agricultural Category */}
                    {property.type === 'agricultural' && (property as any).agricultural_category && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.category')}</span>
                        <span className={styles.constructionValue}>{getAgriculturalCategoryLabel()}</span>
                      </div>
                    )}

                    {/* Land - Electricity */}
                    {property.type === 'land' && (property as any).electricity && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.electricity')}</span>
                        <span className={styles.constructionValue}>{getElectricityLabel()}</span>
                      </div>
                    )}

                    {/* Land - Water */}
                    {property.type === 'land' && (property as any).water && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>{t('propertyDetail.labels.water')}</span>
                        <span className={styles.constructionValue}>{getWaterLabel()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price History Graph */}
              {property.price_history && property.price_history.length > 0 && (
                <div className={styles.priceHistorySection}>
                  <h2 className={styles.sectionTitle}>{t('propertyDetail.sections.priceHistory')}</h2>
                  <div className={styles.priceChart}>
                    <svg className={styles.chartSvg} viewBox="0 0 800 300">
                      <defs>
                        <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#802e2e" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#802e2e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <g className={styles.chartArea}>
                        {property.price_history.map((entry, index) => {
                          const x = (index / (property.price_history!.length - 1)) * 700 + 50;
                          const maxPrice = Math.max(...property.price_history!.map((e) => e.price));
                          const minPrice = Math.min(...property.price_history!.map((e) => e.price));
                          const priceRange = maxPrice - minPrice || 1;
                          const y = 250 - ((entry.price - minPrice) / priceRange) * 200;
                          return (
                            <g key={index}>
                              {index > 0 && (
                                <line
                                  x1={(index - 1) / (property.price_history!.length - 1) * 700 + 50}
                                  y1={250 - ((property.price_history![index - 1].price - minPrice) / priceRange) * 200}
                                  x2={x}
                                  y2={y}
                                  stroke="#802e2e"
                                  strokeWidth="3"
                                />
                              )}
                              <circle cx={x} cy={y} r="6" fill="#802e2e" />
                              <text x={x} y={280} textAnchor="middle" fontSize="12" fill="#666">
                                {new Date(entry.date).getFullYear()}
                              </text>
                              <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#802e2e" fontWeight="bold">
                                {formatNumber(entry.price)}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                </div>
              )}

              {/* Contact Buttons */}
              <div className={styles.contactSection}>
                <h2 className={styles.sectionTitle}>{t('propertyDetail.sections.contactUs')}</h2>
                <div className={styles.contactButtons}>
                  <a
                    href="tel:+359898993030"
                    className={`${styles.contactButton} ${styles.phoneButton}`}
                  >
                    <Phone size={24} weight="fill" />
                    <span>{t('propertyDetail.actions.phone')}</span>
                  </a>
                  <a
                    href="viber://chat?number=+359898993030"
                    className={`${styles.contactButton} ${styles.viberButton}`}
                  >
                    <ChatCircle size={24} weight="fill" />
                    <span>{t('propertyDetail.actions.viber')}</span>
                  </a>
                  <a
                    href="https://wa.me/359898993030"
                    className={`${styles.contactButton} ${styles.whatsappButton}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ChatCircleDots size={24} weight="fill" />
                    <span>{t('propertyDetail.actions.whatsapp')}</span>
                  </a>
                  <a
                    href="mailto:brokerbulgaria1@abv.bg"
                    className={`${styles.contactButton} ${styles.emailButton}`}
                  >
                    <Envelope size={24} weight="fill" />
                    <span>{t('propertyDetail.actions.email')}</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column - 33% */}
            <div className={styles.rightColumn}>
              <div className={styles.rightCard}>
                {/* Property ID and Publication Date */}
                <div className={styles.infoItem}>
                  <div className={styles.infoText}>
                    <IdentificationBadge size={24} />
                    <span>ID: {formatPropertyId(property.short_id ?? property.id)}</span>
                  </div>
                  <div className={styles.infoText}>
                    <Calendar size={24} />
                    <span>{property.created_at ? formatDate(property.created_at) : t('propertyDetail.notSpecified')}</span>
                  </div>
                </div>

                {/* Location */}
                <div className={styles.locationSection}>
                  <div className={styles.locationRow}>
                    <div className={styles.locationItem}>
                      <MapPin size={20} />
                      <span className={styles.locationText}>{property.city}</span>
                    </div>
                    {property.neighborhood && (
                      <div className={styles.locationItem}>
                        <Cube size={20} />
                        <span className={styles.locationText}>{property.neighborhood}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <Button
                    variant={isFavorite ? 'primary' : 'outline'}
                    size="md"
                    onClick={async () => {
                      if (isTogglingFavorite) return;
                      
                      if (!user) {
                        localStorage.setItem('pendingFavorite', propertyId);
                        setAuthModalOpen(true);
                        return;
                      }
                      
                      setIsTogglingFavorite(true);
                      const success = await toggleFavorite(propertyId);
                      if (success) {
                        // Refresh from database to ensure accuracy
                        const currentStatus = await checkIsFavorite(propertyId);
                        setIsFavorite(currentStatus);
                      }
                      setIsTogglingFavorite(false);
                    }}
                    className={styles.actionButton}
                    disabled={isTogglingFavorite}
                  >
                    <HeartStraight 
                      size={20} 
                      weight={isFavorite ? 'fill' : 'regular'} 
                      fill={isFavorite ? 'currentColor' : 'none'}
                      className={isFavorite ? '' : styles.outlinedHeart}
                      style={!isFavorite ? { color: '#802e2e', stroke: '#802e2e', strokeWidth: '2.5', fill: 'none' } : undefined}
                    />
                    <span>{isFavorite ? t('propertyDetail.actions.saved') : t('propertyDetail.actions.save')}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md" 
                    onClick={handleShare}
                    className={styles.actionButton}
                  >
                    <ShareNetwork size={18} />
                    {t('propertyDetail.actions.share')}
                  </Button>
                </div>

                {/* Broker Info */}
                {(property.broker_name || property.broker_phone || property.broker_position) && (
                  <div className={styles.brokerSection}>
                    <div className={styles.brokerImage}>
                      <Image
                        src={property.broker_image || '/Red Logo.jpg'}
                        alt={property.broker_name || t('propertyDetail.actions.broker')}
                        fill
                        className={styles.brokerAvatar}
                        sizes="100px"
                      />
                    </div>
                    <div className={styles.brokerDetails}>
                      {property.broker_name && (
                        <div className={styles.brokerName}>{property.broker_name}</div>
                      )}
                      {property.broker_position && (
                        <div className={styles.brokerTitle}>
                          {property.broker_position}
                        </div>
                      )}
                      {property.broker_phone && (
                        <a href={`tel:${property.broker_phone}`} className={styles.brokerContact}>
                          <Phone size={18} />
                          <span>{property.broker_phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Fullscreen Slideshow */}
      <AnimatePresence>
        {isFullscreen && property.images && property.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.fullscreenModal}
            onClick={() => setIsFullscreen(false)}
          >
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
            >
              <X size={32} />
            </button>
            <div className={styles.fullscreenImageContainer} onClick={(e) => e.stopPropagation()}>
              {activeFullscreenImage && (
                <CloudinaryImage
                  src={activeFullscreenImage.url}
                  publicId={activeFullscreenImage.public_id}
                  alt={`${property.title} - ${currentImageIndex + 1}`}
                  fill
                  className={styles.fullscreenImage}
                  sizes="100vw"
                />
              )}
              {property.images.length > 1 && (
                <>
                  <button
                    className={styles.fullscreenNavButton}
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <CaretLeft size={32} />
                  </button>
                  <button
                    className={`${styles.fullscreenNavButton} ${styles.next}`}
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <CaretRight size={32} />
                  </button>
                  <div className={styles.fullscreenCounter}>
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={property.title}
          description={`${formatNumber(property.price)} ${property.currency} | ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ''}`}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />
    </div>
  );
}
  