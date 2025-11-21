'use client';

import dynamic from 'next/dynamic';

const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    {
        ssr: false,
        loading: () => (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    fontSize: '1.2rem',
                    color: '#666'
                }}
            >
                Loading map...
            </div>
        )
    }
);

export default function RentSearchPage() {
    return <MapFiltersPage />;
}

