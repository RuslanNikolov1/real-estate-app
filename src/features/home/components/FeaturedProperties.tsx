'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bathtub, Square } from '@phosphor-icons/react';
import { Property } from '@/types';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import styles from './FeaturedProperties.module.scss';

interface FeaturedPropertiesProps {
  properties: Property[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const { t } = useTranslation();

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('home.featuredProperties')}</h2>
        <div className={styles.grid}>
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/properties/${property.id}`} className={styles.card}>
                <div className={styles.imageContainer}>
                  {property.images && property.images.length > 0 ? (
                    <CloudinaryImage
                      src={property.images[0].url}
                      publicId={property.images[0].public_id}
                      alt={property.title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={styles.placeholder}>No image</div>
                  )}
                  <div className={styles.badge}>
                    {property.status === 'for-sale' ? t('nav.forSale') : t('nav.forRent')}
                  </div>
                </div>
                <div className={styles.content}>
                  <h3 className={styles.propertyTitle}>{property.title}</h3>
                  <div className={styles.location}>
                    <MapPin size={16} />
                    <span>
                      {property.city}
                      {property.neighborhood && `, ${property.neighborhood}`}
                    </span>
                  </div>
                  <div className={styles.details}>
                    {property.rooms && (
                      <div className={styles.detail}>
                        <Bed size={16} />
                        <span>{property.rooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className={styles.detail}>
                        <Bathtub size={16} />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    <div className={styles.detail}>
                      <Square size={16} />
                      <span>{property.area} м²</span>
                    </div>
                  </div>
                  <div className={styles.price}>
                    {property.price.toLocaleString()} {property.currency}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}













