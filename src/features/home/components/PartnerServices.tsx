'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PartnerService } from '@/types';
import styles from './PartnerServices.module.scss';

interface PartnerServicesProps {
  services: PartnerService[];
}

export function PartnerServices({ services }: PartnerServicesProps) {
  const { t } = useTranslation();

  if (services.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('home.partnerServices')}</h2>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={styles.card}
            >
              {service.logo_url && (
                <div className={styles.logoContainer}>
                  <Image
                    src={service.logo_url}
                    alt={service.name}
                    width={120}
                    height={80}
                    className={styles.logo}
                  />
                </div>
              )}
              <h3 className={styles.name}>{service.name}</h3>
              {service.description && (
                <p className={styles.description}>{service.description}</p>
              )}
              {service.website_url && (
                <a
                  href={service.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Посетете сайта
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}















