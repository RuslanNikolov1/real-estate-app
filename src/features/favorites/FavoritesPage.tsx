'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { getFavorites, removeFavorite, fetchPropertiesByIds } from '@/lib/favorites';
import { Property } from '@/types';
import { Heart, SignIn } from '@phosphor-icons/react';
import Link from 'next/link';
import { FavoritesPageSkeleton } from './components/FavoritesPageSkeleton';
import styles from './FavoritesPage.module.scss';

export function FavoritesPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadFavorites();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const loadFavorites = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:31',message:'loadFavorites called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      setError(null);
      
      const favoriteIds = await getFavorites();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:36',message:'Favorite IDs received',data:{favoriteIdsCount:favoriteIds.length,favoriteIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      const properties = await fetchPropertiesByIds(favoriteIds);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:50',message:'Properties fetched',data:{propertiesCount:properties.length,propertyIds:properties.map((p:any)=>p.id),propertyShortIds:properties.map((p:any)=>p.short_id),favoriteIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      
      // Sort by most recent (reverse order to match the order they were added)
      // Since newest favorites are appended to the end of the array, we reverse it
      const sortedProperties = properties.reverse();
      
      // Preserve the order based on favoriteIds
      // Match by both id (UUID) and short_id (numeric) since favorites might store either
      const orderedProperties = favoriteIds
        .map(id => {
          const found = sortedProperties.find(p => 
            p.id === id || 
            p.short_id?.toString() === id
          );
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:62',message:'Matching favorite ID',data:{favoriteId:id,found:!!found,matchedPropertyId:found?.id,matchedPropertyShortId:found?.short_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
          // #endregion
          return found;
        })
        .filter((p): p is Property => p !== undefined)
        .reverse(); // Reverse to show most recent first
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:54',message:'Setting favorites state',data:{orderedPropertiesCount:orderedProperties.length,orderedPropertyIds:orderedProperties.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      setFavorites(orderedProperties);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FavoritesPage.tsx:57',message:'loadFavorites error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      console.error('Error loading favorites:', err);
      setError(t('favorites.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    // Find the property to get both ID formats
    const property = favorites.find(p => p.id === propertyId);
    if (!property) return;

    // Get current favorites to determine which ID format is stored
    const favoriteIds = await getFavorites();
    
    // Determine which ID format is actually stored in favorites
    // Try both UUID and short_id formats
    const uuidId = property.id;
    const shortId = property.short_id?.toString();
    
    // Try removing with the format that matches what's in the database
    let success = false;
    if (favoriteIds.includes(uuidId)) {
      success = await removeFavorite(uuidId);
    } else if (shortId && favoriteIds.includes(shortId)) {
      success = await removeFavorite(shortId);
    } else {
      // If neither matches exactly, try both (one should work)
      const uuidSuccess = await removeFavorite(uuidId);
      const shortIdSuccess = shortId ? await removeFavorite(shortId) : false;
      success = uuidSuccess || shortIdSuccess;
    }

    if (success) {
      // Update local state by filtering out the property using both possible ID formats
      setFavorites(prev => prev.filter(p => 
        p.id !== uuidId && 
        (shortId ? p.short_id?.toString() !== shortId : true)
      ));
    }
  };

  return (
    <div className={styles.favoritesPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.headerSection}>
            <Heart size={40} weight="fill" className={styles.headerIcon} />
            <h1 className={styles.pageTitle}>{t('favorites.pageTitle')}</h1>
          </div>

          {!user && !authLoading && (
            <div className={styles.notLoggedIn}>
              <SignIn size={64} weight="light" className={styles.signInIcon} />
              <h2>{t('favorites.notLoggedInHeading')}</h2>
              <p>{t('favorites.notLoggedInDescription')}</p>
              <Link href="/login" className={styles.loginButton}>
                <SignIn size={20} />
                <span>{t('favorites.loginButton')}</span>
              </Link>
            </div>
          )}

          {user && loading && <FavoritesPageSkeleton />}

          {user && !loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {user && !loading && !error && favorites.length === 0 && (
            <div className={styles.emptyState}>
              <Heart size={80} weight="light" className={styles.emptyIcon} />
              <h2>{t('favorites.emptyStateHeading')}</h2>
              <p>{t('favorites.emptyStateDescription')}</p>
              <Link href="/" className={styles.browseButton}>
                {t('favorites.browseButton')}
              </Link>
            </div>
          )}

          {user && !loading && !error && favorites.length > 0 && (
            <>
              <div className={styles.resultsCount}>
                {t('favorites.resultsCount', { count: favorites.length })}
              </div>
              <div className={styles.propertiesList}>
                {favorites.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    layout="horizontal"
                    onDelete={handleRemoveFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
