'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { propertyTypes } from '@/data/propertyTypes';

const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    {
        ssr: false,
        loading: () => {
            // #region agent log
            if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'map-filters/[type]/page.tsx:loading', message: 'Dynamic import loading component rendered', data: { pathname: window.location.pathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'map-loading-investigation', hypothesisId: 'A,B' }) }).catch((err: any) => { const errMsg = (err?.message || 'unknown').toString(); console.warn('[DEBUG] Loading log fetch blocked:', errMsg); });
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

export default function PropertyTypePage() {
    const router = useRouter();
    const params = useParams<{ type?: string | string[] }>();
    const propertyTypeParam = params?.type;
    const propertyTypeId = useMemo(() => {
        if (!propertyTypeParam) {
            return null;
        }
        return Array.isArray(propertyTypeParam) ? propertyTypeParam[0] : propertyTypeParam;
    }, [propertyTypeParam]);
    const isValidPropertyType = useMemo(() => {
        if (!propertyTypeId) {
            return false;
        }
        return propertyTypes.some((type) => type.id === propertyTypeId);
    }, [propertyTypeId]);

    useEffect(() => {
        if (propertyTypeId && !isValidPropertyType) {
            router.replace('/map-filters');
        }
    }, [isValidPropertyType, propertyTypeId, router]);

    if (!propertyTypeId || !isValidPropertyType) {
        return null;
    }

    return <MapFiltersPage initialPropertyType={propertyTypeId} />;
}

