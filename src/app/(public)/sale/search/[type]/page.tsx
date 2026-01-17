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

export default function SalePropertyTypePage() {
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

    // #region agent log
    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sale/search/[type]/page.tsx:SalePropertyTypePage-render',message:'SalePropertyTypePage rendered',data:{propertyTypeId,isValidPropertyType,pathname:typeof window!=='undefined'?window.location.pathname:'N/A',timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'B,C'})}).catch(()=>{});
        }
    });
    // #endregion

    useEffect(() => {
        if (propertyTypeId && !isValidPropertyType) {
            router.replace('/sale/search');
        }
    }, [isValidPropertyType, propertyTypeId, router]);

    if (!propertyTypeId || !isValidPropertyType) {
        // #region agent log
        if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sale/search/[type]/page.tsx:early-return',message:'Early return - null render',data:{propertyTypeId,isValidPropertyType,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        return null;
    }

    // #region agent log
    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sale/search/[type]/page.tsx:before-MapFiltersPage',message:'About to render MapFiltersPage',data:{propertyTypeId,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'B'})}).catch(()=>{});
        }
    }, [propertyTypeId]);
    // #endregion

    return <MapFiltersPage initialPropertyType={propertyTypeId} />;
}

