'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 minute)
            gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time, previously cacheTime)
            refetchOnWindowFocus: false,
            retry: 1, // Only retry once on failure
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}




















