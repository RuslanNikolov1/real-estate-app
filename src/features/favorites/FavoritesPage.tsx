'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { Property } from '@/types';
import { Heart, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import styles from './FavoritesPage.module.scss';

// 3 изкуствени любими имота
const mockFavoriteProperties: Property[] = [
  {
    id: '1',
    title: 'Луксозен апартамент в центъра на Бургас',
    description:
      'Модерен тристаен апартамент с изглед към морето. Пълно обзавеждане, паркинг, близо до плажа.',
    type: 'apartment',
    status: 'for-sale',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Център',
    address: 'ул. Александровска 15',
    price: 180000,
    currency: 'лв',
    area: 95,
    rooms: 3,
    bathrooms: 2,
    floor: 5,
    total_floors: 8,
    year_built: 2020,
    images: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        public_id: 'prop1-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 245,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    title: 'Вила на първа линия море',
    description:
      'Луксозна вила с частен плаж, басейн и градина. Идеална за почивка или постоянен престой.',
    type: 'villa',
    status: 'for-sale',
    location_type: 'coastal',
    city: 'Бургас',
    neighborhood: 'Сарафово',
    address: 'ул. Морска 25',
    price: 850000,
    currency: 'лв',
    area: 350,
    rooms: 6,
    bathrooms: 4,
    floor: 1,
    total_floors: 2,
    year_built: 2019,
    images: [
      {
        id: 'img4',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        public_id: 'prop4-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 567,
    created_at: '2024-02-10T16:45:00Z',
    updated_at: '2024-02-10T16:45:00Z',
  },
  {
    id: '10',
    title: 'Четиристаен апартамент с тераса',
    description:
      'Просторен апартамент с голяма тераса и изглед. Пълно обзавеждане, паркинг, асансьор.',
    type: 'apartment',
    status: 'for-sale',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Лозово',
    address: 'ул. Лозова 18',
    price: 220000,
    currency: 'лв',
    area: 125,
    rooms: 4,
    bathrooms: 2,
    floor: 6,
    total_floors: 10,
    year_built: 2022,
    images: [
      {
        id: 'img10',
        url: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455',
        public_id: 'prop10-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 334,
    created_at: '2024-03-15T14:20:00Z',
    updated_at: '2024-03-15T14:20:00Z',
  },
];

export function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>(mockFavoriteProperties);

  const handleRemoveFavorite = (id: string) => {
    if (window.confirm('Сигурни ли сте, че искате да премахнете този имот от любими?')) {
      setFavorites((prev) => prev.filter((property) => property.id !== id));
    }
  };

  return (
    <div className={styles.favoritesPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.header}
          >
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <Heart size={32} className={styles.heartIcon} />
                <h1 className={styles.title}>Любими имоти</h1>
              </div>
              <p className={styles.subtitle}>
                {favorites.length === 0
                  ? 'Нямате запазени любими имоти'
                  : `Имате ${favorites.length} ${favorites.length === 1 ? 'запазен имот' : 'запазени имота'}`}
              </p>
            </div>
          </motion.div>

          {favorites.length > 0 ? (
            <div className={styles.propertiesList}>
              {favorites.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.propertyWrapper}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => router.push(`/properties/${property.id}`)}
                  />
                  <button
                    onClick={() => handleRemoveFavorite(property.id)}
                    className={styles.removeButton}
                    aria-label="Премахни от любими"
                  >
                    <Trash size={20} />
                    Премахни
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.emptyState}
            >
              <Heart size={64} className={styles.emptyHeartIcon} />
              <h2 className={styles.emptyTitle}>Нямате любими имоти</h2>
              <p className={styles.emptyDescription}>
                Започнете да запазвате имоти, които ви интересуват, за да ги намерите лесно по-късно.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/properties')}
              >
                Разгледай имоти
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}













