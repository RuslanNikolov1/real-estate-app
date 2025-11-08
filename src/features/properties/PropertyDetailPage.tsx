'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Property } from '@/types';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Share2,
  Heart,
  Bell,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Play,
  Home,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from './components/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PropertyDetailPage.module.scss';

// Import mock properties from list page
import { mockProperties as baseProperties } from './PropertiesListPage';

// Mock data - разширени имоти с допълнителни детайли
// Използваме базовите имоти и добавяме допълнителни детайли
const mockProperties: Property[] = baseProperties.map((prop) => {
  // Добавя допълнителни детайли според ID
  if (prop.id === '1') {
    return {
      ...prop,
      furnishing_level: 'furnished',
      heating: 'central',
      has_elevator: true,
      has_condominium: true,
      has_wiring: true,
      has_access_control: true,
      has_garage: true,
      is_luxury: true,
      has_air_conditioning: true,
      has_video_surveillance: true,
      is_renovated: true,
      nearby_amenities: [
        'Плаж - 200м',
        'Супермаркет - 100м',
        'Училище - 500м',
        'Болница - 1км',
        'Парк - 300м',
      ],
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
      ],
      floor_plan_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
      video_url: 'https://example.com/video.mp4',
      price_history: [
        { date: '2024-01-15', price: 185000 },
        { date: '2024-02-01', price: 182000 },
        { date: '2024-03-01', price: 180000 },
      ],
    };
  }
  // Добавя основни детайли за останалите имоти
  return {
    ...prop,
    furnishing_level: prop.type === 'apartment' ? 'furnished' : 'semi-furnished',
    heating: 'central',
    has_elevator: prop.floor && prop.floor > 3 ? true : false,
    has_garage: prop.type === 'house' || prop.type === 'villa' ? true : false,
    nearby_amenities: [
      'Супермаркет - 200м',
      'Парк - 300м',
      'Училище - 500м',
    ],
  };
});

interface PropertyDetailPageProps {
  propertyId: string;
}

export function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);

  const property = useMemo(
    () => mockProperties.find((p) => p.id === propertyId),
    [propertyId]
  );

  const recommendedProperties = useMemo(
    () => mockProperties.filter((p) => p.id !== propertyId).slice(0, 4),
    [propertyId]
  );

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
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFurnishingLabel = (level?: string) => {
    switch (level) {
      case 'unfurnished':
        return 'Необзаведен';
      case 'semi-furnished':
        return 'Частично обзаведен';
      case 'furnished':
        return 'Пълно обзаведен';
      case 'luxury':
        return 'Луксозно обзаведен';
      default:
        return 'Не е посочено';
    }
  };

  const getHeatingLabel = (heating?: string) => {
    switch (heating) {
      case 'central':
        return 'Централно';
      case 'electric':
        return 'Електрическо';
      case 'gas':
        return 'Газово';
      case 'wood':
        return 'Дърва';
      case 'none':
        return 'Няма';
      default:
        return 'Не е посочено';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
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

  return (
    <div className={styles.propertyPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Заглавие и цена */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>{property.title}</h1>
              <div className={styles.location}>
                <MapPin size={20} />
                <span>
                  {property.city}
                  {property.neighborhood && `, ${property.neighborhood}`}
                  {property.address && `, ${property.address}`}
                </span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.price}>
                {property.price.toLocaleString()} {property.currency}
                {property.status === 'for-rent' && (
                  <span className={styles.perMonth}>/месец</span>
                )}
              </div>
            </div>
          </div>

          {/* Бързи детайли */}
          <div className={styles.quickDetails}>
            <div className={styles.quickDetail}>
              <Square size={20} />
              <div>
                <span className={styles.quickDetailLabel}>Площ</span>
                <span className={styles.quickDetailValue}>{property.area} м²</span>
              </div>
            </div>
            {property.rooms && (
              <div className={styles.quickDetail}>
                <Bed size={20} />
                <div>
                  <span className={styles.quickDetailLabel}>Стаи</span>
                  <span className={styles.quickDetailValue}>{property.rooms}</span>
                </div>
              </div>
            )}
            {property.bathrooms && (
              <div className={styles.quickDetail}>
                <Bath size={20} />
                <div>
                  <span className={styles.quickDetailLabel}>Бани</span>
                  <span className={styles.quickDetailValue}>{property.bathrooms}</span>
                </div>
              </div>
            )}
            {property.neighborhood && (
              <div className={styles.quickDetail}>
                <Building size={20} />
                <div>
                  <span className={styles.quickDetailLabel}>Квартал</span>
                  <span className={styles.quickDetailValue}>{property.neighborhood}</span>
                </div>
              </div>
            )}
            {property.furnishing_level && (
              <div className={styles.quickDetail}>
                <Home size={20} />
                <div>
                  <span className={styles.quickDetailLabel}>Обзавеждане</span>
                  <span className={styles.quickDetailValue}>
                    {getFurnishingLabel(property.furnishing_level)}
                  </span>
                </div>
              </div>
            )}
            {property.heating && (
              <div className={styles.quickDetail}>
                <span className={styles.quickDetailLabel}>Отопление</span>
                <span className={styles.quickDetailValue}>
                  {getHeatingLabel(property.heating)}
                </span>
              </div>
            )}
            <div className={styles.quickDetail}>
              <Calendar size={20} />
              <div>
                <span className={styles.quickDetailLabel}>Публикувано</span>
                <span className={styles.quickDetailValue}>
                  {formatDate(property.created_at)}
                </span>
              </div>
            </div>
            {property.floor && (
              <div className={styles.quickDetail}>
                <span className={styles.quickDetailLabel}>Етаж</span>
                <span className={styles.quickDetailValue}>
                  {property.floor}/{property.total_floors}
                </span>
              </div>
            )}
          </div>

          {/* Действия отдясно */}
          <div className={styles.actions}>
            <div className={styles.actionCard}>
              <div className={styles.actionItem}>
                <span className={styles.actionLabel}>Обява ID:</span>
                <span className={styles.actionValue}>{property.id}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPriceAlert(!showPriceAlert)}
                className={styles.actionButton}
              >
                <Bell size={16} />
                Известие при промяна на цената
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className={styles.actionButton}
              >
                <Share2 size={16} />
                Сподели
              </Button>
              <Button
                variant={isFavorite ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={styles.actionButton}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'В любими' : 'Запази в любими'}
              </Button>
            </div>
          </div>

          {/* Слайдшоу */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {property.images && property.images.length > 0 ? (
                <>
                  <Image
                    src={property.images[currentImageIndex].url}
                    alt={property.title}
                    fill
                    className={styles.image}
                    sizes="100vw"
                    priority
                  />
                  <button
                    className={styles.fullscreenButton}
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 size={24} />
                  </button>
                  {property.images.length > 1 && (
                    <>
                      <button
                        className={styles.navButton}
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        className={`${styles.navButton} ${styles.next}`}
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                  <div className={styles.imageCounter}>
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              ) : (
                <div className={styles.placeholder}>Няма снимки</div>
              )}
            </div>
            {property.images && property.images.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {property.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`${styles.thumbnail} ${
                      index === currentImageIndex ? styles.active : ''
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className={styles.thumbnailImage}
                      sizes="(max-width: 768px) 25vw, 150px"
                    />
                  </button>
                ))}
              </div>
            )}
            {property.floor_plan_url && (
              <button
                className={styles.floorPlanButton}
                onClick={() => setShowFloorPlan(!showFloorPlan)}
              >
                План отгоре
              </button>
            )}
            {property.video_url && (
              <button className={styles.videoButton}>
                <Play size={20} />
                Видео
              </button>
            )}
          </div>

          {/* Описание */}
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.description}>{property.description}</p>
          </div>

          {/* Допълнителни детайли */}
          <div className={styles.additionalDetails}>
            <h2 className={styles.sectionTitle}>Допълнителни детайли</h2>
            <div className={styles.detailsGrid}>
              {property.has_elevator !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Асансьор:</span>
                  <span className={styles.detailValue}>
                    {property.has_elevator ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_condominium !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>СОТ:</span>
                  <span className={styles.detailValue}>
                    {property.has_condominium ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_wiring !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Окабеляване:</span>
                  <span className={styles.detailValue}>
                    {property.has_wiring ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_access_control !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Контрол на достъпа:</span>
                  <span className={styles.detailValue}>
                    {property.has_access_control ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_garage !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Гараж:</span>
                  <span className={styles.detailValue}>
                    {property.has_garage ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.is_luxury !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Лукс:</span>
                  <span className={styles.detailValue}>
                    {property.is_luxury ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_air_conditioning !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Климатик:</span>
                  <span className={styles.detailValue}>
                    {property.has_air_conditioning ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.has_video_surveillance !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Видео наблюдение:</span>
                  <span className={styles.detailValue}>
                    {property.has_video_surveillance ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
              {property.is_renovated !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Саниран:</span>
                  <span className={styles.detailValue}>
                    {property.is_renovated ? 'Да' : 'Не'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Какво има на 5 минути */}
          {property.nearby_amenities && property.nearby_amenities.length > 0 && (
            <div className={styles.nearbySection}>
              <h2 className={styles.sectionTitle}>Какво има на 5 минути оттук</h2>
              <div className={styles.amenitiesList}>
                {property.nearby_amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenity}>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Контакти */}
          <div className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Контакти</h2>
            <div className={styles.contactContent}>
              <div className={styles.brokerInfo}>
                <div className={styles.brokerAvatar}>
                  <span>БК</span>
                </div>
                <div className={styles.brokerDetails}>
                  <h3 className={styles.brokerName}>Брокер Консултант</h3>
                  <p className={styles.brokerTitle}>Старши брокер</p>
                  <div className={styles.brokerContact}>
                    <a href="tel:+359888888888" className={styles.contactLink}>
                      <Phone size={18} />
                      +359 888 888 888
                    </a>
                    <a href="mailto:broker@example.com" className={styles.contactLink}>
                      <Mail size={18} />
                      broker@example.com
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.contactForm}>
                <h3 className={styles.formTitle}>Изпрати запитване</h3>
                <form className={styles.form}>
                  <Input label="Име" type="text" required />
                  <Input label="Имейл" type="email" required />
                  <Input label="Телефон" type="tel" />
                  <div className={styles.textareaWrapper}>
                    <label htmlFor="message" className={styles.label}>
                      Съобщение
                    </label>
                    <textarea
                      id="message"
                      className={styles.textarea}
                      rows={4}
                      required
                    />
                  </div>
                  <div className={styles.formActions}>
                    <Button variant="primary" type="submit" size="lg">
                      Изпрати запитване
                    </Button>
                    <Button variant="outline" type="button" size="lg">
                      <Phone size={18} />
                      Обади се
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* История на цената */}
          {property.price_history && property.price_history.length > 0 && (
            <div className={styles.priceHistorySection}>
              <h2 className={styles.sectionTitle}>История на цената</h2>
              <div className={styles.priceHistory}>
                {property.price_history.map((entry, index) => (
                  <div key={index} className={styles.priceEntry}>
                    <span className={styles.priceDate}>{formatDate(entry.date)}</span>
                    <span className={styles.priceAmount}>
                      {entry.price.toLocaleString()} {property.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Препоръчителни имоти */}
          {recommendedProperties.length > 0 && (
            <div className={styles.recommendedSection}>
              <h2 className={styles.sectionTitle}>Препоръчителни имоти</h2>
              <div className={styles.recommendedGrid}>
                {recommendedProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Fullscreen modal */}
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
              className={styles.closeFullscreen}
              onClick={() => setIsFullscreen(false)}
            >
              <X size={32} />
            </button>
            <Image
              src={property.images[currentImageIndex].url}
              alt={property.title}
              fill
              className={styles.fullscreenImage}
              sizes="100vw"
            />
            {property.images.length > 1 && (
              <>
                <button
                  className={styles.fullscreenNav}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className={`${styles.fullscreenNav} ${styles.next}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor plan modal */}
      <AnimatePresence>
        {showFloorPlan && property.floor_plan_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.fullscreenModal}
            onClick={() => setShowFloorPlan(false)}
          >
            <button
              className={styles.closeFullscreen}
              onClick={() => setShowFloorPlan(false)}
            >
              <X size={32} />
            </button>
            <Image
              src={property.floor_plan_url}
              alt="План отгоре"
              fill
              className={styles.fullscreenImage}
              sizes="100vw"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
