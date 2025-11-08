'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './BurgasSlideshow.module.scss';

interface Slide {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
}

interface BurgasSlideshowProps {
  slides: Slide[];
  description?: string;
}

export function BurgasSlideshow({ slides, description }: BurgasSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  if (slides.length === 0) {
    return (
      <div className={styles.slideshow}>
        <div className={styles.placeholder}>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.slideshow}>
      <div className={styles.slideshowContainer}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className={styles.slide}
          >
            <Image
              src={slides[currentIndex].imageUrl}
              alt={slides[currentIndex].title || 'Burgas'}
              fill
              className={styles.slideImage}
              priority={currentIndex === 0}
              sizes="100vw"
            />
            {(slides[currentIndex].title || slides[currentIndex].description) && (
              <div className={styles.slideOverlay}>
                {slides[currentIndex].title && (
                  <h2 className={styles.slideTitle}>{slides[currentIndex].title}</h2>
                )}
                {slides[currentIndex].description && (
                  <p className={styles.slideDescription}>
                    {slides[currentIndex].description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              className={styles.navButton}
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className={styles.dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {description && (
        <div className={styles.description}>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}








