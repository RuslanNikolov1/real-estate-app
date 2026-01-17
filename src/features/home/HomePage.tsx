'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PropertySearch } from './components/PropertySearch';
import { FeaturedProperties } from './components/FeaturedProperties';
import { SellYourProperty } from './components/SellYourProperty';
import { PartnerServices } from './components/PartnerServices';
import { ContactBroker } from './components/ContactBroker';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import styles from './HomePage.module.scss';

// Lazy load LatestPropertiesSection
const LatestPropertiesSection = dynamic(
  () => import('./components/LatestPropertiesSection').then(mod => ({ default: mod.LatestPropertiesSection })),
  { ssr: false }
);

// Lazy load ClientReviews
const ClientReviews = dynamic(
  () => import('./components/ClientReviews').then(mod => ({ default: mod.ClientReviews })),
  { ssr: false }
);

export function HomePage() {
  const { t, i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side flag after hydration to prevent mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch featured properties (4 most viewed)
  const { data: featuredProperties = [] } = useQuery({
    queryKey: ['featured-properties'],
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

  return (
    <div className={styles.homePage}>
      <Header />
      <main>
        {/* Hero Section with Background Image */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroOverlay}></div>
          <div className={styles.logoBottomLeft}>
            <Image 
              src="/Picture Logo.png" 
              alt="Logo" 
              width={400}
              height={800}
              priority
              className={styles.logoImage}
            />
          </div>
          <div className={styles.logoBottomRight}>
            <Image 
              src="/Picture Logo Mirrored.png" 
              alt="Logo" 
              width={400}
              height={800}
              priority
              className={styles.logoImage}
            />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle} suppressHydrationWarning>
              {t('home.title')}
            </h1>
            <p className={styles.heroSubtitle} suppressHydrationWarning>
              {t('home.subtitle')}
            </p>
            <div className={styles.searchWrapper}>
              <PropertySearch />
            </div>
          </div>
          <div className={styles.tagline} suppressHydrationWarning>
            {t('home.tagline')}
          </div>
        </section>

        {/* Latest Properties */}
        <Suspense fallback={<div className={styles.loadingSection}>{t('common.loading')}</div>}>
          <LatestPropertiesSection />
        </Suspense>

        {/* Featured Properties */}
        {featuredProperties.length > 0 && (
          <FeaturedProperties properties={featuredProperties} />
        )}

        {/* Sell Your Property */}
        <SellYourProperty />

        {/* Client Reviews */}
        <Suspense fallback={<div className={styles.loadingSection}>{t('common.loading')}</div>}>
          <ClientReviews />
        </Suspense>

        {/* Partner Services */}
        {partnerServices.length > 0 && (
          <PartnerServices services={partnerServices} />
        )}

        {/* Contact Broker */}
        <ContactBroker />
      </main>
      <Footer />
    </div>
  );
}

