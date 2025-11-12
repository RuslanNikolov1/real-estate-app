'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
import styles from './HomePage.module.scss';

export function HomePage() {
  const { t } = useTranslation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Mock data - replace with actual API calls
  const mockSlides = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      title: t('home.burgasTitle'),
      description: t('home.burgasDescription1'),
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
      title: t('home.burgasTitle2'),
      description: t('home.burgasDescription2'),
    },
  ];

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
              {t('home.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('home.subtitle')}
            </p>
            <div className={styles.searchWrapper}>
              <PropertySearch
                isExpanded={isSearchExpanded}
                onExpand={() => setIsSearchExpanded(!isSearchExpanded)}
              />
            </div>
          </div>
          <div className={styles.tagline}>
            {t('home.tagline')}
          </div>
        </section>

        {/* Burgas Slideshow */}
        <section className={styles.slideshowSection}>
          <BurgasSlideshow
            slides={mockSlides}
            description={t('home.burgasAbout')}
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

