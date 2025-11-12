'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapFiltersPage with SSR disabled
const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    { 
        ssr: false, // Disable server-side rendering for this component
        loading: () => (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Loading map...
            </div>
        )
    }
);

export default function Page() {
    return <MapFiltersPage />;
}



