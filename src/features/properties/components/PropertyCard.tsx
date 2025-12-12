'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Bed, Square, PencilSimple, Trash } from '@phosphor-icons/react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Property } from '@/types';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import { getSubtypeLabel } from '@/lib/subtype-mapper';
import { getFloorLabel } from '@/lib/floor-options';
import styles from './PropertyCard.module.scss';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  onDelete?: (propertyId: string) => void;
  onEdit?: (propertyId: string) => void;
}

export function PropertyCard({ property, onClick, onDelete, onEdit }: PropertyCardProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'bg';

  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];

  // Consistent number formatter to avoid hydration mismatch
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // For sales apartments, use sales/apartments/[short_id] route when available
  const getPropertyUrl = () => {
    if (property.status === 'for-sale' && property.type === 'apartment') {
      const idForUrl = property.short_id ?? property.id;
      return `/sale/apartments/${idForUrl}`;
    }
    const idForUrl = property.short_id ?? property.id;
    return `/properties/${idForUrl}`;
  };

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onDelete) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onDelete(property.id);
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onEdit) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onEdit(property.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.card}
    >
      {onDelete && (
        <button
          type="button"
          className={`${styles.actionButton} ${styles.deleteButton}`}
          aria-label="Изтрий имот"
          onClick={handleDeleteClick}
        >
          <Trash size={20} weight="fill" />
          <span>Изтрий</span>
        </button>
      )}
      <Link
        href={getPropertyUrl()}
        className={styles.link}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={styles.imageContainer}>
          {primaryImage ? (
            <>
            <CloudinaryImage
              src={primaryImage.url}
              publicId={primaryImage.public_id}
              alt={property.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
              {property.images && property.images.length > 1 && (
                <div className={styles.moreImagesLabel}>
                  Още {property.images.length - 1} снимки
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>Няма снимка</div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.price}>
              {formatNumber(property.price)} {property.currency}
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
            {property.subtype && (
              <div className={styles.detail}>
                <Bed size={18} />
                <span>{getSubtypeLabel(property.subtype, currentLanguage)}</span>
              </div>
            )}
            <div className={styles.detail}>
              <Square size={18} />
              <span>{property.area} м²</span>
            </div>
            {property.floor && (
              <div className={styles.detail}>
                <span>
                  {getFloorLabel(String(property.floor))}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {onEdit && (
        <button
          type="button"
          className={`${styles.actionButton} ${styles.editButton}`}
          aria-label="Редактирай имот"
          onClick={handleEditClick}
        >
          <PencilSimple size={22} weight="fill" />
          <span>Редактирай</span>
        </button>
      )}
    </motion.div>
  );
}













