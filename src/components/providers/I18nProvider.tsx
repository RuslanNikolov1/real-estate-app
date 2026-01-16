'use client';

import { I18nextProvider } from 'react-i18next';
import { ReactNode, useEffect } from 'react';
import i18n from '@/lib/i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  // #region agent log
  const initialLanguage = i18n.language || i18n.resolvedLanguage || 'unknown';
  const initialResolvedLanguage = i18n.resolvedLanguage || 'unknown';
  const hasWindow = typeof window !== 'undefined';
  const savedLangBefore = hasWindow ? (localStorage.getItem('i18nextLng') || 'none') : 'N/A';
  const isServer = typeof window === 'undefined';
  fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'I18nProvider.tsx:7',message:'I18nProvider render',data:{initialLanguage,initialResolvedLanguage,hasWindow,savedLangBefore,isServer},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B,C,E'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // Initialize i18n on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('i18nextLng') || 'bg';
      const currentBefore = i18n.language || i18n.resolvedLanguage || 'unknown';
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'I18nProvider.tsx:15',message:'I18nProvider useEffect - BEFORE changeLanguage',data:{savedLanguage,currentBefore,willChange:savedLanguage !== currentBefore},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
      i18n.changeLanguage(savedLanguage);
      const currentAfter = i18n.language || i18n.resolvedLanguage || 'unknown';
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'I18nProvider.tsx:20',message:'I18nProvider useEffect - AFTER changeLanguage',data:{savedLanguage,currentAfter,changed:currentBefore !== currentAfter},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}




















