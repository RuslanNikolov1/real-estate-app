'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewCard } from './components/ReviewCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ChatCircleDots, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Review } from '@/types';
import styles from './ReviewsPage.module.scss';

// Removed mock data - will fetch from API

const oldMockReviews = [
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
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
    user_name: 'Анна Тодорова',
    user_email: 'anna@example.com',
    rating: 5,
    comment:
      'Невероятен опит! Продадохме имота си за рекордно време и на отлична цена. Екипът е много професионален и знае какво прави. Благодаря за всичко!',
    is_approved: true,
    created_at: '2024-03-05T15:00:00Z',
    updated_at: '2024-03-05T15:00:00Z',
  },
  {
    id: '9',
    user_name: 'Николай Василев',
    user_email: 'nikolay@example.com',
    rating: 5,
    comment:
      'Много доволен от услугите! Намерихме идеалния имот за инвестиция. Брокерът беше много информиран и помогна с всички аспекти на сделката. Отлично!',
    is_approved: true,
    created_at: '2024-03-10T12:45:00Z',
    updated_at: '2024-03-10T12:45:00Z',
  },
  {
    id: '10',
    user_name: 'Румяна Павлова',
    user_email: 'rumyana@example.com',
    rating: 5,
    comment:
      'Най-добрият избор за недвижими имоти в Бургас! Намерихме перфектната къща за семейството си. Процесът беше безпроблемен и професионален. Препоръчвам на всички!',
    is_approved: true,
    created_at: '2024-03-15T14:20:00Z',
    updated_at: '2024-03-15T14:20:00Z',
  },
];

export function ReviewsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const limit = 16;

  // Fetch all approved reviews (is_approved = true), ordered by created_at descending
  // API automatically filters for is_approved = true when status=approved
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reviews', 'approved', page],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?status=approved&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  // API returns only reviews where is_approved = true, no additional filtering needed
  const reviews: Review[] = data?.reviews || [];
  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleSubmitClick = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setFeedbackModalOpen(true);
  };

  return (
    <div className={styles.reviewsPage}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <h1 className={styles.title}>{t('nav.reviews')}</h1>
                <p className={styles.subtitle}>
                  {t('reviews.subtitle')}
                </p>
              </div>
              <Button onClick={handleSubmitClick}>
                <ChatCircleDots size={18} />
                {t('reviews.writeFeedback')}
              </Button>
            </div>

            {isLoading ? (
              <div className={styles.loading}>
                {t('reviews.loading')}
              </div>
            ) : reviews.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('reviews.noReviews')}</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {reviews.map((review: Review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <CaretLeft size={18} />
                      {t('reviews.previous')}
                    </Button>
                    <span className={styles.pageInfo}>
                      {t('reviews.pageInfo', { current: page, total: totalPages })}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t('reviews.next')}
                      <CaretRight size={18} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSuccess={() => {
          setFeedbackModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}




















