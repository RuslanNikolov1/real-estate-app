'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Medal } from '@phosphor-icons/react';
import { Certificate } from '@/types';
import styles from './CertificateCard.module.scss';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
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
        <div className={styles.overlay}>
          <Medal className={styles.icon} size={32} />
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{certificate.title}</h3>
        {certificate.description && (
          <p className={styles.description}>{certificate.description}</p>
        )}
      </div>
    </motion.div>
  );
}













