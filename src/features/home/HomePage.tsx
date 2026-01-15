'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
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

// Lazy load LatestPropertiesSection
const LatestPropertiesSection = dynamic(
  () => import('./components/LatestPropertiesSection').then(mod => ({ default: mod.LatestPropertiesSection })),
  { ssr: false }
);

export function HomePage() {
  const { t } = useTranslation();

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
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', 'approved'],
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:queryFn:entry',message:'Starting reviews fetch',data:{url:'/api/reviews?status=approved&limit=6'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const response = await fetch('/api/reviews?status=approved&limit=6');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:queryFn:response',message:'Fetch response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const jsonData = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:queryFn:parsed',message:'JSON parsed',data:{hasReviews:!!jsonData.reviews,reviewsCount:jsonData.reviews?.length,total:jsonData.total,reviewsData:jsonData.reviews},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return jsonData;
    },
  });
  const reviews = reviewsData?.reviews || [];
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:reviews-assigned',message:'Reviews assigned to variable',data:{hasReviewsData:!!reviewsData,reviewsLength:reviews.length,reviews:reviews},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

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
        <ClientReviews reviews={reviews} onRefresh={refetchReviews} />

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

