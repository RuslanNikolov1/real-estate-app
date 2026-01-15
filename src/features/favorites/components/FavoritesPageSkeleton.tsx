import styles from './FavoritesPageSkeleton.module.scss';

export function FavoritesPageSkeleton() {
  return (
    <div className={styles.skeleton}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonPrice} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonLocation} />
            <div className={styles.skeletonDetails}>
              <div className={styles.skeletonDetail} />
              <div className={styles.skeletonDetail} />
              <div className={styles.skeletonDetail} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
