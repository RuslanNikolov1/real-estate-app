'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin';
import { AuthModal } from '@/features/auth/components/AuthModal';
import styles from './SellYourProperty.module.scss';

export function SellYourProperty() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setRedirectPath, clearRedirectPath } = useRedirectAfterLogin();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const prevAuthModalOpenRef = useRef(false);

  // #region agent log
  const sellYourPropertyTranslation = t('home.sellYourProperty');
  const currentLanguage = i18n.language || i18n.resolvedLanguage || 'unknown';
  const isServer = typeof window === 'undefined';
  const hasWindow = typeof window !== 'undefined';
  const localStorageLang = hasWindow ? (localStorage.getItem('i18nextLng') || 'none') : 'N/A';
  if (hasWindow) {
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SellYourProperty.tsx:26', message: 'SellYourProperty render - translation check', data: { sellYourPropertyTranslation, currentLanguage, isServer, hasWindow, localStorageLang }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'blocking-investigation', hypothesisId: 'A,B,E' }) }).catch((err: any) => { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] SellYourProperty fetch blocked:', errMsg); });
  }
  // #endregion

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (user && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, authModalOpen]);

  // Clear redirect path only if modal is closed without successful login
  useEffect(() => {
    // If modal was open and is now closed, but user is still not authenticated,
    // clear the redirect path (user canceled)
    if (prevAuthModalOpenRef.current && !authModalOpen && !user) {
      clearRedirectPath();
    }
    prevAuthModalOpenRef.current = authModalOpen;
  }, [authModalOpen, user, clearRedirectPath]);

  const handleAddListingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (loading) return; // Wait for auth to load
    
    if (user) {
      // User is logged in, navigate to post-property
      router.push('/post-property');
    } else {
      // User is not logged in, store redirect and open auth modal
      setRedirectPath('/post-property');
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // Modal will close automatically via useEffect when user becomes authenticated
    // The useRedirectAfterLogin hook will handle the redirect
  };

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.content}>
              <h2 className={styles.title}>{t('home.sellYourProperty')}</h2>
              <p className={styles.description}>
                {t('home.sellPropertyDescription')}
              </p>
              <div className={styles.actions}>
                <Button variant="white" size="lg" onClick={handleAddListingClick}>
                  {t('home.addListing')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          // Don't clear redirect path here - let useEffect handle it
          // This ensures redirect path persists through successful login
        }}
        initialTab="login"
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}









