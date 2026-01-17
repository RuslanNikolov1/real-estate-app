'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import MapFiltersPage with SSR disabled
const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    { 
        ssr: false, // Disable server-side rendering for this component
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

export default function Page() {
    return <MapFiltersPage />;
}



