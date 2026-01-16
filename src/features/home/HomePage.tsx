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
import { CertificatesMemberships } from './components/CertificatesMemberships';
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

  // #region agent log
  const burgasTitleValue = t('home.burgasTitle');
  const currentLanguage = i18n.language || i18n.resolvedLanguage || 'unknown';
  const isServer = typeof window === 'undefined';
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:28',message:'HomePage render - language check',data:{burgasTitle:burgasTitleValue,currentLanguage,isServer,hasWindow:typeof window !== 'undefined',isClient},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'A,D'})}).catch(()=>{});
  // #endregion

  // Initialize client-side flag after hydration to prevent mismatch
  useEffect(() => {
    setIsClient(true);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:35',message:'useEffect - setIsClient(true)',data:{currentLanguage:i18n.language},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

