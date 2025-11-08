'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminReviewCard } from './components/AdminReviewCard';
import { Input } from '@/components/ui/Input';
import { Review } from '@/types';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import styles from './AdminReviewsPage.module.scss';

// Mock data - всички отзиви (одобрени и неодобрени)
const allReviews: Review[] = [
  {
    id: '1',
    user_name: 'Иван Петров',
    user_email: 'ivan@example.com',
    rating: 5,
    comment:
      'Отлично обслужване! Намерихме идеалния апартамент в центъра на Бургас. Брокерът беше много професионален и помогна с всички документи. Препоръчвам!',
    is_approved: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_name: 'Мария Георгиева',
    user_email: 'maria@example.com',
    rating: 5,
    comment:
      'Много доволна от услугите. Продадохме къщата си бързо и на добра цена. Екипът е много отзивчив и професионален. Благодаря!',
    is_approved: true,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    user_name: 'Георги Димитров',
    user_email: 'georgi@example.com',
    rating: 4,
    comment:
      'Добро обслужване, но можеше да бъде малко по-бързо. В крайна сметка намерихме подходящ имот. Брокерът беше любезен и знаеше какво търсим.',
    is_approved: true,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    user_name: 'Нов отзив',
    user_email: 'new@example.com',
    rating: 5,
    comment: 'Това е нов отзив, който очаква одобрение.',
    is_approved: false,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },
  {
    id: '5',
    user_name: 'Друг клиент',
    user_email: 'client@example.com',
    rating: 3,
    comment: 'Средно обслужване. Очаквах повече.',
    is_approved: false,
    created_at: '2024-03-21T11:00:00Z',
    updated_at: '2024-03-21T11:00:00Z',
  },
  {
    id: '6',
    user_name: 'Елена Стоянова',
    user_email: 'elena@example.com',
    rating: 5,
    comment:
      'Най-добрият опит с недвижими имоти! Намерихме перфектната вила на морето. Процесът беше гладък и безпроблемен. Определено ще се обърнем отново!',
    is_approved: true,
    created_at: '2024-02-10T16:45:00Z',
    updated_at: '2024-02-10T16:45:00Z',
  },
  {
    id: '7',
    user_name: 'Димитър Николов',
    user_email: 'dimitar@example.com',
    rating: 5,
    comment:
      'Професионално обслужване от начало до край. Помогнаха ни да намерим офис пространство за нашия бизнес. Много доволни сме!',
    is_approved: true,
    created_at: '2024-02-15T11:20:00Z',
    updated_at: '2024-02-15T11:20:00Z',
  },
  {
    id: '8',
    user_name: 'Светла Иванова',
    user_email: 'svetla@example.com',
    rating: 5,
    comment:
      'Отлично отношение и професионализъм! Намерихме апартамент точно според нашите изисквания. Брокерът беше много търпелив и отзивчив. Препоръчвам с две ръце!',
    is_approved: true,
    created_at: '2024-02-20T13:10:00Z',
    updated_at: '2024-02-20T13:10:00Z',
  },
  {
    id: '9',
    user_name: 'Петър Стефанов',
    user_email: 'petar@example.com',
    rating: 4,
    comment:
      'Добро обслужване и голяма гама от имоти. Намерихме подходящ имот, макар че процесът отне малко повече време от очакваното. Като цяло доволен съм.',
    is_approved: true,
    created_at: '2024-03-01T10:30:00Z',
    updated_at: '2024-03-01T10:30:00Z',
  },
  {
    id: '10',
    user_name: 'Анна Тодорова',
    user_email: 'anna@example.com',
    rating: 5,
    comment:
      'Невероятен опит! Продадохме имота си за рекордно време и на отлична цена. Екипът е много професионален и знае какво прави. Благодаря за всичко!',
    is_approved: true,
    created_at: '2024-03-05T15:00:00Z',
    updated_at: '2024-03-05T15:00:00Z',
  },
];

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(allReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>(
    'all'
  );

  const handleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, is_approved: true } : review
      )
    );
  };

  const handleReject = (id: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, is_approved: false } : review
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този отзив?')) {
      setReviews((prev) => prev.filter((review) => review.id !== id));
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.is_approved) ||
      (filterStatus === 'pending' && !review.is_approved);

    return matchesSearch && matchesFilter;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className={styles.adminPage}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Админ панел - Отзиви</h1>
                <p className={styles.subtitle}>
                  Управление на отзиви от клиенти
                </p>
              </div>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Всички</span>
                  <span className={styles.statValue}>{reviews.length}</span>
                </div>
                <div className={`${styles.statCard} ${styles.approved}`}>
                  <span className={styles.statLabel}>Одобрени</span>
                  <span className={styles.statValue}>{approvedCount}</span>
                </div>
                <div className={`${styles.statCard} ${styles.pending}`}>
                  <span className={styles.statLabel}>Очакващи</span>
                  <span className={styles.statValue}>{pendingCount}</span>
                </div>
              </div>
            </div>

            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  type="text"
                  placeholder="Търсене по име, имейл или коментар..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filters}>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`${styles.filterButton} ${
                    filterStatus === 'all' ? styles.active : ''
                  }`}
                >
                  <Filter size={16} />
                  Всички
                </button>
                <button
                  onClick={() => setFilterStatus('approved')}
                  className={`${styles.filterButton} ${
                    filterStatus === 'approved' ? styles.active : ''
                  }`}
                >
                  <CheckCircle size={16} />
                  Одобрени
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`${styles.filterButton} ${
                    filterStatus === 'pending' ? styles.active : ''
                  }`}
                >
                  <XCircle size={16} />
                  Очакващи ({pendingCount})
                </button>
              </div>
            </div>

            <div className={styles.grid}>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <AdminReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onReject={() => handleReject(review.id)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Няма отзиви, отговарящи на критериите.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

