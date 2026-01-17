'use client';

import dynamic from 'next/dynamic';

const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    {
        ssr: false,
        loading: () => {
            // #region agent log
            if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'rent/search/page.tsx:loading', message: 'Dynamic import loading component rendered', data: { pathname: window.location.pathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'map-loading-investigation', hypothesisId: 'A,B' }) }).catch((err: any) => { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] Loading log fetch blocked:', errMsg); });
            }
            // #endregion
            return (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        fontSize: '1.2rem',
                        color: '#666',
                        backgroundColor: '#e0e0e0'
                    }}
                >
                    Loading map...
                </div>
            );
        }
    }
);

export default function RentSearchPage() {
    return <MapFiltersPage />;
}

