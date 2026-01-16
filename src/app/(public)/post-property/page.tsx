'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin';
import { AddPropertyPage } from '@/features/admin/properties/AddPropertyPage';
import { AuthModal } from '@/features/auth/components/AuthModal';

export default function PostPropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setRedirectPath, clearRedirectPath } = useRedirectAfterLogin();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Set redirect path when user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      // User is not logged in, store redirect and show auth modal
      setRedirectPath('/post-property');
      setAuthModalOpen(true);
    }
  }, [user, loading, setRedirectPath]);

  // Handle successful login - close modal when user becomes authenticated
  useEffect(() => {
    if (!loading && user && authModalOpen) {
      // User just logged in, close the modal
      setAuthModalOpen(false);
    }
  }, [user, loading, authModalOpen]);

  const handleAuthSuccess = () => {
    // Modal will close automatically via useEffect when user state updates
  };

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, show auth modal
  if (!user) {
    return (
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          clearRedirectPath();
          router.push('/');
        }}
        initialTab="login"
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // User is authenticated, show the form
  return <AddPropertyPage />;
}
