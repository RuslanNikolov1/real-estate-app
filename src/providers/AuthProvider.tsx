'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/contexts/AuthContext';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state - non-blocking
  useEffect(() => {
    let mounted = true;

    // Get initial session (non-blocking)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      // If session check fails, still set loading to false to avoid blocking
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle auth errors and return user-friendly messages
  const handleAuthError = (error: AuthError | null): string | null => {
    if (!error) return null;

    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Невалиден имейл или парола',
      'User already registered': 'Потребителят вече е регистриран',
      'Email not confirmed': 'Имейлът не е потвърден',
      'Invalid email': 'Невалиден имейл адрес',
      'Password should be at least 6 characters': 'Паролата трябва да бъде поне 6 символа',
    };

    return errorMessages[error.message] || 'Възникна грешка. Моля, опитайте отново.';
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: handleAuthError(error) };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'Възникна грешка. Моля, опитайте отново.' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { error: handleAuthError(error) };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: 'Възникна грешка. Моля, опитайте отново.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      // Check for redirect path in sessionStorage
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      const redirectTo = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(redirectPath)}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
