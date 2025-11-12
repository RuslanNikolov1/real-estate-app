'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CaretRight } from '@phosphor-icons/react';
import Image from 'next/image';
import { Certificate } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './CertificatesMemberships.module.scss';

interface CertificatesMembershipsProps {
  certificates: Certificate[];
}

export function CertificatesMemberships({
  certificates,
}: CertificatesMembershipsProps) {
  const { t } = useTranslation();

  const displayedCertificates = certificates.slice(0, 6);

  if (displayedCertificates.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('home.certificatesMemberships')}</h2>
          <Link href="/certificates">
            <Button variant="outline" className={styles.viewAllButton}>
              Виж всички
              <CaretRight size={16} />
            </Button>
          </Link>
        </div>
        <div className={styles.grid}>
          {displayedCertificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={styles.card}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={certificate.image_url}
                  alt={certificate.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{certificate.title}</h3>
                {certificate.description && (
                  <p className={styles.description}>{certificate.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}













