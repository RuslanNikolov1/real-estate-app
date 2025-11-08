'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PropertySearch } from './components/PropertySearch';
import { BurgasSlideshow } from './components/BurgasSlideshow';
import { FeaturedProperties } from './components/FeaturedProperties';
import { SellYourProperty } from './components/SellYourProperty';
import { ClientReviews } from './components/ClientReviews';
import { PartnerServices } from './components/PartnerServices';
import { CertificatesMemberships } from './components/CertificatesMemberships';
import { ContactBroker } from './components/ContactBroker';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertySearchFilters } from '@/types';
import styles from './HomePage.module.scss';

// Mock data - replace with actual API calls
const mockSlides = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    title: 'Бургас',
    description: 'Морската столица на България',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    title: 'Красив град',
    description: 'Съвременна архитектура и историческо наследство',
  },
];

export function HomePage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Fetch featured properties (4 most viewed)
  const { data: featuredProperties = [] } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  // Fetch partner services
  const { data: partnerServices = [] } = useQuery({
    queryKey: ['partner-services'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  // Fetch certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const handleSearch = (filters: PropertySearchFilters) => {
    // TODO: Navigate to properties page with filters
    console.log('Search filters:', filters);
  };

  return (
    <div className={styles.homePage}>
      <Header />
      <main>
        {/* Hero Section with Background Image */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroOverlay}></div>
          <div className={styles.logoBottomLeft}>
            <img src="/Picture Logo.png" alt="Logo" />
          </div>
          <div className={styles.logoBottomRight}>
            <img src="/Picture Logo Mirrored.png" alt="Logo" />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Професионални недвижими имоти в Бургас
            </h1>
            <p className={styles.heroSubtitle}>
              Намерете своя идеален имот - апартаменти, къщи, вили и бизнес
              имоти
            </p>
            <div className={styles.searchWrapper}>
              <PropertySearch
                onSearch={handleSearch}
                isExpanded={isSearchExpanded}
                onExpand={() => setIsSearchExpanded(!isSearchExpanded)}
              />
            </div>
          </div>
        </section>

        {/* Burgas Slideshow */}
        <section className={styles.slideshowSection}>
          <BurgasSlideshow
            slides={mockSlides}
            description="Бургас е един от най-динамично развиващите се градове в България, с богата история, красива природа и отлични възможности за инвестиции в недвижими имоти."
          />
        </section>

        {/* Featured Properties */}
        {featuredProperties.length > 0 && (
          <FeaturedProperties properties={featuredProperties} />
        )}

        {/* Sell Your Property */}
        <SellYourProperty />

        {/* Client Reviews */}
        {reviews.length > 0 && <ClientReviews reviews={reviews} />}

        {/* Partner Services */}
        {partnerServices.length > 0 && (
          <PartnerServices services={partnerServices} />
        )}

        {/* Certificates & Memberships */}
        {certificates.length > 0 && (
          <CertificatesMemberships certificates={certificates} />
        )}

        {/* Contact Broker */}
        <ContactBroker />
      </main>
      <Footer />
    </div>
  );
}

