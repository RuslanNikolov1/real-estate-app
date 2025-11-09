'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Square, Eye } from 'lucide-react';
import { Property } from '@/types';
import { useTranslation } from 'react-i18next';
import styles from './PropertyCard.module.scss';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const { t } = useTranslation();

  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.card}
    >
      <Link
        href={`/properties/${property.id}`}
        className={styles.link}
        onClick={onClick}
      >
        <div className={styles.imageContainer}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className={styles.placeholder}>Няма снимка</div>
          )}
          <div className={styles.badge}>
            {property.status === 'for-sale' ? t('nav.forSale') : t('nav.forRent')}
          </div>
          <div className={styles.viewCount}>
            <Eye size={16} />
            <span>{property.view_count}</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{property.title}</h2>
            <div className={styles.price}>
              {property.price.toLocaleString()} {property.currency}
              {property.status === 'for-rent' && <span className={styles.perMonth}>/месец</span>}
            </div>
          </div>

          <div className={styles.location}>
            <MapPin size={18} />
            <span>
              {property.city}
              {property.neighborhood && `, ${property.neighborhood}`}
            </span>
          </div>

          <div className={styles.details}>
            {property.rooms && (
              <div className={styles.detail}>
                <Bed size={18} />
                <span>{property.rooms} стаи</span>
              </div>
            )}
            {property.bathrooms && (
              <div className={styles.detail}>
                <Bath size={18} />
                <span>{property.bathrooms} бани</span>
              </div>
            )}
            <div className={styles.detail}>
              <Square size={18} />
              <span>{property.area} м²</span>
            </div>
            {property.floor && (
              <div className={styles.detail}>
                <span>
                  {property.floor}/{property.total_floors} етаж
                </span>
              </div>
            )}
          </div>

          {property.description && (
            <p className={styles.description}>{property.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}










