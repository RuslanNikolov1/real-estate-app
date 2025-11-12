'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, TrendUp, Building } from '@phosphor-icons/react';
import { Neighborhood } from '../NeighborhoodsPage';
import styles from './NeighborhoodCard.module.scss';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  index: number;
  onSelect: () => void;
}

export function NeighborhoodCard({ neighborhood, index, onSelect }: NeighborhoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={styles.card}
      onClick={onSelect}
    >
      <div className={styles.imageContainer}>
        <Image
          src={neighborhood.image}
          alt={neighborhood.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.overlay}>
          <div className={styles.badge}>{neighborhood.name}</div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{neighborhood.name}</h2>
        <p className={styles.description}>{neighborhood.description}</p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <MapPin size={18} />
            <span>{neighborhood.distanceFromCenter} от центъра</span>
          </div>
          <div className={styles.detailItem}>
            <TrendUp size={18} />
            <span>От {neighborhood.averagePrice.sale.toLocaleString()} лв/м²</span>
          </div>
        </div>

        <div className={styles.characteristics}>
          <h3 className={styles.sectionTitle}>Характеристики</h3>
          <div className={styles.tags}>
            {neighborhood.characteristics.slice(0, 3).map((char, i) => (
              <span key={i} className={styles.tag}>
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.propertyTypes}>
          <Building size={18} />
          <span>{neighborhood.propertyTypes.join(', ')}</span>
        </div>
      </div>
    </motion.div>
  );
}

