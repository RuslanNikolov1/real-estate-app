'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
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
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from './components/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';
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
  AGRICULTURAL_CATEGORIES,
  ELECTRICITY_OPTIONS,
  WATER_OPTIONS,
  GARAGE_CONSTRUCTION_TYPES,
  ESTABLISHMENT_CONSTRUCTION_TYPES,
} from '@/features/map-filters/filters/constants';
import { mockProperties as baseProperties } from './PropertiesListPage';
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
  const [remoteProperty, setRemoteProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

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
              setError('Имотът не е намерен.');
            }
            return;
          }

          throw new Error('Грешка при зареждането на имота');
        }

        const data: Property = await response.json();
        if (isMounted) {
          setRemoteProperty(data);
        }
      } catch (err) {
        console.error('Error fetching property by id:', err);
        if (isMounted) {
          setError('Грешка при зареждането на имота.');
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

  const fallbackProperty = useMemo(
    () => mockProperties.find((p) => p.id === propertyId),
    [propertyId]
  );

  const property = useMemo(
    () => remoteProperty ?? fallbackProperty,
    [remoteProperty, fallbackProperty]
  );

  // Basic runtime validation for required property fields
  const hasRequiredFields =
    !!property &&
    !!property.title &&
    !!property.description &&
    typeof property.price === 'number' &&
    property.price > 0 &&
    typeof property.area === 'number' &&
    property.area > 0 &&
    !!property.city &&
    !!property.currency;

  const recommendedProperties = useMemo(() => {
    const filtered = mockProperties.filter(
      (p) => p.id !== propertyId && p.status === 'for-sale' && p.type === 'apartment',
    );

    // If we don't have enough, add some mock properties
    if (filtered.length < 4) {
      const additionalProperties: Property[] = [
        {
          id: 'rec1',
          title: 'Модерен апартамент в квартал Изгрев',
          description: 'Двустаен апартамент с балкон и изглед към града.',
          type: 'apartment',
          status: 'for-sale',
          city: 'Бургас',
          neighborhood: 'Изгрев',
          price: 145000,
          currency: 'лв',
          area: 75,
          rooms: 2,
          bathrooms: 1,
          floor: 4,
          total_floors: 6,
          images: [
            {
              id: 'rec1-img',
              url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
              public_id: 'rec1-1',
              width: 1200,
              height: 800,
              is_primary: true,
            },
          ],
          view_count: 156,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
        },
        {
          id: 'rec2',
          title: 'Апартамент с изглед към морето',
          description: 'Тристаен апартамент на първа линия море.',
          type: 'apartment',
          status: 'for-sale',
          city: 'Бургас',
          neighborhood: 'Морска градина',
          price: 220000,
          currency: 'лв',
          area: 110,
          rooms: 3,
          bathrooms: 2,
          floor: 2,
          total_floors: 5,
          images: [
            {
              id: 'rec2-img',
              url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
              public_id: 'rec2-1',
              width: 1200,
              height: 800,
              is_primary: true,
            },
          ],
          view_count: 234,
          created_at: '2024-01-12T10:00:00Z',
          updated_at: '2024-01-12T10:00:00Z',
        },
        {
          id: 'rec3',
          title: 'Нов апартамент в тих квартал',
          description: 'Едностаен апартамент в нова сграда.',
          type: 'apartment',
          status: 'for-sale',
          city: 'Бургас',
          neighborhood: 'Лазур',
          price: 95000,
          currency: 'лв',
          area: 55,
          rooms: 1,
          bathrooms: 1,
          floor: 1,
          total_floors: 4,
          images: [
            {
              id: 'rec3-img',
              url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
              public_id: 'rec3-1',
              width: 1200,
              height: 800,
              is_primary: true,
            },
          ],
          view_count: 98,
          created_at: '2024-01-14T10:00:00Z',
          updated_at: '2024-01-14T10:00:00Z',
        },
        {
          id: 'rec4',
          title: 'Луксозен пентхаус с тераса',
          description: 'Голям апартамент на последен етаж с голяма тераса.',
          type: 'apartment',
          status: 'for-sale',
          city: 'Бургас',
          neighborhood: 'Център',
          price: 280000,
          currency: 'лв',
          area: 130,
          rooms: 4,
          bathrooms: 3,
          floor: 8,
          total_floors: 8,
          images: [
            {
              id: 'rec4-img',
              url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
              public_id: 'rec4-1',
              width: 1200,
              height: 800,
              is_primary: true,
            },
          ],
          view_count: 412,
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ];

      return [...filtered, ...additionalProperties].slice(0, 4);
    }

    return filtered.slice(0, 4);
  }, [propertyId]);

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
            <p>Зареждане...</p>
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
            <p>
              {error ||
                (property && !hasRequiredFields
                  ? 'Имотът има непълни задължителни данни.'
                  : 'Имотът не е намерен.')}
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
            <p>Имотът не е намерен.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'януари', 'февруари', 'март', 'април', 'май', 'юни',
      'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleShare = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    // Use current window location for sharing (already correct for localhost or production)
    const shareUrl = currentUrl;
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Линкът е копиран в клипборда!');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (property.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + (property.images?.length || 1)) % (property.images?.length || 1)
    );
  };

  const pricePerSqm = property.area > 0 ? Math.round(property.price / property.area) : 0;

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
    if (!property.subtype) return 'Не е посочено';

    let options:
      | { id: string; label: string }[]
      | undefined;

    switch (property.type) {
      case 'apartment':
        options = APARTMENT_SUBTYPES;
        break;
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
      default:
        options = undefined;
    }

    const match = options?.find((opt) => opt.id === property.subtype);
    return match?.label ?? property.subtype;
  };

  // Get construction type label
  const getConstructionLabel = () => {
    const construction = CONSTRUCTION_FILTERS.find((c) => c.id === (property as any).construction_type);
    return construction?.label || 'Не е посочено';
  };

  // Get completion status label
  const getCompletionLabel = () => {
    const completion = COMPLETION_STATUSES.find((c) => c.id === (property as any).completion_degree);
    return completion?.label || 'Не е посочено';
  };

  // Get hotel category label
  const getHotelCategoryLabel = () => {
    const category = HOTEL_CATEGORIES.find((c) => c.id === (property as any).hotel_category);
    return category?.label || 'Не е посочено';
  };

  // Get agricultural category label
  const getAgriculturalCategoryLabel = () => {
    const category = AGRICULTURAL_CATEGORIES.find((c) => c.id === (property as any).agricultural_category);
    return category?.label || 'Не е посочено';
  };

  // Get electricity label
  const getElectricityLabel = () => {
    const electricity = ELECTRICITY_OPTIONS.find((e) => e.id === (property as any).electricity);
    return electricity?.label || 'Не е посочено';
  };

  // Get water label
  const getWaterLabel = () => {
    const water = WATER_OPTIONS.find((w) => w.id === (property as any).water);
    return water?.label || 'Не е посочено';
  };

  // Get garage construction type label
  const getGarageConstructionLabel = () => {
    const construction = GARAGE_CONSTRUCTION_TYPES.find((c) => c.id === (property as any).construction_type);
    return construction?.label || 'Не е посочено';
  };

  // Get establishment construction type label (for restaurants)
  const getEstablishmentConstructionLabel = () => {
    const construction = ESTABLISHMENT_CONSTRUCTION_TYPES.find((c) => c.id === (property as any).construction_type);
    return construction?.label || 'Не е посочено';
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Заявката е изпратена успешно!');
    setInquiryForm({ name: '', email: '', phone: '', message: '' });
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
                      <span>Още {remainingImagesCount} снимки</span>
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
                  <div className={styles.pricePerSqmRow}>
                    <div className={styles.pricePerSqmValue}>{formatNumber(pricePerSqm)} {property.currency}/м²</div>
                  </div>
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
                  <div className={styles.detailBox}>
                    <Square size={24} />
                    <div className={styles.detailValue}>{property.area} м²</div>
                  </div>
                  {/* Floor - only show for apartments, offices, shops, restaurants */}
                  {((property.type === 'apartment' || property.type === 'office' || property.type === 'shop' || property.type === 'restaurant') && property.floor) && (
                    <div className={styles.detailBox}>
                      <Buildings size={24} />
                      <div className={styles.detailValue}>
                        {property.total_floors ? `${property.floor}/${property.total_floors} етаж` : `${property.floor} етаж`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Описание</h2>
                <p className={styles.description}>{property.description}</p>
              </div>

              {/* Features Section */}
              {property.features && property.features.length > 0 && (
                <div className={styles.featuresSection}>
                  <h2 className={styles.sectionTitle}>Особености</h2>
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
                          source = ESTABLISHMENTS_FEATURES;
                          break;
                        default:
                          source = APARTMENT_FEATURE_FILTERS;
                      }

                      const feature = source.find((f) => f.id === featureId);
                      if (!feature) return null;

                      return (
                        <div key={featureId} className={styles.featureItem}>
                          {feature.icon && <span className={styles.featureIcon}>{feature.icon}</span>}
                          <span className={styles.featureLabel}>{feature.label}</span>
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
                const hasConstructionDetails = 
                  (propType === 'apartment' && (prop.construction_type || prop.completion_degree || property.year_built)) ||
                  ((propType === 'office' || propType === 'shop' || propType === 'restaurant') && (prop.construction_type || prop.completion_degree || property.year_built || property.floor)) ||
                  (propType === 'hotel' && (prop.construction_type || prop.completion_degree || prop.hotel_category || prop.bed_base || property.year_built)) ||
                  (propType === 'garage' && (prop.construction_type || property.year_built)) ||
                  ((propType === 'house' || propType === 'villa') && (property.year_built || prop.yard_area)) ||
                  (propType === 'agricultural' && prop.agricultural_category) ||
                  (propType === 'land' && (prop.electricity || prop.water));
                return hasConstructionDetails;
              })() && (
                <div className={styles.constructionSection}>
                  <h2 className={styles.sectionTitle}>
                    {property.type === 'land' || property.type === 'agricultural' 
                      ? 'Допълнителни параметри' 
                      : 'Детайли за строителството'}
                  </h2>
                  <div className={styles.constructionGrid}>
                    {/* Construction Type - for apartments, offices, shops, hotels, restaurants */}
                    {((property.type === 'apartment' || property.type === 'office' || property.type === 'shop' || property.type === 'hotel' || property.type === 'restaurant') && (property as any).construction_type) && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>
                          {property.type === 'apartment' ? 'Вид строителство' : 
                           property.type === 'hotel' ? 'Тип строителство' :
                           property.type === 'restaurant' ? 'Тип строителство' : 'Тип строителство'}
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
                        <span className={styles.constructionLabel}>Вид конструкция</span>
                        <span className={styles.constructionValue}>{getGarageConstructionLabel()}</span>
                      </div>
                    )}


                    {/* Completion Status - for apartments, offices, shops, hotels, restaurants */}
                    {(property.type === 'apartment' || property.type === 'office' || property.type === 'shop' || property.type === 'hotel' || property.type === 'restaurant') && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Степен на завършеност</span>
                        <span className={styles.constructionValue}>{getCompletionLabel()}</span>
                      </div>
                    )}

                    {/* Year Built - for all types that have it */}
                    {property.year_built && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Година на строителство</span>
                        <span className={styles.constructionValue}>{property.year_built}</span>
                      </div>
                    )}

                    {/* Yard Area - for houses/villas */}
                    {((property.type === 'house' || property.type === 'villa') && (property as any).yard_area) && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Площ на двора (м²)</span>
                        <span className={styles.constructionValue}>{(property as any).yard_area}</span>
                      </div>
                    )}

                    {/* Hotel Category */}
                    {property.type === 'hotel' && (property as any).hotel_category && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Категория</span>
                        <span className={styles.constructionValue}>{getHotelCategoryLabel()}</span>
                      </div>
                    )}

                    {/* Hotel Bed Base */}
                    {property.type === 'hotel' && (property as any).bed_base && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Леглова база</span>
                        <span className={styles.constructionValue}>{(property as any).bed_base}</span>
                      </div>
                    )}

                    {/* Agricultural Category */}
                    {property.type === 'agricultural' && (property as any).agricultural_category && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Категория</span>
                        <span className={styles.constructionValue}>{getAgriculturalCategoryLabel()}</span>
                      </div>
                    )}

                    {/* Land - Electricity */}
                    {property.type === 'land' && (property as any).electricity && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Ток</span>
                        <span className={styles.constructionValue}>{getElectricityLabel()}</span>
                      </div>
                    )}

                    {/* Land - Water */}
                    {property.type === 'land' && (property as any).water && (
                      <div className={styles.constructionItem}>
                        <span className={styles.constructionLabel}>Вода</span>
                        <span className={styles.constructionValue}>{getWaterLabel()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price History Graph */}
              {property.price_history && property.price_history.length > 0 && (
                <div className={styles.priceHistorySection}>
                  <h2 className={styles.sectionTitle}>История на цената</h2>
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

              {/* Inquiry Form */}
              <div className={styles.inquirySection}>
                <h2 className={styles.sectionTitle}>Запитване</h2>
                <form onSubmit={handleInquirySubmit} className={styles.inquiryForm}>
                  <div className={styles.formRow}>
                    <Input
                      type="text"
                      placeholder="Вашето име"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Вашият имейл"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Вашият телефон"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <textarea
                    className={styles.messageTextarea}
                    placeholder="Вашето съобщение"
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    rows={5}
                    required
                  />
                  <Button type="submit" variant="primary">
                    Изпрати запитване
                  </Button>
                </form>
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
                    <span>{formatDate(property.created_at)}</span>
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
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={styles.actionButton}
                  >
                    <HeartStraight 
                      size={20} 
                      weight={isFavorite ? 'fill' : 'regular'} 
                      fill={isFavorite ? 'currentColor' : 'none'}
                      className={isFavorite ? '' : styles.outlinedHeart}
                      style={!isFavorite ? { color: '#802e2e', stroke: '#802e2e', strokeWidth: '2.5', fill: 'none' } : undefined}
                    />
                    <span>{isFavorite ? 'Запазено' : 'Запази'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md" 
                    onClick={handleShare}
                    className={styles.actionButton}
                  >
                    <ShareNetwork size={18} />
                    Сподели
                  </Button>
                </div>

                {/* Broker Info */}
                {(property.broker_name || property.broker_phone || property.broker_position) && (
                  <div className={styles.brokerSection}>
                    <div className={styles.brokerImage}>
                      <Image
                        src={property.broker_image || '/Red Logo.jpg'}
                        alt={property.broker_name || 'Брокер'}
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

          {/* Recommended Properties */}
          {recommendedProperties.length > 0 && (
            <div className={styles.recommendedSection}>
              <h2 className={styles.sectionTitle}>Препоръчани имоти</h2>
              <div className={styles.recommendedRow}>
                {recommendedProperties.map((prop) => {
                  const primaryImage = prop.images?.find((img) => img.is_primary) || prop.images?.[0];
                  return (
                    <div key={prop.id} className={styles.recommendedCard}>
                      <div className={styles.recommendedImage}>
                        {primaryImage ? (
                          <CloudinaryImage
                            src={primaryImage.url}
                            publicId={primaryImage.public_id}
                            alt={prop.title}
                            fill
                            className={styles.recommendedImageContent}
                            sizes="(max-width: 768px) 50vw, 20vw"
                          />
                        ) : (
                          <div className={styles.recommendedPlaceholder}>Няма снимка</div>
                        )}
                      </div>
                      <div className={styles.recommendedDetails}>
                        <div className={styles.recommendedPrice}>
                          {formatNumber(prop.price)} {prop.currency}
                        </div>
                        <div className={styles.recommendedLocation}>
                          {prop.city}
                          {prop.neighborhood && `, ${prop.neighborhood}`}
                        </div>
                        <div className={styles.recommendedDivider}></div>
                        <div className={styles.recommendedInfo}>
                          {prop.rooms && <span>{prop.rooms} стаи</span>}
                          {prop.rooms && prop.area && <span> • </span>}
                          <span>{prop.area} м²</span>
                          {prop.floor && <span> • {prop.floor}/{prop.total_floors}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
    </div>
  );
}
  