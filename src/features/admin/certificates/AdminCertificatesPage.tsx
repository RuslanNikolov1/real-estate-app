'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminCertificateCard } from './components/AdminCertificateCard';
import { CertificateModal } from './components/CertificateModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Certificate } from '@/types';
import { Plus, Search, Award } from 'lucide-react';
import styles from './AdminCertificatesPage.module.scss';

// Mock data - всички сертификати
const allCertificates: Certificate[] = [
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
];

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(
    allCertificates
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null);

  const handleAdd = () => {
    setEditingCertificate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този сертификат?')) {
      setCertificates((prev) => prev.filter((cert) => cert.id !== id));
    }
  };

  const handleSave = (certificate: Certificate) => {
    if (editingCertificate) {
      // Update existing
      setCertificates((prev) =>
        prev.map((cert) => (cert.id === certificate.id ? certificate : cert))
      );
    } else {
      // Add new
      const newCert: Certificate = {
        ...certificate,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCertificates((prev) => [...prev, newCert]);
    }
    setIsModalOpen(false);
    setEditingCertificate(null);
  };

  const handleMoveUp = (id: string) => {
    setCertificates((prev) => {
      const index = prev.findIndex((cert) => cert.id === id);
      if (index <= 0) return prev;
      const newCerts = [...prev];
      [newCerts[index - 1], newCerts[index]] = [
        newCerts[index],
        newCerts[index - 1],
      ];
      return newCerts.map((cert, i) => ({ ...cert, order: i + 1 }));
    });
  };

  const handleMoveDown = (id: string) => {
    setCertificates((prev) => {
      const index = prev.findIndex((cert) => cert.id === id);
      if (index >= prev.length - 1) return prev;
      const newCerts = [...prev];
      [newCerts[index], newCerts[index + 1]] = [
        newCerts[index + 1],
        newCerts[index],
      ];
      return newCerts.map((cert, i) => ({ ...cert, order: i + 1 }));
    });
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.adminPage}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Админ панел - Сертификати</h1>
                <p className={styles.subtitle}>
                  Управление на сертификати и членства
                </p>
              </div>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <Award className={styles.statIcon} size={24} />
                  <div>
                    <span className={styles.statLabel}>Общо</span>
                    <span className={styles.statValue}>
                      {certificates.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  type="text"
                  placeholder="Търсене по заглавие или описание..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Добави сертификат
              </Button>
            </div>

            <div className={styles.grid}>
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((certificate) => (
                  <AdminCertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onEdit={() => handleEdit(certificate)}
                    onDelete={() => handleDelete(certificate.id)}
                    onMoveUp={() => handleMoveUp(certificate.id)}
                    onMoveDown={() => handleMoveDown(certificate.id)}
                    isFirst={
                      certificates.findIndex((c) => c.id === certificate.id) ===
                      0
                    }
                    isLast={
                      certificates.findIndex((c) => c.id === certificate.id) ===
                      certificates.length - 1
                    }
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Няма сертификати, отговарящи на критериите.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {isModalOpen && (
        <CertificateModal
          certificate={editingCertificate}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCertificate(null);
          }}
        />
      )}
    </div>
  );
}












