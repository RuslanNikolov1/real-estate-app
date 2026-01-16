'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const REDIRECT_KEY = 'redirectAfterLogin';
const POST_PROPERTY_PATH = '/post-property';

/**
 * Centralized hook to handle redirect after login.
 * Only redirects when the redirect path is '/post-property'.
 * 
 * @returns Function to set redirect path
 */
export function useRedirectAfterLogin() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Set redirect path in sessionStorage
  const setRedirectPath = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(REDIRECT_KEY, path);
    }
  }, []);

  // Clear redirect path from sessionStorage
  const clearRedirectPath = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(REDIRECT_KEY);
    }
  }, []);

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    // Only proceed if auth is loaded and user is authenticated
    if (loading || !user) {
      return;
    }

    // Check for redirect path in sessionStorage
    if (typeof window === 'undefined') {
      return;
    }

    const redirectPath = sessionStorage.getItem(REDIRECT_KEY);
    
    // Only redirect if path is /post-property (safety check)
    if (redirectPath === POST_PROPERTY_PATH) {
      // Clear the redirect path immediately to prevent multiple redirects
      sessionStorage.removeItem(REDIRECT_KEY);
      
      // Check if we're already on the target page
      if (window.location.pathname !== POST_PROPERTY_PATH) {
        // Small delay to ensure auth state is fully settled
        const timer = setTimeout(() => {
          router.push(POST_PROPERTY_PATH);
        }, 100);
        
        return () => clearTimeout(timer);
      }
      // If already on the page, redirect path is cleared above
      // No redirect needed
    }
  }, [user, loading, router]);

  return {
    setRedirectPath,
    clearRedirectPath,
  };
}