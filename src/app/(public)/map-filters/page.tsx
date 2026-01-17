'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapFiltersPage with SSR disabled
const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    { 
        ssr: false, // Disable server-side rendering for this component
        loading: () => null
    }
);

export default function Page() {
    return <MapFiltersPage />;
}



