'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { EnvelopeSimple, Phone, MapPin, FacebookLogo, InstagramLogo, LinkedinLogo, UserCircleDashed, Heart } from '@phosphor-icons/react';
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
              {t('footer.description')}
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
            <h4 className={styles.columnTitle}>{t('footer.quickLinks')}</h4>
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
            <h4 className={styles.columnTitle}>{t('footer.services')}</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/valuation" prefetch={false}>{t('nav.valuation')}</Link>
              </li>
              <li>
                <Link href="/properties/add" prefetch={false}>{t('footer.addListing')}</Link>
              </li>
              <li>
                <Link href="/favorites" prefetch={false}>{t('nav.favorites')}</Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.contacts')}</h4>
            <ul className={styles.contact}>
              <li>
                <MapPin size={18} />
                <span>{t('footer.location')}</span>
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
            <span className={styles.creatorName}>
              Created by Ruslan Nikolov with <Heart size={16} weight="fill" color="#802E2E" className={styles.heartIcon} />
            </span>
          </a>
          <p className={styles.copyright}>
            © 2025 Broker Bulgaria. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}






