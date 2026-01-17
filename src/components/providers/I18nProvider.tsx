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
  if (hasWindow) {
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'I18nProvider.tsx:14', message: 'I18nProvider render', data: { initialLanguage, initialResolvedLanguage, hasWindow, savedLangBefore, isServer }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'blocking-investigation', hypothesisId: 'A,B,E' }) }).catch((err: any) => { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] I18nProvider fetch blocked:', errMsg); fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'I18nProvider.tsx:14-error', message: 'I18nProvider fetch error', data: { error: errMsg, errorType: (err?.name || 'unknown').toString(), isBlockedByClient: errMsg.includes('BLOCKED_BY_CLIENT') || errMsg.includes('blocked') }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'blocking-investigation', hypothesisId: 'C' }) }).catch(() => {}); });
  }
  // #endregion

  useEffect(() => {
    // Initialize i18n on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('i18nextLng') || 'bg';
      const currentBefore = i18n.language || i18n.resolvedLanguage || 'unknown';
      // #region agent log
      const testBeforeFetch = async () => { try { const res = await fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'I18nProvider.tsx:23', message: 'I18nProvider useEffect - BEFORE changeLanguage', data: { savedLanguage, currentBefore, willChange: savedLanguage !== currentBefore }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'blocking-investigation', hypothesisId: 'B,D' }) }); } catch (err: any) { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] I18nProvider before fetch blocked:', errMsg); } };
      testBeforeFetch();
      // #endregion
      i18n.changeLanguage(savedLanguage);
      const currentAfter = i18n.language || i18n.resolvedLanguage || 'unknown';
      // #region agent log
      const testAfterFetch = async () => { try { const res = await fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'I18nProvider.tsx:28', message: 'I18nProvider useEffect - AFTER changeLanguage', data: { savedLanguage, currentAfter, changed: currentBefore !== currentAfter }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'blocking-investigation', hypothesisId: 'B,D' }) }); } catch (err: any) { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] I18nProvider after fetch blocked:', errMsg); } };
      testAfterFetch();
      // #endregion
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}




















