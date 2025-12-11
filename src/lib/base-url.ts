/**
 * Get the base URL for the application
 * - Uses NEXT_PUBLIC_BASE_URL if explicitly set
 * - In development (localhost), defaults to http://localhost:3000
 * - In production, defaults to https://brokerbulgaria.bg
 * - For Vercel deployments, can use VERCEL_URL
 */
export function getBaseUrl(): string {
  // If explicitly set, use it
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Check if we're in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, use localhost
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }

  // Check for Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Production default
  return 'https://brokerbulgaria.bg';
}

/**
 * Get base URL for client-side code (uses window.location.origin)
 */
export function getClientBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return getBaseUrl();
}








