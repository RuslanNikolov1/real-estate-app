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
              <span suppressHydrationWarning>{t('footer.description')}</span>
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
            <h4 className={styles.columnTitle}><span suppressHydrationWarning>{t('footer.quickLinks')}</span></h4>
            <ul className={styles.links}>
              <li>
                <Link href="/properties/for-sale" prefetch={false}><span suppressHydrationWarning>{t('nav.forSale')}</span></Link>
              </li>
              <li>
                <Link href="/properties/for-rent" prefetch={false}><span suppressHydrationWarning>{t('nav.forRent')}</span></Link>
              </li>
              <li>
                <Link href="/neighborhoods" prefetch={false}><span suppressHydrationWarning>{t('nav.neighborhoods')}</span></Link>
              </li>
              <li>
                <Link href="/reviews" prefetch={false}><span suppressHydrationWarning>{t('nav.reviews')}</span></Link>
              </li>
              <li>
                <Link href="/certificates" prefetch={false}><span suppressHydrationWarning>{t('nav.certificates')}</span></Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}><span suppressHydrationWarning>{t('footer.services')}</span></h4>
            <ul className={styles.links}>
              <li>
                <Link href="/post-property" prefetch={false}><span suppressHydrationWarning>{t('nav.postProperty')}</span></Link>
              </li>
              <li>
                <Link href="/properties/add" prefetch={false}><span suppressHydrationWarning>{t('footer.addListing')}</span></Link>
              </li>
              <li>
                <Link href="/favorites" prefetch={false}><span suppressHydrationWarning>{t('nav.favorites')}</span></Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}><span suppressHydrationWarning>{t('footer.contacts')}</span></h4>
            <ul className={styles.contact}>
              <li>
                <MapPin size={18} />
                <span suppressHydrationWarning>{t('footer.location')}</span>
              </li>
              <li>
                <Phone size={18} />
                <a href="tel:+359898993030">+359898993030</a>
              </li>
              <li>
                <EnvelopeSimple size={18} />
                <a href="mailto:brokerbulgaria@abv.bg">brokerbulgaria@abv.bg</a>
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
            © 2025 Broker Bulgaria. <span suppressHydrationWarning>{t('footer.allRightsReserved')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}






