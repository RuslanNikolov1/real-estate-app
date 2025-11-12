'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PropertySearch } from '@/features/home/components/PropertySearch';
import { PropertyCard } from './components/PropertyCard';
import { Property, PropertySearchFilters } from '@/types';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import styles from './PropertiesListPage.module.scss';

// 10 изкуствени имота
export const mockProperties: Property[] = [
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
    id: '2',
    title: 'Къща с двор в квартал Славейков',
    description:
      'Двуетажна къща с голям двор, гараж и градина. Идеална за семейство. Санирана през 2022.',
    type: 'house',
    status: 'for-sale',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Славейков',
    address: 'ул. Славейков 42',
    price: 320000,
    currency: 'лв',
    area: 180,
    rooms: 5,
    bathrooms: 3,
    floor: 1,
    total_floors: 2,
    year_built: 2015,
    images: [
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        public_id: 'prop2-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 189,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Апартамент под наем близо до морето',
    description:
      'Двустаен апартамент на 200м от плажа. Пълно обзавеждане, климатик, балкон с изглед.',
    type: 'apartment',
    status: 'for-rent',
    location_type: 'coastal',
    city: 'Бургас',
    neighborhood: 'Морска градина',
    address: 'ул. Приморска 8',
    price: 600,
    currency: 'лв',
    area: 65,
    rooms: 2,
    bathrooms: 1,
    floor: 3,
    total_floors: 5,
    year_built: 2018,
    images: [
      {
        id: 'img3',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        public_id: 'prop3-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 312,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
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
    id: '5',
    title: 'Офис пространство в бизнес център',
    description:
      'Модерно офис пространство с 4 стаи, рецепция и кухня. Идеално за малък бизнес.',
    type: 'office',
    status: 'for-rent',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Център',
    address: 'бул. Демокрация 12',
    price: 1200,
    currency: 'лв',
    area: 120,
    rooms: 4,
    bathrooms: 1,
    floor: 2,
    total_floors: 6,
    year_built: 2021,
    images: [
      {
        id: 'img5',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
        public_id: 'prop5-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 98,
    created_at: '2024-02-15T11:20:00Z',
    updated_at: '2024-02-15T11:20:00Z',
  },
  {
    id: '6',
    title: 'Магазин в търговска зона',
    description:
      'Търговски обект на първия етаж с витрина. Висок трафик, идеално за бизнес.',
    type: 'shop',
    status: 'for-rent',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Меден рудник',
    address: 'ул. Търговска 33',
    price: 800,
    currency: 'лв',
    area: 45,
    rooms: 1,
    bathrooms: 1,
    floor: 1,
    total_floors: 3,
    year_built: 2010,
    images: [
      {
        id: 'img6',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        public_id: 'prop6-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 156,
    created_at: '2024-02-20T13:10:00Z',
    updated_at: '2024-02-20T13:10:00Z',
  },
  {
    id: '7',
    title: 'Семейна къща в планинска зона',
    description:
      'Къща с изглед към планината, голям двор и гараж. Спокойна зона, идеална за семейство.',
    type: 'house',
    status: 'for-sale',
    location_type: 'mountain',
    city: 'Бургас',
    neighborhood: 'Изгрев',
    address: 'ул. Планинска 7',
    price: 280000,
    currency: 'лв',
    area: 160,
    rooms: 4,
    bathrooms: 2,
    floor: 1,
    total_floors: 2,
    year_built: 2012,
    images: [
      {
        id: 'img7',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        public_id: 'prop7-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 203,
    created_at: '2024-03-01T10:30:00Z',
    updated_at: '2024-03-01T10:30:00Z',
  },
  {
    id: '8',
    title: 'Студио под наем в центъра',
    description:
      'Компактно студио с пълно обзавеждане. Идеално за студенти или млади професионалисти.',
    type: 'apartment',
    status: 'for-rent',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Център',
    address: 'ул. Цар Освободител 20',
    price: 350,
    currency: 'лв',
    area: 35,
    rooms: 1,
    bathrooms: 1,
    floor: 2,
    total_floors: 4,
    year_built: 2015,
    images: [
      {
        id: 'img8',
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
        public_id: 'prop8-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 421,
    created_at: '2024-03-05T15:00:00Z',
    updated_at: '2024-03-05T15:00:00Z',
  },
  {
    id: '9',
    title: 'Склад за наем',
    description:
      'Просторен склад с висок таван и рампа за товарене. Идеален за логистика или производство.',
    type: 'warehouse',
    status: 'for-rent',
    location_type: 'urban',
    city: 'Бургас',
    neighborhood: 'Индустриална зона',
    address: 'ул. Индустриална 45',
    price: 1500,
    currency: 'лв',
    area: 500,
    rooms: 0,
    bathrooms: 1,
    floor: 1,
    total_floors: 1,
    year_built: 2008,
    images: [
      {
        id: 'img9',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
        public_id: 'prop9-1',
        width: 1200,
        height: 800,
        is_primary: true,
      },
    ],
    view_count: 87,
    created_at: '2024-03-10T12:45:00Z',
    updated_at: '2024-03-10T12:45:00Z',
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

const ITEMS_PER_PAGE = 5;

function PropertiesListContent() {
  const router = useRouter();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<PropertySearchFilters>({
    location_type: [],
    type: [],
    status: [],
  });

  const handleSearch = (searchFilters: PropertySearchFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1);
  };

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      if (filters.location_type && filters.location_type.length > 0) {
        if (!filters.location_type.includes(property.location_type)) {
          return false;
        }
      }
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(property.type)) {
          return false;
        }
      }
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(property.status)) {
          return false;
        }
      }
      if (filters.min_price && property.price < filters.min_price) {
        return false;
      }
      if (filters.max_price && property.price > filters.max_price) {
        return false;
      }
      if (filters.min_area && property.area < filters.min_area) {
        return false;
      }
      if (filters.max_area && property.area > filters.max_area) {
        return false;
      }
      if (filters.rooms && property.rooms !== filters.rooms) {
        return false;
      }
      if (filters.bathrooms && property.bathrooms !== filters.bathrooms) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  return (
    <div className={styles.propertiesPage}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.searchSection}>
              <PropertySearch
                onSearch={handleSearch}
                isExpanded={isSearchExpanded}
                onExpand={() => setIsSearchExpanded(!isSearchExpanded)}
              />
            </div>

            <div className={styles.resultsHeader}>
              <h1 className={styles.title}>
                Намерени имоти: {filteredProperties.length}
              </h1>
            </div>

            <div className={styles.propertiesList}>
              {paginatedProperties.length > 0 ? (
                paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => router.push(`/properties/${property.id}`)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Няма намерени имоти, отговарящи на критериите.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <CaretLeft size={20} />
                  Предишна
                </Button>
                <div className={styles.pageNumbers}>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`${styles.pageButton} ${
                            currentPage === page ? styles.active : ''
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className={styles.ellipsis}>
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Следваща
                  <CaretRight size={20} />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function PropertiesListPage() {
  return (
    <Suspense fallback={<div>Зареждане...</div>}>
      <PropertiesListContent />
    </Suspense>
  );
}

