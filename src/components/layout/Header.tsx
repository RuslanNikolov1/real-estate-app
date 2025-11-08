'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Heart, User } from 'lucide-react';
import styles from './Header.module.scss';

const languages = [
  { code: 'bg', label: 'БГ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/properties/for-sale', label: t('nav.forSale') },
    { href: '/properties/for-rent', label: t('nav.forRent') },
    { href: '/neighborhoods', label: t('nav.neighborhoods') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/certificates', label: t('nav.certificates') },
    { href: '/valuation', label: t('nav.valuation') },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const resolvedLanguage = (i18n.resolvedLanguage || i18n.language || '').split('-')[0];
  const currentLanguageLabel =
    languages.find((l) => l.code === resolvedLanguage)?.label || languages[0].label;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/Logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.logoText}>Broker Bulgaria</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.languageSelector}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className={styles.languageButton}
              aria-label="Change language"
            >
              <Globe size={20} />
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
            <Heart size={20} />
          </Link>

          <Link href="/login" className={styles.iconButton} aria-label="Login">
            <User size={20} />
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${pathname === item.href ? styles.active : ''
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}








