'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  X,
  Globe,
  Heart,
  User,
  House,
  CurrencyDollar,
  Key,
  Buildings,
  Star,
  Medal,
  ChartBar
} from '@phosphor-icons/react';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';
import styles from './Header.module.scss';

const languages = [
  { code: 'bg', label: 'BG' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showAmbienceMessage, setShowAmbienceMessage] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if message has already been shown in this session
    const hasShownMessage = sessionStorage.getItem('ambienceMessageShown');
    
    if (hasShownMessage) {
      // Message already shown, don't show again
      return;
    }

    // Show message after 3 seconds
    const showTimer = setTimeout(() => {
      setShowAmbienceMessage(true);
      // Mark as shown in sessionStorage
      sessionStorage.setItem('ambienceMessageShown', 'true');
    }, 3000);

    // Hide message after 5 seconds (8 seconds total from page load)
    const hideTimer = setTimeout(() => {
      setShowAmbienceMessage(false);
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const navItems = [
    { href: '/', label: t('nav.home'), icon: House },
    { href: '/properties/for-sale', label: t('nav.forSale'), icon: CurrencyDollar },
    { href: '/properties/for-rent', label: t('nav.forRent'), icon: Key },
    { href: '/neighborhoods', label: t('nav.neighborhoods'), icon: Buildings },
    { href: '/reviews', label: t('nav.reviews'), icon: Star },
    { href: '/certificates', label: t('nav.certificates'), icon: Medal },
    { href: '/valuation', label: t('nav.valuation'), icon: ChartBar },
  ];

  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  // User menu items based on authentication state
  const userMenuItems = user
    ? [
        { label: user.email || 'Потребител', href: null, action: null },
        { label: t('nav.adminPanel'), href: '/admin-panel', action: null },
        { label: 'Изход', href: null, action: handleSignOut },
      ]
    : [
        { label: 'Влез', href: null, action: () => openAuthModal('login') },
        { label: 'Регистрация', href: null, action: () => openAuthModal('register') },
      ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const resolvedLanguage = (i18n.resolvedLanguage || i18n.language || '').split('-')[0];
  const currentLanguageLabel =
    languages.find((l) => l.code === resolvedLanguage)?.label || languages[0].label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/Logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.logoText}>Broker Bulgaria</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''
                  }`}
              >
                <Icon size={18} />
                <span suppressHydrationWarning>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <div className={styles.audioPlayerWrapper}>
            <AudioPlayer src="/soft-piano.mp3" label={t('header.ambienceLabel')} />
            <AnimatePresence>
              {showAmbienceMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.ambienceMessage}
                >
                  <span suppressHydrationWarning>{t('header.ambienceMessage')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.languageSelector}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className={styles.languageButton}
              aria-label="Change language"
            >
              <Globe size={20} color="white" />
              <span>{currentLanguageLabel}</span>
            </button>
            <AnimatePresence>
              {isLanguageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.languageMenu}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`${styles.languageOption} ${i18n.language === lang.code ? styles.active : ''
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/favorites" className={styles.iconButton} aria-label="Favorites">
            <Heart size={20} color="white" />
          </Link>

          <div className={styles.userMenuWrapper} ref={userMenuRef}>
            <button
              type="button"
              className={styles.userMenuButton}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <User size={20} color="white" weight={user ? 'fill' : 'regular'} />
            </button>
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.userMenu}
                >
                  {userMenuItems.map((item, index) => (
                    item.href ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        className={styles.userMenuLink}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span suppressHydrationWarning>{item.label}</span>
                      </Link>
                    ) : item.action ? (
                      <button
                        key={`action-${index}`}
                        type="button"
                        className={styles.userMenuLink}
                        onClick={item.action}
                      >
                        <span suppressHydrationWarning>{item.label}</span>
                      </button>
                    ) : (
                      <div key={`label-${index}`} className={styles.userMenuLabel}>
                        <span suppressHydrationWarning>{item.label}</span>
                      </div>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} color="white" /> : <List size={24} color="white" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.mobileNav}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileNavLink} ${pathname === item.href ? styles.active : ''
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span suppressHydrationWarning>{item.label}</span>
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </header>
  );
}








