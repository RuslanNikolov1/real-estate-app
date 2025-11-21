'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Square } from '@phosphor-icons/react';
import { Property } from '@/types';
import styles from './PropertyCard.module.scss';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {

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
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : (
            <div className={styles.placeholder}>Няма снимка</div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.price}>
              {property.price.toLocaleString()} {property.currency}
              {property.status === 'for-rent' && <span className={styles.perMonth}>/месец</span>}
            </div>
            <h2 className={styles.title}>{property.title}</h2>
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
        </div>
      </Link>
    </motion.div>
  );
}













