'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './AdminPropertyCard.module.scss';

interface AdminPropertyCardProps {
  property: Property;
  onEdit: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function AdminPropertyCard({
  property,
  onEdit,
  onUpdate,
  onDelete,
}: AdminPropertyCardProps) {
  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>Няма снимка</div>
        )}
        <div className={styles.badge}>
          {property.status === 'for-sale' ? 'За продажба' : 'Под наем'}
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{property.title}</h3>
        <p className={styles.location}>
          {property.city}
          {property.neighborhood && `, ${property.neighborhood}`}
        </p>
        <div className={styles.price}>
          {property.price.toLocaleString()} {property.currency}
          {property.status === 'for-rent' && <span>/месец</span>}
        </div>
        <div className={styles.details}>
          <span>{property.area} м²</span>
          {property.rooms && <span>{property.rooms} стаи</span>}
          {property.bathrooms && <span>{property.bathrooms} бани</span>}
        </div>
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit size={16} /> Редактирай
          </Button>
          <Button variant="outline" size="sm" onClick={onUpdate}>
            <RefreshCw size={16} /> Обнови
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/properties/${property.id}`, '_blank')}
          >
            <Eye size={16} /> Преглед
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 size={16} /> Изтрий
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

