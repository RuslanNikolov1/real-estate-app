'use client';

import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CertificateCard } from './components/CertificateCard';
import { Certificate } from '@/types';
import styles from './CertificatesPage.module.scss';

// Изкуствени сертификати и членства
const mockCertificates: Certificate[] = [
  {
    id: '1',
    title: 'Сертификат за професионален брокер',
    description:
      'Сертификат за професионална квалификация в областта на недвижимите имоти, издаден от Българската асоциация на брокерите.',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f',
    public_id: 'cert-1',
    order: 1,
    created_at: '2020-01-15T10:00:00Z',
    updated_at: '2020-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Член на Българската асоциация на брокерите',
    description:
      'Активен член на Българската асоциация на брокерите с над 10 години опит в сектора.',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
    public_id: 'cert-2',
    order: 2,
    created_at: '2015-03-20T14:30:00Z',
    updated_at: '2015-03-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Сертификат за оценка на недвижими имоти',
    description:
      'Сертифициран оценчик на недвижими имоти с лиценз от Министерството на регионалното развитие и благоустройството.',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
    public_id: 'cert-3',
    order: 3,
    created_at: '2018-06-10T09:15:00Z',
    updated_at: '2018-06-10T09:15:00Z',
  },
  {
    id: '4',
    title: 'Член на Международната федерация на брокерите',
    description:
      'Член на FIABCI (Международна федерация на брокерите) с достъп до международни стандарти и практики.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    public_id: 'cert-4',
    order: 4,
    created_at: '2019-09-05T16:45:00Z',
    updated_at: '2019-09-05T16:45:00Z',
  },
  {
    id: '5',
    title: 'Сертификат за управление на имоти',
    description:
      'Сертификат за професионално управление на недвижими имоти, включително поддръжка, ремонти и наемане.',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
    public_id: 'cert-5',
    order: 5,
    created_at: '2021-02-15T11:20:00Z',
    updated_at: '2021-02-15T11:20:00Z',
  },
  {
    id: '6',
    title: 'Член на Камарата на строителите',
    description:
      'Член на Българската камара на строителите с опит в строителството и недвижимите имоти.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    public_id: 'cert-6',
    order: 6,
    created_at: '2017-11-20T13:10:00Z',
    updated_at: '2017-11-20T13:10:00Z',
  },
  {
    id: '7',
    title: 'Сертификат за ипотечно консултиране',
    description:
      'Сертифициран консултант за ипотечни кредити с партньорства с водещи банки в България.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    public_id: 'cert-7',
    order: 7,
    created_at: '2022-04-01T10:30:00Z',
    updated_at: '2022-04-01T10:30:00Z',
  },
  {
    id: '8',
    title: 'Сертификат за енергийна ефективност',
    description:
      'Сертификат за оценка на енергийната ефективност на сгради и консултации за подобряване на енергийния клас.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    public_id: 'cert-8',
    order: 8,
    created_at: '2023-01-15T15:00:00Z',
    updated_at: '2023-01-15T15:00:00Z',
  },
  {
    id: '9',
    title: 'Член на Асоциацията на оценчиците',
    description:
      'Член на Българската асоциация на независимите оценчици на недвижими имоти.',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    public_id: 'cert-9',
    order: 9,
    created_at: '2016-08-10T12:45:00Z',
    updated_at: '2016-08-10T12:45:00Z',
  },
  {
    id: '10',
    title: 'Сертификат за онлайн маркетинг на имоти',
    description:
      'Сертификат за професионален онлайн маркетинг и реклама на недвижими имоти в дигитална среда.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    public_id: 'cert-10',
    order: 10,
    created_at: '2023-05-20T14:20:00Z',
    updated_at: '2023-05-20T14:20:00Z',
  },
];

export function CertificatesPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.certificatesPage}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                {t('nav.certificates')} и членства
              </h1>
              <p className={styles.subtitle}>
                Нашите професионални сертификати и членства в водещи
                организации в сектора на недвижимите имоти
              </p>
            </div>

            <div className={styles.grid}>
              {mockCertificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


















