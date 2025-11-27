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
import { APARTMENT_FEATURE_FILTERS, CONSTRUCTION_FILTERS, COMPLETION_STATUSES } from '@/features/map-filters/filters/constants';
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

// Mock broker data
const mockBroker = {
  id: '1',
  name: 'Иван Петров',
  title: 'Старши брокер',
  phone: '+359 888 123 456',
  email: 'ivan.petrov@example.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
};

interface PropertyDetailPageProps {
  propertyId: string;
}

export function PropertyDetailPage({ propertyId }: PropertyDetailPageProps) {
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

  const property = useMemo(
    () => mockProperties.find((p) => p.id === propertyId),
    [propertyId]
  );

  const recommendedProperties = useMemo(() => {
    const filtered = mockProperties.filter((p) => p.id !== propertyId && p.status === 'for-sale' && p.type === 'apartment');
    
    // If we don't have enough, add some mock properties
    if (filtered.length < 4) {
      const additionalProperties: Property[] = [
        {
          id: 'rec1',
          title: 'Модерен апартамент в квартал Изгрев',
          description: 'Двустаен апартамент с балкон и изглед към града.',
          type: 'apartment',
          status: 'for-sale',
          location_type: 'urban',
          city: 'Бургас',
          neighborhood: 'Изгрев',
          price: 145000,
          currency: 'лв',
          area: 75,
          rooms: 2,
          bathrooms: 1,
          floor: 4,
          total_floors: 6,
          images: [{
            id: 'rec1-img',
            url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
            public_id: 'rec1-1',
            width: 1200,
            height: 800,
            is_primary: true,
          }],
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
          location_type: 'coastal',
          city: 'Бургас',
          neighborhood: 'Морска градина',
          price: 220000,
          currency: 'лв',
          area: 110,
          rooms: 3,
          bathrooms: 2,
          floor: 2,
          total_floors: 5,
          images: [{
            id: 'rec2-img',
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            public_id: 'rec2-1',
            width: 1200,
            height: 800,
            is_primary: true,
          }],
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
          location_type: 'urban',
          city: 'Бургас',
          neighborhood: 'Лазур',
          price: 95000,
          currency: 'лв',
          area: 55,
          rooms: 1,
          bathrooms: 1,
          floor: 1,
          total_floors: 4,
          images: [{
            id: 'rec3-img',
            url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
            public_id: 'rec3-1',
            width: 1200,
            height: 800,
            is_primary: true,
          }],
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
          location_type: 'urban',
          city: 'Бургас',
          neighborhood: 'Център',
          price: 280000,
          currency: 'лв',
          area: 130,
          rooms: 4,
          bathrooms: 3,
          floor: 8,
          total_floors: 8,
          images: [{
            id: 'rec4-img',
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            public_id: 'rec4-1',
            width: 1200,
            height: 800,
            is_primary: true,
          }],
          view_count: 412,
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ];
      
      return [...filtered, ...additionalProperties].slice(0, 4);
    }
    
    return filtered.slice(0, 4);
  }, [propertyId]);

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

  const pricePerSqm = property.area > 0 ? Math.round(property.price / property.area) : 0;

  // Consistent number formatter to avoid hydration mismatch
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Format property ID to 3 digits
  const formatPropertyId = (id: string) => {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      return numId.toString().padStart(3, '0');
    }
    return id;
  };

  // Get construction type label
  const getConstructionLabel = () => {
    const construction = CONSTRUCTION_FILTERS.find((c) => c.id === (property as any).construction_type);
    return construction?.label || 'Не е посочено';
  };

  // Get completion status label
  const getCompletionLabel = () => {
    const completion = COMPLETION_STATUSES.find((c) => c.id === (property as any).completion_status);
    return completion?.label || 'Не е посочено';
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

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!isFullscreen || !property.images || property.images.length <= 1) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, property.images]);

  const leftImages = property.images?.slice(0, 2) || [];
  const middleImage = property.images?.[2];
  const rightImages = property.images?.slice(3, 5) || [];
  const remainingImagesCount = Math.max(0, (property.images?.length || 0) - 5);
  const activeFullscreenImage = property.images?.[currentImageIndex];
  const logoImageUrl = '/Red Logo.jpg'; // Logo from public folder

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
              {leftImages.map((img, index) => (
                <div 
                  key={img.id} 
                  className={styles.sideImage}
                  onClick={handleImageClick}
                >
                  {failedImages.has(img.id) ? (
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
              {middleImage ? (
                <div className={styles.mainImage}>
                  {failedImages.has(middleImage.id) ? (
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
                      src={middleImage.url}
                      publicId={middleImage.public_id}
                      alt={property.title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                      onError={() => handleImageError(middleImage.id)}
                    />
                  )}
                </div>
              ) : (
                <div className={styles.placeholder}>Няма снимка</div>
              )}
            </div>
            
            {/* Right Column - 2 images stacked */}
            <div className={styles.rightImagesContainer}>
              {rightImages.map((img, index) => (
                <div 
                  key={img.id} 
                  className={styles.sideImage}
                  onClick={handleImageClick}
                >
                  {failedImages.has(img.id) ? (
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
                  {property.rooms && (
                    <div className={styles.detailBox}>
                      <Bed size={24} />
                      <div className={styles.detailValue}>{property.rooms} стаи</div>
                    </div>
                  )}
                  <div className={styles.detailBox}>
                    <Square size={24} />
                    <div className={styles.detailValue}>{property.area} м²</div>
                  </div>
                  {property.floor && (
                    <div className={styles.detailBox}>
                      <Buildings size={24} />
                      <div className={styles.detailValue}>{property.floor}/{property.total_floors} етаж</div>
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
                      const feature = APARTMENT_FEATURE_FILTERS.find((f) => f.id === featureId);
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

              {/* Construction Details */}
              <div className={styles.constructionSection}>
                <h2 className={styles.sectionTitle}>Детайли за строителството</h2>
                <div className={styles.constructionGrid}>
                  <div className={styles.constructionItem}>
                    <span className={styles.constructionLabel}>Вид строителство</span>
                    <span className={styles.constructionValue}>{getConstructionLabel()}</span>
                  </div>
                  {property.year_built && (
                    <div className={styles.constructionItem}>
                      <span className={styles.constructionLabel}>Година на строителство</span>
                      <span className={styles.constructionValue}>{property.year_built}</span>
                    </div>
                  )}
                  <div className={styles.constructionItem}>
                    <span className={styles.constructionLabel}>Степен на завършеност</span>
                    <span className={styles.constructionValue}>{getCompletionLabel()}</span>
                  </div>
                </div>
              </div>

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
                    <span>ID: {formatPropertyId(property.id)}</span>
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
                <div className={styles.brokerSection}>
                  <div className={styles.brokerImage}>
                    <Image
                      src={mockBroker.avatar}
                      alt={mockBroker.name}
                      fill
                      className={styles.brokerAvatar}
                      sizes="100px"
                    />
                  </div>
                  <div className={styles.brokerDetails}>
                    <div className={styles.brokerName}>{mockBroker.name}</div>
                    <div className={styles.brokerTitle}>{mockBroker.title}</div>
                    <a href={`tel:${mockBroker.phone}`} className={styles.brokerContact}>
                      <Phone size={18} />
                      <span>{mockBroker.phone}</span>
                    </a>
                  </div>
                </div>
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
  