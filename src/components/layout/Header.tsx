'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  List,
  X,
  Globe,
  Heart,
  User,
  CurrencyDollar,
  Key,
  Star,
  ChartBar,
  Calculator
} from '@phosphor-icons/react';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin';
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
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { setRedirectPath } = useRedirectAfterLogin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showAmbienceMessage, setShowAmbienceMessage] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const prevAuthModalOpenRef = useRef(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
    { href: '/sale/search', label: t('nav.forSale'), icon: CurrencyDollar },
    { href: '/rent/search', label: t('nav.forRent'), icon: Key },
    { href: '/reviews', label: t('nav.reviews'), icon: Star },
    { href: '/valuation', label: t('nav.valuation'), icon: Calculator },
    { href: '/post-property', label: t('nav.postProperty'), icon: ChartBar },
  ];

  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    // Clear login toast flag so it shows again on next login
    sessionStorage.removeItem('loginToastShown');
  };

  // Check if user is admin
  const isAdmin = user?.email === 'ruslannikolov1@gmail.com';

  // Fetch pending reviews count for admin
  const { data: statsData } = useQuery({
    queryKey: ['reviews-stats'],
    queryFn: async () => {
      const response = await fetch('/api/reviews/stats');
      if (!response.ok) throw new Error('Failed to fetch review stats');
      return response.json();
    },
    enabled: isAdmin && !!user,
    retry: false,
  });

  const pendingCount = statsData?.pending || 0;

  // User menu items based on authentication state
  const userMenuItems = user
    ? [
        { label: user.email || t('header.userLabel'), href: null, action: null },
        ...(isAdmin ? [{ label: t('nav.adminPanel'), href: '/admin-panel', action: null }] : []),
        { label: t('nav.logout'), href: null, action: handleSignOut },
      ]
    : [
        { label: t('nav.login'), href: null, action: () => openAuthModal('login') },
        { label: t('nav.register'), href: null, action: () => openAuthModal('register') },
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
      
      // Close mobile menu if click is outside both the menu button and the menu itself
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        mobileMenuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Show toast only when user successfully logs in through the modal
  // Redirect is handled by useRedirectAfterLogin hook
  useEffect(() => {
    // Check if auth modal was just closed and user is now logged in
    // This means a successful login just happened
    if (prevAuthModalOpenRef.current && !authModalOpen && user) {
      setShowLoginToast(true);
      sessionStorage.setItem('loginToastShown', 'true');
    }
    // Update previous auth modal state
    prevAuthModalOpenRef.current = authModalOpen;
  }, [authModalOpen, user]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/Logo.png" alt="Logo" className={styles.logoImage} />
          <span className={styles.logoText}>{t('header.logoText')}</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isPostProperty = item.href === '/post-property';
            
            if (isPostProperty) {
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (loading) return;
                    if (user) {
                      router.push('/post-property');
                    } else {
                      setRedirectPath('/post-property');
                      openAuthModal('login');
                    }
                  }}
                  className={`${styles.navLink} ${pathname === item.href ? styles.active : ''
                    }`}
                  type="button"
                >
                  <Icon size={18} />
                  <span suppressHydrationWarning>{item.label}</span>
                </button>
              );
            }
            
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
          <button
            type="button"
            className={styles.iconButton}
            aria-label={mounted ? t('header.favoritesAriaLabel') : 'Любими'}
            onClick={() => {
              if (user) {
                router.push('/favorites');
              } else {
                openAuthModal('login');
              }
            }}
          >
            <Heart size={24} color="white" weight="fill" />
          </button>

          <div className={styles.languageSelector}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className={styles.languageButton}
              aria-label="Change language"
            >
              <Globe size={20} color="white" />
              <span suppressHydrationWarning>{currentLanguageLabel}</span>
            </button>
            {isLanguageMenuOpen && (
              <div className={styles.languageMenu}>
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
              </div>
            )}
          </div>

          <div className={styles.userMenuWrapper} ref={userMenuRef}>
            <button
              type="button"
              className={styles.userMenuButton}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <User size={20} color="white" weight={user ? 'fill' : 'regular'} />
              {isAdmin && pendingCount > 0 && (
                <span 
                  className={styles.badge}
                  aria-label={`${pendingCount} ${t('nav.pendingReviews')}`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            {isUserMenuOpen && (
              <div className={styles.userMenu}>
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
              </div>
            )}
          </div>

          <div className={styles.audioPlayerWrapper}>
            <AudioPlayer src="/soft-piano.mp3" label={t('header.ambienceLabel')} />
            {showAmbienceMessage && (
              <div className={styles.ambienceMessage}>
                <span suppressHydrationWarning>{t('header.ambienceMessage')}</span>
              </div>
            )}
          </div>

          <button
            ref={mobileMenuButtonRef}
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={mounted ? t('header.toggleMenuAriaLabel') : 'Toggle menu'}
          >
            {isMobileMenuOpen ? <X size={24} color="white" /> : <List size={24} color="white" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav ref={mobileMenuRef} className={styles.mobileNav}>
          <div className={styles.mobileLanguageSelector}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className={styles.mobileLanguageButton}
              aria-label="Change language"
            >
              <Globe size={20} />
              <span suppressHydrationWarning>{currentLanguageLabel}</span>
            </button>
            {isLanguageMenuOpen && (
              <div className={styles.mobileLanguageMenu}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`${styles.mobileLanguageOption} ${i18n.language === lang.code ? styles.active : ''
                      }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (user) {
                router.push('/favorites');
              } else {
                openAuthModal('login');
              }
            }}
            className={styles.mobileFavoritesLink}
            type="button"
          >
            <Heart size={20} />
            <span suppressHydrationWarning>{t('nav.favorites')}</span>
          </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isPostProperty = item.href === '/post-property';
              
              if (isPostProperty) {
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (loading) return;
                      if (user) {
                        router.push('/post-property');
                      } else {
                        setRedirectPath('/post-property');
                        openAuthModal('login');
                      }
                    }}
                    className={`${styles.mobileNavLink} ${pathname === item.href ? styles.active : ''
                      }`}
                    type="button"
                  >
                    <Icon size={20} />
                    <span suppressHydrationWarning>{item.label}</span>
                  </button>
                );
              }
              
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
        </nav>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Login Success Toast */}
      <Toast
        message={t('flashMessages.loginSuccess')}
        isVisible={showLoginToast}
        onClose={() => setShowLoginToast(false)}
        duration={3000}
      />
    </header>
  );
}








