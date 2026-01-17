'use client';

import { useEffect, useMemo, useState } from 'react';
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
    const [isReady, setIsReady] = useState(false);
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
            router.replace('/sale/search');
            return;
        }

        // Delay content display by 1 second to prevent white screen
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isValidPropertyType, propertyTypeId, router]);

    if (!propertyTypeId || !isValidPropertyType) {
        return null;
    }

    // Show loading screen during delay
    if (!isReady) {
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

    return <MapFiltersPage initialPropertyType={propertyTypeId} />;
}

