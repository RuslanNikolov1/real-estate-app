'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import MapFiltersPage with SSR disabled
const MapFiltersPage = dynamic(
    () => import('@/features/map-filters/MapFiltersPage').then((mod) => ({ default: mod.MapFiltersPage })),
    { 
        ssr: false, // Disable server-side rendering for this component
        loading: () => {
            // #region agent log
            if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'map-filters/page.tsx:loading',message:'Dynamic import loading component rendered',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'A'})}).catch(()=>{});
            }
            // #endregion
            return null;
        }
    }
);

export default function Page() {
    const [mounted, setMounted] = useState(false);
    
    // #region agent log
    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'map-filters/page.tsx:Page-render',message:'Page component rendered',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'B,C'})}).catch(()=>{});
        }
    });
    // #endregion
    
    useEffect(() => {
        setMounted(true);
        // #region agent log
        if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'map-filters/page.tsx:Page-mounted',message:'Page component mounted',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'whitescreen-investigation',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
    }, []);
    
    return <MapFiltersPage />;
}



