'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { EnvelopeSimple, Phone, MapPin, FacebookLogo, InstagramLogo, LinkedinLogo, UserCircleDashed } from '@phosphor-icons/react';
import styles from './Footer.module.scss';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.title}>Broker Bulgaria</h3>
            <p className={styles.description}>
              Професионални недвижими имоти в Бургас. Намерете своя идеален имот
              с нас.
            </p>
            <div className={styles.social}>
              <a
                href="#"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <FacebookLogo size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <InstagramLogo size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className={styles.socialLink}
              >
                <LinkedinLogo size={20} />
              </a>
            </div>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Бързи връзки</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/properties/for-sale" prefetch={false}>{t('nav.forSale')}</Link>
              </li>
              <li>
                <Link href="/properties/for-rent" prefetch={false}>{t('nav.forRent')}</Link>
              </li>
              <li>
                <Link href="/neighborhoods" prefetch={false}>{t('nav.neighborhoods')}</Link>
              </li>
              <li>
                <Link href="/reviews" prefetch={false}>{t('nav.reviews')}</Link>
              </li>
              <li>
                <Link href="/certificates" prefetch={false}>{t('nav.certificates')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Услуги</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/valuation" prefetch={false}>{t('nav.valuation')}</Link>
              </li>
              <li>
                <Link href="/properties/add" prefetch={false}>Добави обява</Link>
              </li>
              <li>
                <Link href="/favorites" prefetch={false}>{t('nav.favorites')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Контакти</h4>
            <ul className={styles.contact}>
              <li>
                <MapPin size={18} />
                <span>Бургас, България</span>
              </li>
              <li>
                <Phone size={18} />
                <a href="tel:+359888888888">+359 888 888 888</a>
              </li>
              <li>
                <EnvelopeSimple size={18} />
                <a href="mailto:info@example.com">info@example.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <a
            href="https://portfolio-website-dusky-five-28.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creatorCredit}
          >
            <UserCircleDashed size={18} color="#40E0D0" weight="fill" />
            <span className={styles.creatorName}>
              Created by Ruslan Nikolov ❤️
            </span>
          </a>
          <p className={styles.copyright}>
            © 2025 Broker Bulgaria. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}






