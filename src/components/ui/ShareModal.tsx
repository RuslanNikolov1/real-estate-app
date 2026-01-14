'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Link as LinkIcon,
  FacebookLogo,
  TwitterLogo,
  LinkedinLogo,
  WhatsappLogo,
  TelegramLogo,
  MessengerLogo,
} from '@phosphor-icons/react';
import styles from './ShareModal.module.scss';

interface ShareModalProps {
  url: string;
  title: string;
  description: string;
  onClose: () => void;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, text: string) => string;
}

export function ShareModal({ url, title, description, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const shareText = `${title} - ${description}`;
  const fullMessage = `${title}\n${description}\n${url}`;

  const platforms: SharePlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FacebookLogo size={24} weight="fill" />,
      color: '#1877F2',
      getUrl: (shareUrl) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'messenger',
      name: 'Messenger',
      icon: <MessengerLogo size={24} weight="fill" />,
      color: '#00B2FF',
      getUrl: (shareUrl) =>
        `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <WhatsappLogo size={24} weight="fill" />,
      color: '#25D366',
      getUrl: (_, text) =>
        `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      id: 'viber',
      name: 'Viber',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.644s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.97-1.084 1.397-1.58 3.851.322 6.812-.417 7.149-.525.776-.253 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546 0 0-1.43-1.97-5.862-1.978-4.434-.007-5.645.01-5.645.01zM11.47 1.5c.126 0 .65 0 1.27.006 3.67.065 5.14 1.47 5.14 1.47 1.645 1.42 2.522 4.696 1.855 9.96-.593 4.846-3.986 5.303-4.65 5.52-.285.093-2.936.736-6.354.48 0 0-2.52 3.05-3.302 3.836-.12.12-.26.167-.352.145-.13-.033-.166-.18-.165-.4l.01-4.58c-.003 0-.004 0-.004-.002-4.77-1.32-4.49-6.28-4.437-8.902.053-2.623.536-4.73 1.96-6.29C3.58 1.624 7.168 1.5 11.47 1.5zm.194 1.982c-.166.004-.303.058-.413.168-.32.32-.247.875.172 1.255.455.413 1.118.77 1.948 1.012.83.243 1.744.36 2.67.36.927 0 1.842-.117 2.673-.36.83-.242 1.492-.6 1.947-1.012.42-.38.492-.935.173-1.255-.32-.32-.875-.247-1.256.172-.29.325-.753.607-1.434.798-.68.19-1.47.297-2.303.297-.832 0-1.622-.107-2.302-.297-.68-.19-1.144-.473-1.434-.798-.184-.207-.367-.347-.533-.34zm-3.144 1.645c-.045-.003-.092.004-.14.02-.354.12-.548.516-.436.886.113.37.523.576.877.456.354-.12.548-.516.436-.886-.088-.293-.376-.488-.66-.478zm6.3.002c-.282-.01-.57.185-.66.478-.112.37.082.766.436.886.354.12.764-.086.877-.456.112-.37-.082-.766-.436-.886-.048-.016-.096-.023-.14-.02zm-3.15 2.866c-.166.004-.304.058-.414.168-.32.32-.247.876.172 1.256.455.412 1.118.77 1.948 1.012.83.242 1.744.36 2.67.36.927 0 1.842-.118 2.673-.36.83-.243 1.492-.6 1.947-1.013.42-.38.492-.935.173-1.255-.32-.32-.875-.247-1.256.172-.29.325-.753.607-1.434.798-.68.19-1.47.297-2.303.297-.832 0-1.622-.107-2.302-.297-.68-.19-1.144-.473-1.434-.798-.184-.207-.367-.347-.533-.34z"/>
        </svg>
      ),
      color: '#7360F2',
      getUrl: (_, text) =>
        `viber://forward?text=${encodeURIComponent(text)}`,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <TelegramLogo size={24} weight="fill" />,
      color: '#26A5E4',
      getUrl: (shareUrl, text) =>
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: <TwitterLogo size={24} weight="fill" />,
      color: '#000000',
      getUrl: (shareUrl, text) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <LinkedinLogo size={24} weight="fill" />,
      color: '#0A66C2',
      getUrl: (shareUrl) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handlePlatformClick = (platform: SharePlatform) => {
    const shareUrl = platform.getUrl(url, shareText);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={styles.backdrop}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 id="share-modal-title" className={styles.title}>
              Сподели имот
            </h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Затвори"
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.content}>
            <p className={styles.description}>
              Изберете платформа за споделяне
            </p>

            <div className={styles.platformsGrid}>
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className={styles.platformButton}
                  style={{ '--platform-color': platform.color } as React.CSSProperties}
                  aria-label={`Сподели в ${platform.name}`}
                >
                  <span className={styles.platformIcon}>{platform.icon}</span>
                  <span className={styles.platformName}>{platform.name}</span>
                </button>
              ))}
            </div>

            <div className={styles.divider}>
              <span>или</span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
              aria-label="Копирай линк"
            >
              {copied ? (
                <>
                  <Check size={20} weight="bold" />
                  <span>Копирано!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={20} />
                  <span>Копирай линк</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
